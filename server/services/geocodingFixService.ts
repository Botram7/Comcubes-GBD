/**
 * Geocoding Fix Service
 * 
 * Provides reusable function to fix incorrect geocoding data in the database.
 * Uses composite key (name + sector + industry) for reliable matching across environments.
 */

import { db } from "../db";
import { companyLocations, companies } from "../../shared/schema";
import { sql, and, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface GeocodingRow {
  name: string;
  sectorName: string;
  industryName: string;
  countryId: string;
  countryName: string;
}

export interface GeocodingFixResult {
  success: boolean;
  message: string;
  stats?: {
    rowsLoaded: number;
    companiesMatched: number;
    previousRows: number;
    insertedRows: number;
    backupCreated: boolean;
    unmatchedCompanies: number;
  };
  error?: string;
  unmatchedDetails?: string[];
}

/**
 * Fixes production geocoding by replacing all company_locations with correct data
 * Uses composite key (name, sector, industry) which is guaranteed unique per schema
 */
export async function fixProductionGeocoding(): Promise<GeocodingFixResult> {
  try {
    // Use the enhanced CSV with composite keys
    const csvPath = path.join(process.cwd(), "server", "data", "geocoding_composite_key.csv");
    
    if (!fs.existsSync(csvPath)) {
      return {
        success: false,
        message: "Geocoding CSV file not found",
        error: `File not found at: ${csvPath}`
      };
    }

    console.log("📄 Reading geocoding data with composite keys...");

    // Read and parse CSV
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    const geocodingData: GeocodingRow[] = [];
    
    // Parse CSV with quoted field support
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
      
      // CSV format: name, sector_name, industry_name, country_id, country_name
      if (parts.length >= 5) {
        const countryId = parts[3];
        
        // Validate numeric country ID
        if (!/^\d+$/.test(countryId)) {
          continue;
        }
        
        geocodingData.push({
          name: parts[0],
          sectorName: parts[1],
          industryName: parts[2],
          countryId: countryId,
          countryName: parts[4]
        });
      }
    }

    console.log(`✅ Loaded ${geocodingData.length} company-country mappings from CSV`);

    // Validate expected row count
    const expectedRows = 7487;
    if (geocodingData.length < expectedRows - 10) {
      return {
        success: false,
        message: "CSV data validation failed",
        error: `Expected ~${expectedRows} rows but only loaded ${geocodingData.length}`
      };
    }

    // Build composite key map from production database
    // This respects the unique constraint: (name, sector_name, industry_name)
    console.log("🔍 Building composite key map from production database...");
    
    const compositeKeyToId = new Map<string, number>();
    const allCompanies = await db.select({
      id: companies.id,
      name: companies.name,
      sectorName: companies.sectorName,
      industryName: companies.industryName
    }).from(companies);
    
    for (const company of allCompanies) {
      const compositeKey = `${company.name.toLowerCase().trim()}|${company.sectorName.toLowerCase().trim()}|${company.industryName.toLowerCase().trim()}`;
      compositeKeyToId.set(compositeKey, company.id);
    }
    
    console.log(`✅ Found ${allCompanies.length} companies in production database`);

    // Match CSV companies to production companies using composite key
    const matchedLocations: Array<{ companyId: number; countryId: number }> = [];
    const unmatchedCompanies: string[] = [];
    
    for (const row of geocodingData) {
      const compositeKey = `${row.name.toLowerCase().trim()}|${row.sectorName.toLowerCase().trim()}|${row.industryName.toLowerCase().trim()}`;
      const productionId = compositeKeyToId.get(compositeKey);
      
      if (productionId) {
        matchedLocations.push({
          companyId: productionId,
          countryId: parseInt(row.countryId)
        });
      } else {
        unmatchedCompanies.push(`${row.name} (${row.sectorName} > ${row.industryName})`);
      }
    }
    
    console.log(`✅ Matched ${matchedLocations.length} companies`);
    if (unmatchedCompanies.length > 0) {
      console.log(`⚠️  ${unmatchedCompanies.length} companies could not be matched`);
      if (unmatchedCompanies.length <= 10) {
        console.log("Unmatched companies:", unmatchedCompanies);
      }
    }
    
    if (matchedLocations.length === 0) {
      return {
        success: false,
        message: "No companies could be matched",
        error: "Company composite keys in CSV don't match production database. This suggests significant data divergence.",
        unmatchedDetails: unmatchedCompanies.slice(0, 100)
      };
    }

    // Check current state
    const currentCount = await db.select().from(companyLocations).then(rows => rows.length);
    console.log(`📊 Current company_locations count: ${currentCount}`);
    
    // Create backup
    console.log("💾 Creating backup of existing data...");
    await db.execute(sql`DROP TABLE IF EXISTS company_locations_backup`);
    await db.execute(sql`CREATE TABLE company_locations_backup AS SELECT * FROM company_locations`);
    console.log("✅ Backup created: company_locations_backup");
    
    // Delete old locations
    console.log("🗑️  Deleting old company_locations...");
    await db.delete(companyLocations);

    // Insert correct locations in batches
    console.log("📥 Inserting corrected geocoding data...");
    const batchSize = 500;
    let inserted = 0;

    for (let i = 0; i < matchedLocations.length; i += batchSize) {
      const batch = matchedLocations.slice(i, i + batchSize);
      const valuesToInsert = batch.map(row => ({
        companyId: row.companyId,
        countryId: row.countryId,
        isPrimary: true,
        confidence: 'high' as const,
        source: 'verified_csv'
      }));

      await db.insert(companyLocations).values(valuesToInsert);
      inserted += valuesToInsert.length;
      
      if (i % 1000 === 0 && i > 0) {
        console.log(`  Progress: ${i}/${matchedLocations.length} rows inserted...`);
      }
    }
    
    console.log(`✅ Inserted ${inserted} company_locations rows`);
    
    // Verify insertion
    const newCount = await db.select().from(companyLocations).then(rows => rows.length);
    if (newCount !== matchedLocations.length) {
      return {
        success: false,
        message: "Insertion verification failed",
        error: `Expected ${matchedLocations.length} but found ${newCount} rows`
      };
    }

    console.log("🎉 Geocoding fix completed successfully!");

    return {
      success: true,
      message: "Geocoding fixed successfully using composite key matching",
      stats: {
        rowsLoaded: geocodingData.length,
        companiesMatched: matchedLocations.length,
        previousRows: currentCount,
        insertedRows: inserted,
        backupCreated: true,
        unmatchedCompanies: unmatchedCompanies.length
      },
      unmatchedDetails: unmatchedCompanies.length > 0 ? unmatchedCompanies.slice(0, 20) : undefined
    };

  } catch (error) {
    console.error("❌ Error fixing geocoding:", error);
    return {
      success: false,
      message: "Error fixing geocoding",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
