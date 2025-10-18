/**
 * Geocoding Diagnostic Service
 * 
 * Analyzes differences between CSV data and production database.
 * Identifies unmatched companies and countries for manual review.
 */

import { db } from "../db";
import { companies, countries } from "../../shared/schema";
import fs from "fs";
import path from "path";

interface GeocodingRow {
  name: string;
  sectorName: string;
  industryName: string;
  countryName: string;
}

interface UnmatchedCompany {
  name: string;
  sectorName: string;
  industryName: string;
  countryName: string;
  reason: string;
}

interface UnmatchedCountry {
  name: string;
  usageCount: number;
}

export interface DiagnosticResult {
  success: boolean;
  message: string;
  summary?: {
    totalInCsv: number;
    matchedCompanies: number;
    unmatchedCompanies: number;
    unmatchedCountries: number;
    productionCompanies: number;
    productionCountries: number;
  };
  unmatchedCompanies?: UnmatchedCompany[];
  unmatchedCountries?: UnmatchedCountry[];
  error?: string;
}

/**
 * Diagnoses geocoding data discrepancies between CSV and production
 */
export async function diagnoseGeocodingData(): Promise<DiagnosticResult> {
  try {
    const csvPath = path.join(process.cwd(), "server", "data", "geocoding_composite_key.csv");
    
    if (!fs.existsSync(csvPath)) {
      return {
        success: false,
        message: "Geocoding CSV file not found",
        error: `File not found at: ${csvPath}`
      };
    }

    console.log("📊 Starting geocoding diagnostic...");

    // Parse CSV
    const csvContent = fs.readFileSync(csvPath, "utf-8");
    const lines = csvContent.split("\n").filter(line => line.trim());
    
    const geocodingData: GeocodingRow[] = [];
    
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
      
      if (parts.length >= 5) {
        geocodingData.push({
          name: parts[0],
          sectorName: parts[1],
          industryName: parts[2],
          countryName: parts[4]
        });
      }
    }

    console.log(`✅ Loaded ${geocodingData.length} entries from CSV`);

    // Load production data
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

    const countryNameToId = new Map<string, number>();
    const allCountries = await db.select({
      id: countries.id,
      name: countries.name
    }).from(countries);
    
    for (const country of allCountries) {
      countryNameToId.set(country.name.toLowerCase().trim(), country.id);
    }

    console.log(`✅ Production has ${allCompanies.length} companies and ${allCountries.length} countries`);

    // Analyze unmatched entities
    const unmatchedCompanies: UnmatchedCompany[] = [];
    const unmatchedCountriesMap = new Map<string, number>();
    let matchedCount = 0;
    
    for (const row of geocodingData) {
      const companyKey = `${row.name.toLowerCase().trim()}|${row.sectorName.toLowerCase().trim()}|${row.industryName.toLowerCase().trim()}`;
      const countryKey = row.countryName.toLowerCase().trim();
      
      const hasCompany = companyCompositeKeyToId.has(companyKey);
      const hasCountry = countryNameToId.has(countryKey);
      
      if (!hasCompany || !hasCountry) {
        let reason = '';
        if (!hasCompany && !hasCountry) {
          reason = 'Both company and country missing from production';
        } else if (!hasCompany) {
          reason = 'Company missing from production database';
        } else if (!hasCountry) {
          reason = 'Country missing from production database';
        }
        
        unmatchedCompanies.push({
          name: row.name,
          sectorName: row.sectorName,
          industryName: row.industryName,
          countryName: row.countryName,
          reason
        });
        
        if (!hasCountry) {
          unmatchedCountriesMap.set(row.countryName, (unmatchedCountriesMap.get(row.countryName) || 0) + 1);
        }
      } else {
        matchedCount++;
      }
    }

    const unmatchedCountries: UnmatchedCountry[] = Array.from(unmatchedCountriesMap.entries()).map(([name, count]) => ({
      name,
      usageCount: count
    }));

    console.log(`✅ Analysis complete: ${matchedCount} matched, ${unmatchedCompanies.length} unmatched companies`);

    return {
      success: true,
      message: "Diagnostic completed successfully",
      summary: {
        totalInCsv: geocodingData.length,
        matchedCompanies: matchedCount,
        unmatchedCompanies: unmatchedCompanies.length,
        unmatchedCountries: unmatchedCountries.length,
        productionCompanies: allCompanies.length,
        productionCountries: allCountries.length
      },
      unmatchedCompanies,
      unmatchedCountries
    };

  } catch (error) {
    console.error("❌ Diagnostic error:", error);
    return {
      success: false,
      message: "Error running diagnostic",
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
