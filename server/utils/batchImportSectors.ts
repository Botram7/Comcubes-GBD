import { parseCSVContent, importCompanyFromCSV, ImportResult } from './csvImporter';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SectorImportConfig {
  fileName: string;
  sectorName: string;
}

const SECTOR_CONFIGS: SectorImportConfig[] = [
  {
    fileName: 'deepseek_csv_20251009_4c36bb_ Media and Entertainment_1760042926112.txt',
    sectorName: 'Media and Entertainment'
  },
  {
    fileName: 'deepseek_csv_20251009_bc1b7f_Professional Services_1760042948267.txt',
    sectorName: 'Professional Services'
  },
  {
    fileName: 'deepseek_csv_20251009_b9cdfd_Real Estate_1760042998946.txt',
    sectorName: 'Real Estate'
  },
  {
    fileName: 'deepseek_csv_20251009_41795d_Retail_1760043038539.txt',
    sectorName: 'Retail'
  },
  {
    fileName: 'deepseek_csv_20251009_c12d57_Technology_1760043065128.txt',
    sectorName: 'Technology'
  },
  {
    fileName: 'deepseek_csv_20251009_bc89ff_Telecommunications and ICT_1760043190104.txt',
    sectorName: 'Telecommunications and ICT'
  },
  {
    fileName: 'deepseek_csv_20251009_3f81c2_Transportation and Logistics_1760043254680.txt',
    sectorName: 'Transportation and Logistics'
  },
  {
    fileName: 'deepseek_csv_20251009_ee1460_Travel and Tourism_1760043282831.txt',
    sectorName: 'Travel and Tourism'
  },
  {
    fileName: 'deepseek_csv_20251009_26aec0_Banking & Financial Services_1760043338237.txt',
    sectorName: 'Banking & Financial Services'
  },
  {
    fileName: 'deepseek_csv_20251009_180301_Chemicals_1760043403917.txt',
    sectorName: 'Chemicals'
  },
  {
    fileName: 'deepseek_csv_20251009_b32a40_Construction and Engineering_1760043449537.txt',
    sectorName: 'Construction and Engineering'
  },
  {
    fileName: 'deepseek_csv_20251009_dd948f_Education_1760043484293.txt',
    sectorName: 'Education'
  },
  {
    fileName: 'deepseek_csv_20251009_226aec_Energy and Utilities_1760044938517.txt',
    sectorName: 'Energy and Utilities'
  }
];

interface SectorImportReport {
  sectorName: string;
  fileName: string;
  totalRows: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  countryStats: {
    [key: string]: number;
  };
  duration: number;
  errorDetails: string[];
}

export async function importAllSectors(): Promise<SectorImportReport[]> {
  const reports: SectorImportReport[] = [];
  
  for (const config of SECTOR_CONFIGS) {
    const report = await importSector(config);
    reports.push(report);
  }
  
  return reports;
}

export async function importSector(config: SectorImportConfig): Promise<SectorImportReport> {
  const startTime = Date.now();
  const report: SectorImportReport = {
    sectorName: config.sectorName,
    fileName: config.fileName,
    totalRows: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
    countryStats: {},
    duration: 0,
    errorDetails: []
  };

  try {
    // Read CSV file
    const filePath = join(process.cwd(), 'attached_assets', config.fileName);
    const csvContent = readFileSync(filePath, 'utf-8');
    
    // Parse CSV
    const rows = parseCSVContent(csvContent);
    report.totalRows = rows.length;
    
    console.log(`\n📊 Importing ${config.sectorName}: ${rows.length} companies`);
    
    // Import each company
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const result: ImportResult = await importCompanyFromCSV(row, config.sectorName);
      
      // Update statistics
      if (result.success) {
        if (result.action === 'created') {
          report.created++;
        } else if (result.action === 'updated') {
          report.updated++;
        } else if (result.action === 'skipped') {
          report.skipped++;
        }
        
        // Track country statistics
        if (result.countryMatch?.matchedCountry) {
          const country = result.countryMatch.matchedCountry;
          report.countryStats[country] = (report.countryStats[country] || 0) + 1;
        }
      } else {
        report.errors++;
        report.errorDetails.push(result.message);
      }
      
      // Progress indicator every 50 companies
      if ((i + 1) % 50 === 0) {
        console.log(`  Progress: ${i + 1}/${rows.length} companies processed`);
      }
    }
    
    report.duration = Date.now() - startTime;
    
    console.log(`✅ ${config.sectorName} completed in ${(report.duration / 1000).toFixed(2)}s`);
    console.log(`   Created: ${report.created}, Updated: ${report.updated}, Errors: ${report.errors}`);
    
  } catch (error) {
    console.error(`❌ Error importing ${config.sectorName}:`, error);
    report.errors++;
    report.errorDetails.push(error instanceof Error ? error.message : String(error));
  }
  
  return report;
}

