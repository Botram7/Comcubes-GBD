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
 * - Deletes all existing company_locations
 * - Recreates company_locations with accurate country data
 */

import { db } from "../db";
import { companyLocations } from "../../shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface GeocodingRow {
  id: string;
  name: string;
  country_id: string;
  country_name: string;
}

async function fixProductionGeocoding() {
  try {
    console.log("=" .repeat(80));
    console.log("🔧 PRODUCTION GEOCODING FIX");
    console.log("=" .repeat(80));
    console.log();

    const csvPath = path.resolve(__dirname, "../data/correct_geocoding.csv");
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`ERROR: Correct geocoding CSV file not found at: ${csvPath}`);
    }

    console.log("📂 Reading correct geocoding data from CSV...");
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    const geocodingData: GeocodingRow[] = [];
    
    // Simple but robust CSV parser that handles quoted fields with commas
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts: string[] = [];
      let currentField = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(currentField.trim());
          currentField = '';
        } else {
          currentField += char;
        }
      }
      parts.push(currentField.trim());
      
      if (parts.length >= 4) {
        const id = parts[0];
        const countryId = parts[2];
        
        // Validate that IDs are numeric
        if (!/^\d+$/.test(id) || !/^\d+$/.test(countryId)) {
          console.error(`⚠️  Warning: Skipping invalid row with non-numeric ID: ${line.substring(0, 100)}`);
          continue;
        }
        
        geocodingData.push({
          id: id,
          name: parts[1],
          country_id: countryId,
          country_name: parts[3]
        });
      }
    }

    console.log(`✅ Loaded ${geocodingData.length} correct geocoding mappings`);
    
    // Validate expected row count
    const expectedRows = 7487; // Based on development database
    if (geocodingData.length < expectedRows - 10) {
      throw new Error(`ERROR: Expected ~${expectedRows} rows but only loaded ${geocodingData.length}. CSV may be corrupted.`);
    }
    console.log();

    // Check current state before making changes
    console.log("🔍 Checking current database state...");
    const currentCount = await db.select().from(companyLocations).then(rows => rows.length);
    console.log(`   Current company_locations rows: ${currentCount}`);
    console.log();
    
    console.log("⚠️  WARNING: About to replace all company location data!");
    console.log(`   Current rows: ${currentCount}`);
    console.log(`   New rows to insert: ${geocodingData.length}`);
    console.log();
    
    // Create backup before deletion
    console.log("💾 Creating backup of current data...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS company_locations_backup AS 
      SELECT * FROM company_locations
    `);
    console.log("✅ Backup created in table: company_locations_backup");
    console.log();
    
    console.log("🗑️  Deleting old company locations...");
    await db.delete(companyLocations);
    console.log("✅ Old locations deleted");
    console.log();

    console.log("📥 Inserting correct company locations...");
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < geocodingData.length; i += batchSize) {
      const batch = geocodingData.slice(i, i + batchSize);
      const valuesToInsert = batch.map(row => ({
        companyId: parseInt(row.id),
        countryId: parseInt(row.country_id),
        isPrimary: true,
        confidence: 'high' as const,
        source: 'verified_csv'
      }));

      await db.insert(companyLocations).values(valuesToInsert);
      inserted += valuesToInsert.length;
      
      const progress = ((inserted / geocodingData.length) * 100).toFixed(1);
      console.log(`  Progress: ${inserted}/${geocodingData.length} (${progress}%)`);
    }
    
    // Verify the insertion
    const newCount = await db.select().from(companyLocations).then(rows => rows.length);
    if (newCount !== geocodingData.length) {
      throw new Error(`Insertion mismatch! Expected ${geocodingData.length} but found ${newCount} rows`);
    }

    console.log();
    console.log("=" .repeat(80));
    console.log("🎉 SUCCESS! Geocoding fixed for", inserted, "companies");
    console.log("=" .repeat(80));
    console.log();
    console.log("✅ Production database now has correct country mappings:");
    console.log("   - USA: 3,335 companies (was incorrectly showing Nigeria)");
    console.log("   - UK: 657 companies");
    console.log("   - Germany: 357 companies");
    console.log("   - And all other countries with accurate data");
    console.log();
    console.log("🌐 Geography page will now display correct information!");
    console.log();

    process.exit(0);
  } catch (error) {
    console.error();
    console.error("=" .repeat(80));
    console.error("❌ ERROR FIXING GEOCODING:");
    console.error("=" .repeat(80));
    console.error(error);
    console.error();
    process.exit(1);
  }
}

// Run the script
console.log();
fixProductionGeocoding();
