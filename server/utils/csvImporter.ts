import { db } from "../db";
import { companies, companyLocations } from "@shared/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import { normalizeAndMatchCountry } from "./countryNormalizer";

export interface CSVCompanyRow {
  industry: string;
  companyName: string;
  hqCountry: string;
  website: string;
  employeeCount: string;
  revenueEstimate: string;
  founded: string;
  companySize: string;
  specializationTags: string;
  status: string;
}

export interface ImportResult {
  success: boolean;
  companyId?: number;
  action: 'created' | 'updated' | 'skipped' | 'error';
  message: string;
  countryMatch?: {
    inputCountry: string;
    matchedCountry: string;
    confidence: string;
  };
}

/**
 * Parse founded year from various formats
 */
function parseFoundedYear(foundedStr: string): number | null {
  if (!foundedStr || foundedStr.trim() === '' || foundedStr === 'N/A') {
    return null;
  }
  
  const yearMatch = foundedStr.match(/\d{4}/);
  if (yearMatch) {
    const year = parseInt(yearMatch[0], 10);
    if (year >= 1800 && year <= new Date().getFullYear()) {
      return year;
    }
  }
  
  return null;
}

/**
 * Find existing company by name or website
 */
async function findExistingCompany(companyName: string, website: string): Promise<any | null> {
  // Try exact name match first
  const [exactNameMatch] = await db.select()
    .from(companies)
    .where(eq(companies.name, companyName))
    .limit(1);
  
  if (exactNameMatch) {
    return exactNameMatch;
  }

  // Try website match if provided
  if (website && website.trim() !== '') {
    const cleanWebsite = website.toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    
    const websiteMatches = await db.select()
      .from(companies)
      .where(ilike(companies.websiteUrl, `%${cleanWebsite}%`))
      .limit(5);
    
    if (websiteMatches.length > 0) {
      return websiteMatches[0];
    }
  }

  // Try fuzzy name match (case-insensitive)
  const [fuzzyMatch] = await db.select()
    .from(companies)
    .where(ilike(companies.name, companyName))
    .limit(1);
  
  return fuzzyMatch || null;
}

/**
 * Import a single company from CSV
 */
export async function importCompanyFromCSV(
  row: CSVCompanyRow,
  sectorName: string
): Promise<ImportResult> {
  try {
    // Validate country
    const countryMatch = await normalizeAndMatchCountry(row.hqCountry);
    
    if (!countryMatch) {
      return {
        success: false,
        action: 'error',
        message: `Country not found: ${row.hqCountry}`,
        countryMatch: {
          inputCountry: row.hqCountry,
          matchedCountry: 'NOT_FOUND',
          confidence: 'none'
        }
      };
    }

    // Find or create company
    const existingCompany = await findExistingCompany(row.companyName, row.website);
    
    const companyData = {
      name: row.companyName,
      websiteUrl: row.website || null,
      industryName: row.industry,
      sectorName: sectorName,
      employeeCount: row.employeeCount || null,
      revenueEstimate: row.revenueEstimate || null,
      foundedYear: parseFoundedYear(row.founded),
      companySize: row.companySize || null,
      specializationTags: row.specializationTags || null,
      verificationStatus: row.status?.toLowerCase() === 'verified' ? 'verified' : 'unverified',
    };

    let companyId: number;
    let action: 'created' | 'updated';

    if (existingCompany) {
      // Update existing company
      await db.update(companies)
        .set(companyData)
        .where(eq(companies.id, existingCompany.id));
      
      companyId = existingCompany.id;
      action = 'updated';

      // Backup old location data before updating
      const [existingLocation] = await db.select()
        .from(companyLocations)
        .where(and(
          eq(companyLocations.companyId, companyId),
          eq(companyLocations.isPrimary, true)
        ))
        .limit(1);

      if (existingLocation) {
        // Backup old data
        await db.update(companyLocations)
          .set({
            oldCountryId: existingLocation.countryId,
            oldConfidence: existingLocation.confidence,
            countryId: countryMatch.id,
            confidence: 'high',
            source: 'verified_csv'
          })
          .where(eq(companyLocations.id, existingLocation.id));
      } else {
        // Create new location record
        await db.insert(companyLocations).values({
          companyId: companyId,
          countryId: countryMatch.id,
          isPrimary: true,
          confidence: 'high',
          source: 'verified_csv'
        });
      }
    } else {
      // Create new company
      const [newCompany] = await db.insert(companies)
        .values(companyData)
        .returning({ id: companies.id });
      
      companyId = newCompany.id;
      action = 'created';

      // Create location
      await db.insert(companyLocations).values({
        companyId: companyId,
        countryId: countryMatch.id,
        isPrimary: true,
        confidence: 'high',
        source: 'verified_csv'
      });
    }

    return {
      success: true,
      companyId,
      action,
      message: `${action === 'created' ? 'Created' : 'Updated'} company: ${row.companyName}`,
      countryMatch: {
        inputCountry: row.hqCountry,
        matchedCountry: countryMatch.name,
        confidence: countryMatch.confidence
      }
    };
  } catch (error) {
    return {
      success: false,
      action: 'error',
      message: `Error processing ${row.companyName}: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Parse CSV text content
 */
export function parseCSVContent(csvContent: string): CSVCompanyRow[] {
  const lines = csvContent.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length < 2) {
    return [];
  }

  // Skip header
  const dataLines = lines.slice(1);
  
  return dataLines.map(line => {
    // Simple CSV parsing (handles quoted fields)
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }
    fields.push(currentField.trim());

    return {
      industry: fields[0] || '',
      companyName: fields[1] || '',
      hqCountry: fields[2] || '',
      website: fields[3] || '',
      employeeCount: fields[4] || '',
      revenueEstimate: fields[5] || '',
      founded: fields[6] || '',
      companySize: fields[7] || '',
      specializationTags: fields[8] || '',
      status: fields[9] || 'unverified'
    };
  });
}
