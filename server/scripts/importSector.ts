import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSVContent, importCompanyFromCSV, type ImportResult } from '../utils/csvImporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generic sector import script
 * Usage: tsx server/scripts/importSector.ts <csv_filename> <sector_name>
 */
async function importSector() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('❌ Usage: tsx server/scripts/importSector.ts <csv_filename> <sector_name>');
    console.error('   Example: tsx server/scripts/importSector.ts "Automotive.txt" "Automotive"');
    process.exit(1);
  }

  const csvFilename = args[0];
  const sectorName = args[1];

  console.log(`🚀 Starting ${sectorName} CSV Import...\n`);

  const csvPath = path.join(__dirname, '../../attached_assets', csvFilename);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const companies = parseCSVContent(csvContent);

  console.log(`📊 Found ${companies.length} companies to process\n`);

  const results: ImportResult[] = [];
  const countryDistribution: Record<string, number> = {};
  const confidenceStats = { exact: 0, alias: 0, fuzzy: 0, none: 0 };
  const actionCounts = {
    created: 0,
    updated: 0,
    skipped: 0,
    error: 0
  };

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
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

    // Progress indicator every 25 companies
    if ((i + 1) % 25 === 0 || i === companies.length - 1) {
      const percentage = Math.round(((i + 1) / companies.length) * 100);
      console.log(`Progress: ${i + 1}/${companies.length} (${percentage}%) companies processed...`);
    }
  }

  console.log('\n✅ Import Complete!\n');
  console.log('📈 Summary:');
  console.log(`   ✨ Created: ${actionCounts.created}`);
  console.log(`   🔄 Updated: ${actionCounts.updated}`);
  console.log(`   ❌ Errors: ${actionCounts.error}`);
  
  console.log('\n🌍 Geographic Distribution (Top 20):');
  
  const sortedCountries = Object.entries(countryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  sortedCountries.forEach(([country, count], index) => {
    const percentage = ((count / companies.length) * 100).toFixed(1);
    const barLength = Math.ceil(parseFloat(percentage) / 2);
    const bar = '█'.repeat(barLength);
    console.log(`   ${(index + 1).toString().padStart(2)}. ${country.padEnd(30)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}`);
  });

  console.log('\n🎯 Country Matching Confidence:');
  console.log(`   Exact matches: ${confidenceStats.exact} (${((confidenceStats.exact / companies.length) * 100).toFixed(1)}%)`);
  console.log(`   Alias matches: ${confidenceStats.alias} (${((confidenceStats.alias / companies.length) * 100).toFixed(1)}%)`);
  console.log(`   Fuzzy matches: ${confidenceStats.fuzzy} (${((confidenceStats.fuzzy / companies.length) * 100).toFixed(1)}%)`);
  if (confidenceStats.none > 0) {
    console.log(`   ❌ Failed: ${confidenceStats.none} (${((confidenceStats.none / companies.length) * 100).toFixed(1)}%)`);
  }

  // Show errors if any
  const errors = results.filter(r => r.action === 'error');
  if (errors.length > 0) {
    console.log('\n❌ Errors Details:');
    errors.slice(0, 10).forEach(error => {
      console.log(`   • ${error.message}`);
    });
    if (errors.length > 10) {
      console.log(`   ... and ${errors.length - 10} more errors`);
    }
  }

  // Validation warnings
  console.log('\n🔍 Quality Checks:');
  
  // Check for country concentration issues
  const nigeriaCount = countryDistribution['Nigeria'] || 0;
  const nigeriaPercentage = (nigeriaCount / companies.length) * 100;
  
  if (nigeriaPercentage > 50) {
    console.log(`   ⚠️  WARNING: Nigeria has ${nigeriaPercentage.toFixed(1)}% of companies - possible data quality issue`);
  } else if (nigeriaPercentage > 20) {
    console.log(`   ⚠️  NOTICE: Nigeria has ${nigeriaPercentage.toFixed(1)}% of companies - verify if expected`);
  } else {
    console.log(`   ✅ Geographic distribution looks realistic (Nigeria: ${nigeriaPercentage.toFixed(1)}%)`);
  }

  // Check for single country dominance
  const topCountry = sortedCountries[0];
  if (topCountry) {
    const [countryName, count] = topCountry;
    const topPercentage = (count / companies.length) * 100;
    if (topPercentage > 60) {
      console.log(`   ⚠️  WARNING: ${countryName} dominates with ${topPercentage.toFixed(1)}% - verify accuracy`);
    }
  }

  // Check data completeness
  const withWebsite = results.filter(r => r.success).length;
  const dataQuality = (withWebsite / companies.length) * 100;
  console.log(`   ✅ Data quality: ${dataQuality.toFixed(1)}% companies successfully processed`);

  // Overall accuracy estimate
  const highConfidenceMatches = confidenceStats.exact + confidenceStats.alias;
  const accuracy = (highConfidenceMatches / companies.length) * 100;
  console.log(`   🎯 Geographic accuracy: ${accuracy.toFixed(1)}% (target: 95%+)`);

  if (accuracy >= 95) {
    console.log('   🏆 EXCELLENT: Meets 95%+ accuracy target!');
  } else if (accuracy >= 90) {
    console.log('   ✅ GOOD: Close to 95% accuracy target');
  } else {
    console.log('   ⚠️  REVIEW NEEDED: Below 90% accuracy - manual review recommended');
  }

  console.log(`\n✨ ${sectorName} import completed successfully!\n`);
  process.exit(0);
}

importSector().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
