/**
 * Geocoding Fix Service
 * 
 * Provides reusable function to fix incorrect geocoding data in the database.
 * Used by both CLI script and admin API endpoint.
 */

import { db } from "../db";
import { companyLocations, companies } from "../../shared/schema";
import { sql, eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface GeocodingRow {
  id: string;
  name: string;
  country_id: string;
  country_name: string;
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
}

/**
 * Fixes production geocoding by replacing all company_locations with correct data
 */
export async function fixProductionGeocoding(): Promise<GeocodingFixResult> {
  try {
    // Use process.cwd() for reliable path resolution in both dev and production
    const csvPath = path.join(process.cwd(), "server", "data", "correct_geocoding.csv");
    
    if (!fs.existsSync(csvPath)) {
      return {
        success: false,
        message: "Correct geocoding CSV file not found",
        error: `File not found at: ${csvPath}`
      };
    }

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
      
      if (parts.length >= 4) {
        const id = parts[0];
        const countryId = parts[2];
        
        // Validate numeric IDs
        if (!/^\d+$/.test(id) || !/^\d+$/.test(countryId)) {
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

    // Validate expected row count
    const expectedRows = 7487;
    if (geocodingData.length < expectedRows - 10) {
      return {
        success: false,
        message: "CSV data validation failed",
        error: `Expected ~${expectedRows} rows but only loaded ${geocodingData.length}`
      };
    }

    // CRITICAL: Look up company IDs from production database by name
    // The CSV has development IDs which don't match production IDs
    console.log(`Looking up ${geocodingData.length} companies in production database...`);
    
    const companyNameToId = new Map<string, number>();
    const allCompanies = await db.select({ id: companies.id, name: companies.name }).from(companies);
    
    for (const company of allCompanies) {
      companyNameToId.set(company.name.toLowerCase().trim(), company.id);
    }
    
    console.log(`Found ${allCompanies.length} companies in production database`);

    // Match CSV companies to production companies
    const matchedLocations: Array<{ companyId: number; countryId: number }> = [];
    const unmatchedCompanies: string[] = [];
    
    for (const row of geocodingData) {
      const companyKey = row.name.toLowerCase().trim();
      const productionId = companyNameToId.get(companyKey);
      
      if (productionId) {
        matchedLocations.push({
          companyId: productionId,
          countryId: parseInt(row.country_id)
        });
      } else {
        unmatchedCompanies.push(row.name);
      }
    }
    
    console.log(`Matched ${matchedLocations.length} companies, ${unmatchedCompanies.length} unmatched`);
    
    if (matchedLocations.length === 0) {
      return {
        success: false,
        message: "No companies could be matched",
        error: "Company names in CSV don't match production database. This suggests the databases have different data."
      };
    }

    // Check current state
    const currentCount = await db.select().from(companyLocations).then(rows => rows.length);
    
    // Create backup
    await db.execute(sql`
      DROP TABLE IF EXISTS company_locations_backup
    `);
    await db.execute(sql`
      CREATE TABLE company_locations_backup AS 
      SELECT * FROM company_locations
    `);
    
    // Delete old locations
    await db.delete(companyLocations);

    // Insert correct locations in batches
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
    }
    
    // Verify insertion
    const newCount = await db.select().from(companyLocations).then(rows => rows.length);
    if (newCount !== matchedLocations.length) {
      return {
        success: false,
        message: "Insertion verification failed",
        error: `Expected ${matchedLocations.length} but found ${newCount} rows`
      };
    }

    return {
      success: true,
      message: "Geocoding fixed successfully",
      stats: {
        rowsLoaded: geocodingData.length,
        companiesMatched: matchedLocations.length,
        previousRows: currentCount,
        insertedRows: inserted,
        backupCreated: true,
        unmatchedCompanies: unmatchedCompanies.length
      }
    };

  } catch (error) {
    return {
      success: false,
      message: "Error fixing geocoding",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
