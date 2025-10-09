import { importAllSectors, generateImportReport } from './batchImportSectors';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('\n🚀 Starting batch sector import...\n');
  
  try {
    const reports = await importAllSectors();
    const reportText = generateImportReport(reports);
    
    // Print report to console
    console.log(reportText);
    
    // Save report to file
    const reportPath = join(process.cwd(), 'IMPORT_REPORT.md');
    writeFileSync(reportPath, reportText, 'utf-8');
    console.log(`\n📄 Full report saved to: IMPORT_REPORT.md\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();
