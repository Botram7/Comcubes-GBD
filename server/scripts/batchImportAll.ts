import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSVContent, importCompanyFromCSV, type ImportResult } from '../utils/csvImporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sector name mapping: CSV file name => Database sector name
const SECTOR_MAPPING: Record<string, string> = {
  'Aerospace and Defense': 'Aerospace and Defense',
  'Agriculture': 'Agriculture',
  'Automotive': 'Automotive',
  'Banking and Financial Services': 'Banking and Financial Services',
  'Biotechnology': 'Biotechnology',
  'Chemicals': 'Chemicals',
  'Construction and Real Estate': 'Construction and Real Estate',
  'Consumer Goods': 'Consumer Goods',
  'Education': 'Education',
  'Energy and Utilities': 'Energy and Utilities',
  'Healthcare': 'Healthcare',
  'Hospitality and Tourism': 'Hospitality and Tourism',
  'Information Technology': 'Information Technology',
  'Insurance': 'Insurance',
  'Manufacturing': 'Manufacturing',
  'Media and Entertainment': 'Media and Entertainment',
  'Mining and Metals': 'Mining and Metals',
  'Pharmaceuticals': 'Pharmaceuticals',
  'Retail': 'Retail',
  'Telecommunications': 'Telecommunications',
  'Transportation and Logistics': 'Transportation and Logistics'
};

interface SectorImportSummary {
  sectorName: string;
  fileName: string;
  totalCompanies: number;
  created: number;
  updated: number;
  errors: number;
  topCountries: Array<{country: string; count: number; percentage: number}>;
  accuracy: number;
  duration: number;
}

async function importSectorFromFile(fileName: string, sectorName: string): Promise<SectorImportSummary> {
  const startTime = Date.now();
  
  const csvPath = path.join(__dirname, '../../attached_assets', fileName);
  
  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const companies = parseCSVContent(csvContent);

  const results: ImportResult[] = [];
  const countryDistribution: Record<string, number> = {};
  const confidenceStats = { exact: 0, alias: 0, fuzzy: 0, none: 0 };
  const actionCounts = { created: 0, updated: 0, skipped: 0, error: 0 };

  for (const company of companies) {
    const result = await importCompanyFromCSV(company, sectorName);
    
    results.push(result);
    actionCounts[result.action]++;

    if (result.success && result.countryMatch) {
      const country = result.countryMatch.matchedCountry;
      countryDistribution[country] = (countryDistribution[country] || 0) + 1;
      
      const confidence = result.countryMatch.confidence;
      if (confidence in confidenceStats) {
        confidenceStats[confidence as keyof typeof confidenceStats]++;
      }
    }
  }

  const topCountries = Object.entries(countryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([country, count]) => ({
      country,
      count,
      percentage: parseFloat(((count / companies.length) * 100).toFixed(1))
    }));

  const highConfidenceMatches = confidenceStats.exact + confidenceStats.alias;
  const accuracy = parseFloat(((highConfidenceMatches / companies.length) * 100).toFixed(1));

  return {
    sectorName,
    fileName,
    totalCompanies: companies.length,
    created: actionCounts.created,
    updated: actionCounts.updated,
    errors: actionCounts.error,
    topCountries,
    accuracy,
    duration: Date.now() - startTime
  };
}

async function batchImportAll() {
  console.log('🚀 COMCUBES Batch Import System\n');
  console.log('📂 Scanning for CSV files...\n');

  const assetsDir = path.join(__dirname, '../../attached_assets');
  const files = fs.readdirSync(assetsDir).filter(f => f.includes('deepseek_csv_') && f.endsWith('.txt'));

  console.log(`Found ${files.length} CSV files to process\n`);

  const summaries: SectorImportSummary[] = [];
  const overallStats = {
    totalSectors: 0,
    totalCompanies: 0,
    totalCreated: 0,
    totalUpdated: 0,
    totalErrors: 0
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Extract sector name from filename
    const match = file.match(/deepseek_csv_\d+_[a-f0-9]+_(.+)_\d+\.txt/);
    if (!match) {
      console.log(`⚠️  Skipping file with unexpected format: ${file}`);
      continue;
    }

    const filenameSectorName = match[1];
    const sectorName = SECTOR_MAPPING[filenameSectorName] || filenameSectorName;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`📦 [${i + 1}/${files.length}] Processing: ${sectorName}`);
    console.log(`${'='.repeat(80)}`);

    try {
      const summary = await importSectorFromFile(file, sectorName);
      summaries.push(summary);

      overallStats.totalSectors++;
      overallStats.totalCompanies += summary.totalCompanies;
      overallStats.totalCreated += summary.created;
      overallStats.totalUpdated += summary.updated;
      overallStats.totalErrors += summary.errors;

      console.log(`\n✅ Completed: ${sectorName}`);
      console.log(`   Companies: ${summary.totalCompanies} | Created: ${summary.created} | Updated: ${summary.updated} | Errors: ${summary.errors}`);
      console.log(`   Accuracy: ${summary.accuracy}% | Duration: ${(summary.duration / 1000).toFixed(1)}s`);
      console.log(`   Top Countries: ${summary.topCountries.map(c => `${c.country} (${c.percentage}%)`).join(', ')}`);

    } catch (error) {
      console.error(`❌ Failed to import ${sectorName}:`, error);
      overallStats.totalErrors++;
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('📊 BATCH IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`\n✨ Overall Statistics:`);
  console.log(`   Sectors Processed: ${overallStats.totalSectors}`);
  console.log(`   Total Companies: ${overallStats.totalCompanies}`);
  console.log(`   Created: ${overallStats.totalCreated}`);
  console.log(`   Updated: ${overallStats.totalUpdated}`);
  console.log(`   Errors: ${overallStats.totalErrors}`);
  console.log(`   Success Rate: ${(((overallStats.totalCompanies - overallStats.totalErrors) / overallStats.totalCompanies) * 100).toFixed(1)}%`);

  console.log(`\n📈 Sector-by-Sector Results:\n`);
  
  summaries
    .sort((a, b) => b.totalCompanies - a.totalCompanies)
    .forEach((summary, index) => {
      const status = summary.accuracy >= 95 ? '🏆' : summary.accuracy >= 90 ? '✅' : '⚠️';
      console.log(`   ${(index + 1).toString().padStart(2)}. ${status} ${summary.sectorName.padEnd(40)} ${summary.totalCompanies.toString().padStart(5)} companies | ${summary.accuracy}% accuracy`);
    });

  console.log(`\n🎯 Quality Assessment:`);
  const highAccuracySectors = summaries.filter(s => s.accuracy >= 95).length;
  const goodAccuracySectors = summaries.filter(s => s.accuracy >= 90 && s.accuracy < 95).length;
  const reviewNeededSectors = summaries.filter(s => s.accuracy < 90).length;

  console.log(`   🏆 Excellent (≥95%): ${highAccuracySectors} sectors`);
  console.log(`   ✅ Good (90-94%): ${goodAccuracySectors} sectors`);
  if (reviewNeededSectors > 0) {
    console.log(`   ⚠️  Review Needed (<90%): ${reviewNeededSectors} sectors`);
  }

  const avgAccuracy = summaries.reduce((sum, s) => sum + s.accuracy, 0) / summaries.length;
  console.log(`   📊 Average Accuracy: ${avgAccuracy.toFixed(1)}%`);

  console.log(`\n✨ Batch import completed!\n`);
  process.exit(0);
}

batchImportAll().catch(error => {
  console.error('❌ Batch import failed:', error);
  process.exit(1);
});
