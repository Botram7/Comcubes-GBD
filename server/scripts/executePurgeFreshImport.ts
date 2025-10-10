import { purgeFreshImport } from "../utils/purgeFreshImport";
import * as path from "path";

async function main() {
  const aggregatedFile = "/tmp/aggregated_data.tsv";
  
  console.log("🚀 Starting complete database purge and fresh import...\n");
  
  try {
    const stats = await purgeFreshImport(aggregatedFile);
    
    console.log("\n✅ PURGE AND FRESH IMPORT COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ ERROR:", error);
    process.exit(1);
  }
}

main();