export function generateImportReport(reports: SectorImportReport[]): string {
  let output = '\n';
  output += '═'.repeat(80) + '\n';
  output += '  📊 BATCH SECTOR IMPORT REPORT\n';
  output += '═'.repeat(80) + '\n\n';
  
  // Overall statistics
  const totals = reports.reduce((acc, report) => ({
    totalRows: acc.totalRows + report.totalRows,
    created: acc.created + report.created,
    updated: acc.updated + report.updated,
    errors: acc.errors + report.errors,
    duration: acc.duration + report.duration
  }), { totalRows: 0, created: 0, updated: 0, errors: 0, duration: 0 });
  
  output += '📈 OVERALL STATISTICS\n';
  output += '─'.repeat(80) + '\n';
  output += `Total Companies Processed: ${totals.totalRows}\n`;
  output += `✅ Created: ${totals.created}\n`;
  output += `🔄 Updated: ${totals.updated}\n`;
  output += `❌ Errors: ${totals.errors}\n`;
  output += `⏱️  Total Duration: ${(totals.duration / 1000).toFixed(2)}s\n`;
  output += `📊 Success Rate: ${((totals.created + totals.updated) / totals.totalRows * 100).toFixed(2)}%\n\n`;
  
  // Individual sector reports
  output += '📋 SECTOR-BY-SECTOR BREAKDOWN\n';
  output += '─'.repeat(80) + '\n\n';
  
  for (const report of reports) {
    output += `🏢 ${report.sectorName}\n`;
    output += `   File: ${report.fileName}\n`;
    output += `   Companies: ${report.totalRows} | Created: ${report.created} | Updated: ${report.updated} | Errors: ${report.errors}\n`;
    output += `   Duration: ${(report.duration / 1000).toFixed(2)}s\n`;
    
    // Top 5 countries
    const topCountries = Object.entries(report.countryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    if (topCountries.length > 0) {
      output += `   Top Countries: ${topCountries.map(([country, count]) => `${country} (${count})`).join(', ')}\n`;
    }
    
    // Show first 3 errors if any
    if (report.errorDetails.length > 0) {
      output += `   ⚠️  Errors (first 3):\n`;
      report.errorDetails.slice(0, 3).forEach(error => {
        output += `      - ${error}\n`;
      });
    }
    
    output += '\n';
  }
  
  // Geographic distribution summary
  output += '🌍 GEOGRAPHIC DISTRIBUTION SUMMARY\n';
  output += '─'.repeat(80) + '\n';
  
  const allCountries: { [key: string]: number } = {};
  reports.forEach(report => {
    Object.entries(report.countryStats).forEach(([country, count]) => {
      allCountries[country] = (allCountries[country] || 0) + count;
    });
  });
  
  const topGlobalCountries = Object.entries(allCountries)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);
  
  topGlobalCountries.forEach(([country, count], index) => {
    const percentage = (count / totals.totalRows * 100).toFixed(2);
    output += `${(index + 1).toString().padStart(2)}. ${country.padEnd(30)} ${count.toString().padStart(5)} companies (${percentage}%)\n`;
  });
  
  output += '\n';
  output += '═'.repeat(80) + '\n';
  output += `  Import completed at ${new Date().toLocaleString()}\n`;
  output += '═'.repeat(80) + '\n';
  
  return output;
}
