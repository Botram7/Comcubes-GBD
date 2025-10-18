/**
 * Geocoding Fix Service
 * 
 * Environment-independent geocoding fix using natural keys (names) only.
 * No reliance on auto-increment IDs that differ between dev and production.
 */

import { db } from "../db";
import { companyLocations, companies, countries } from "../../shared/schema";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

interface GeocodingRow {
  name: string;
  sectorName: string;
  industryName: string;
  countryId: string; // Will be ignored - we use countryName instead
  countryName: string;
}

export interface GeocodingFixResult {
  success: boolean;
  message: string;
  stats?: {
    rowsLoaded: number;
    companiesMatched: number;
    countriesMatched: number;
    previousRows: number;
    insertedRows: number;
    backupCreated: boolean;
    unmatchedCompanies: number;
    unmatchedCountries: number;
  };
  error?: string;
  unmatchedDetails?: {
    companies: string[];
    countries: string[];
  };
}

/**
 * Fixes production geocoding using only natural keys (names).
 * Completely independent of environment-specific auto-increment IDs.
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

    console.log("📄 Reading geocoding data...");

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
        geocodingData.push({
          name: parts[0],
          sectorName: parts[1],
          industryName: parts[2],
          countryId: parts[3], // Ignored - using countryName instead
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

    // Build composite key map for companies from PRODUCTION database
    console.log("🔍 Building company lookup map from production database...");
    
    const companyCompositeKeyToId = new Map<string, number>();
    const allCompanies = await db.select({
      id: companies.id,
      name: companies.name,
      sectorName: companies.sectorName,
      industryName: companies.industryName
    }).from(companies);
    
    for (const company of allCompanies) {
      const compositeKey = `${company.name.toLowerCase().trim()}|${company.sectorName.toLowerCase().trim()}|${company.industryName.toLowerCase().trim()}`;
      companyCompositeKeyToId.set(compositeKey, company.id);
    }
    
    console.log(`✅ Found ${allCompanies.length} companies in production database`);

    // Build country name-to-ID map from PRODUCTION database
    console.log("🌍 Building country lookup map from production database...");
    
    const countryNameToId = new Map<string, number>();
    const allCountries = await db.select({
      id: countries.id,
      name: countries.name
    }).from(countries);
    
    for (const country of allCountries) {
      countryNameToId.set(country.name.toLowerCase().trim(), country.id);
    }
    
    console.log(`✅ Found ${allCountries.length} countries in production database`);

    // Match CSV data to production using NATURAL KEYS ONLY
    const matchedLocations: Array<{ companyId: number; countryId: number }> = [];
    const unmatchedCompanies: string[] = [];
    const unmatchedCountries = new Set<string>();
    
    for (const row of geocodingData) {
      const companyKey = `${row.name.toLowerCase().trim()}|${row.sectorName.toLowerCase().trim()}|${row.industryName.toLowerCase().trim()}`;
      const countryKey = row.countryName.toLowerCase().trim();
      
      const productionCompanyId = companyCompositeKeyToId.get(companyKey);
      const productionCountryId = countryNameToId.get(countryKey);
      
      if (!productionCompanyId) {
        unmatchedCompanies.push(`${row.name} (${row.sectorName} > ${row.industryName})`);
        continue;
      }
      
      if (!productionCountryId) {
        unmatchedCountries.add(row.countryName);
        continue;
      }
      
      matchedLocations.push({
        companyId: productionCompanyId,
        countryId: productionCountryId
      });
    }
    
    console.log(`✅ Matched ${matchedLocations.length} company-country pairs`);
    if (unmatchedCompanies.length > 0) {
      console.log(`⚠️  ${unmatchedCompanies.length} companies could not be matched`);
    }
    if (unmatchedCountries.size > 0) {
      console.log(`⚠️  ${unmatchedCountries.size} countries could not be matched`);
      console.log(`   Unmatched countries: ${Array.from(unmatchedCountries).join(', ')}`);
    }
    
    if (matchedLocations.length === 0) {
      return {
        success: false,
        message: "No company-country pairs could be matched",
        error: "Data in CSV doesn't match production database. Significant divergence detected.",
        unmatchedDetails: {
          companies: unmatchedCompanies.slice(0, 50),
          countries: Array.from(unmatchedCountries)
        }
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
      
      if (i % 2000 === 0 && i > 0) {
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
      message: "Geocoding fixed successfully using natural key matching (environment-independent)",
      stats: {
        rowsLoaded: geocodingData.length,
        companiesMatched: matchedLocations.length,
        countriesMatched: allCountries.length,
        previousRows: currentCount,
        insertedRows: inserted,
        backupCreated: true,
        unmatchedCompanies: unmatchedCompanies.length,
        unmatchedCountries: unmatchedCountries.size
      },
      unmatchedDetails: {
        companies: unmatchedCompanies.length > 0 ? unmatchedCompanies.slice(0, 20) : [],
        countries: Array.from(unmatchedCountries)
      }
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
