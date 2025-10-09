import { importSector, generateImportReport } from './batchImportSectors';
import { writeFileSync } from 'fs';
import { join } from 'path';

const SECTORS = [
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

async function main() {
  const sectorIndex = parseInt(process.argv[2] || '0', 10);
  
  if (sectorIndex < 0 || sectorIndex >= SECTORS.length) {
    console.error(`Invalid sector index: ${sectorIndex}. Must be between 0 and ${SECTORS.length - 1}`);
    process.exit(1);
  }
  
  const config = SECTORS[sectorIndex];
  console.log(`\n🚀 Importing sector ${sectorIndex + 1}/${SECTORS.length}: ${config.sectorName}\n`);
  
  try {
    const report = await importSector(config);
    const reportText = generateImportReport([report]);
    
    console.log(reportText);
    
    // Append to cumulative report
    const reportPath = join(process.cwd(), 'IMPORT_REPORT.md');
    const timestamp = new Date().toISOString();
    const sectorReport = `\n\n## ${config.sectorName} - ${timestamp}\n${reportText}`;
    
    try {
      const existingReport = require('fs').readFileSync(reportPath, 'utf-8');
      writeFileSync(reportPath, existingReport + sectorReport, 'utf-8');
    } catch {
      writeFileSync(reportPath, sectorReport, 'utf-8');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Import failed:`, error);
    process.exit(1);
  }
}

main();
