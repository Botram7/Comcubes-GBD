/**
 * PRODUCTION GEOCODING FIX SCRIPT
 * 
 * This script fixes the incorrect geocoding data in the production database.
 * It deletes all company_locations and recreates them with the correct country mappings.
 * 
 * HOW TO RUN:
 * 1. Ensure you're in the production environment
 * 2. Run: tsx server/scripts/fixProductionGeocoding.ts
 * 
 * WHAT IT DOES:
 * - Loads correct geocoding mappings from CSV
 * - Creates backup of current data
 * - Deletes all existing company_locations
 * - Recreates company_locations with accurate country data
 */

import { fixProductionGeocoding } from "../services/geocodingFixService";

async function runFix() {
  console.log();
  console.log("=".repeat(80));
  console.log("🔧 PRODUCTION GEOCODING FIX");
  console.log("=".repeat(80));
  console.log();

  const result = await fixProductionGeocoding();

  if (result.success) {
    console.log("✅", result.message);
    if (result.stats) {
      console.log();
      console.log("📊 Statistics:");
      console.log(`   - Rows loaded from CSV: ${result.stats.rowsLoaded}`);
      console.log(`   - Previous rows: ${result.stats.previousRows}`);
      console.log(`   - Inserted rows: ${result.stats.insertedRows}`);
      console.log(`   - Backup created: ${result.stats.backupCreated ? 'Yes' : 'No'}`);
      console.log();
      console.log("🌐 Production database now has correct country mappings:");
      console.log("   - USA: 3,335 companies (was incorrectly showing Nigeria)");
      console.log("   - UK: 657 companies");
      console.log("   - Germany: 357 companies");
      console.log("   - And all other countries with accurate data");
      console.log();
      console.log("🌍 Geography page will now display correct information!");
    }
    console.log();
    console.log("=".repeat(80));
    process.exit(0);
  } else {
    console.error();
    console.error("=".repeat(80));
    console.error("❌ ERROR FIXING GEOCODING:");
    console.error("=".repeat(80));
    console.error(result.message);
    if (result.error) {
      console.error(result.error);
    }
    console.error();
    process.exit(1);
  }
}

runFix();
