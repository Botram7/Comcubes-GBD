import { purgeFreshImportOptimized } from "../utils/purgeFreshImportOptimized";

async function main() {
  const aggregatedFile = "/tmp/aggregated_data.tsv";
  
  console.log("🚀 Starting optimized database purge and fresh import...\n");
  
  try {
    const stats = await purgeFreshImportOptimized(aggregatedFile);
    
    console.log("\n✅ PURGE AND FRESH IMPORT COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

main();
