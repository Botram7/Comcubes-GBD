import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSVContent, importCompanyFromCSV, type ImportResult } from '../utils/csvImporter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importAerospaceDefense() {
  console.log('🚀 Starting Aerospace & Defense CSV Import...\n');

  const csvPath = path.join(__dirname, '../../attached_assets/deepseek_csv_20251007_d8c6f9_Aerospace and Defense_1759972191955.txt');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const companies = parseCSVContent(csvContent);

  console.log(`📊 Found ${companies.length} companies to process\n`);

  const results: ImportResult[] = [];
  const countryDistribution: Record<string, number> = {};
  const actionCounts = {
    created: 0,
    updated: 0,
    skipped: 0,
    error: 0
  };

  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    const result = await importCompanyFromCSV(company, 'Aerospace and Defense');
    
    results.push(result);
    actionCounts[result.action]++;

    if (result.success && result.countryMatch) {
      const country = result.countryMatch.matchedCountry;
      countryDistribution[country] = (countryDistribution[country] || 0) + 1;
    }

    // Progress indicator every 20 companies
    if ((i + 1) % 20 === 0) {
      console.log(`Progress: ${i + 1}/${companies.length} companies processed...`);
    }
  }

  console.log('\n✅ Import Complete!\n');
  console.log('📈 Summary:');
  console.log(`   Created: ${actionCounts.created}`);
  console.log(`   Updated: ${actionCounts.updated}`);
  console.log(`   Errors: ${actionCounts.error}`);
  console.log('\n🌍 Geographic Distribution:');
  
  const sortedCountries = Object.entries(countryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  sortedCountries.forEach(([country, count]) => {
    const percentage = ((count / companies.length) * 100).toFixed(1);
    console.log(`   ${country.padEnd(30)} ${count.toString().padStart(4)} (${percentage}%)`);
  });

  // Show errors if any
  const errors = results.filter(r => r.action === 'error');
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => {
      console.log(`   ${error.message}`);
    });
  }

  // Validation warnings
  console.log('\n🔍 Quality Checks:');
  
  // Check for country concentration issues
  const nigeriaCount = countryDistribution['Nigeria'] || 0;
  const usaCount = countryDistribution['United States'] || 0;
  const nigeriaPercentage = (nigeriaCount / companies.length) * 100;
  
  if (nigeriaPercentage > 50) {
    console.log(`   ⚠️  WARNING: Nigeria has ${nigeriaPercentage.toFixed(1)}% of companies - possible data quality issue`);
  } else {
    console.log(`   ✅ Geographic distribution looks realistic`);
  }

  // Check for verification status
  const verifiedCount = results.filter(r => 
    r.success && r.message.includes('verified')
  ).length;
  console.log(`   ✅ ${verifiedCount} companies marked as verified`);

  // Check for country matching confidence
  const highConfidence = results.filter(r => 
    r.countryMatch?.confidence === 'exact' || r.countryMatch?.confidence === 'alias'
  ).length;
  const lowConfidence = results.filter(r => 
    r.countryMatch?.confidence === 'fuzzy'
  ).length;
  
  console.log(`   ✅ High confidence country matches: ${highConfidence}`);
  if (lowConfidence > 0) {
    console.log(`   ⚠️  Low confidence country matches: ${lowConfidence}`);
  }

  console.log('\n✨ Import script completed successfully!\n');
  process.exit(0);
}

importAerospaceDefense().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
