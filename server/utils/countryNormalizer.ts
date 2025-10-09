import { db } from "../db";
import { countries } from "@shared/schema";
import { eq, or, ilike } from "drizzle-orm";

// Country name variations mapping
const COUNTRY_ALIASES: Record<string, string> = {
  // USA variations
  'USA': 'United States',
  'US': 'United States',
  'United States of America': 'United States',
  'U.S.A.': 'United States',
  'U.S.': 'United States',
  
  // UK variations
  'UK': 'United Kingdom',
  'U.K.': 'United Kingdom',
  'Great Britain': 'United Kingdom',
  'Britain': 'United Kingdom',
  'England': 'United Kingdom',
  
  // Other common variations
  'South Korea': 'Korea, Republic of',
  'Korea': 'Korea, Republic of',
  'North Korea': 'Korea, Democratic People\'s Republic of',
  'Russia': 'Russian Federation',
  'Czech Republic': 'Czechia',
  'Ivory Coast': 'Côte d\'Ivoire',
  'Congo': 'Congo, Democratic Republic of the',
  'UAE': 'United Arab Emirates',
  'Holland': 'Netherlands',
};

export interface CountryMatch {
  id: number;
  name: string;
  slug: string;
  iso2: string;
  iso3: string;
  confidence: 'exact' | 'alias' | 'fuzzy' | 'none';
}

/**
 * Normalize and match country name to database
 */
export async function normalizeAndMatchCountry(inputCountry: string): Promise<CountryMatch | null> {
  if (!inputCountry || inputCountry.trim() === '') {
    return null;
  }

  const normalizedInput = inputCountry.trim();
  
  // Step 1: Check for exact match
  const exactMatch = await db.select()
    .from(countries)
    .where(eq(countries.name, normalizedInput))
    .limit(1);
  
  if (exactMatch.length > 0) {
    return {
      ...exactMatch[0],
      confidence: 'exact'
    };
  }

  // Step 2: Check aliases
  const aliasedName = COUNTRY_ALIASES[normalizedInput];
  if (aliasedName) {
    const aliasMatch = await db.select()
      .from(countries)
      .where(eq(countries.name, aliasedName))
      .limit(1);
    
    if (aliasMatch.length > 0) {
      return {
        ...aliasMatch[0],
        confidence: 'alias'
      };
    }
  }

  // Step 3: Fuzzy match by case-insensitive search
  const fuzzyMatch = await db.select()
    .from(countries)
    .where(ilike(countries.name, normalizedInput))
    .limit(1);
  
  if (fuzzyMatch.length > 0) {
    return {
      ...fuzzyMatch[0],
      confidence: 'fuzzy'
    };
  }

  // Step 4: Try ISO codes if 2 or 3 letters
  if (normalizedInput.length === 2 || normalizedInput.length === 3) {
    const upperInput = normalizedInput.toUpperCase();
    const isoMatch = await db.select()
      .from(countries)
      .where(
        or(
          eq(countries.iso2, upperInput),
          eq(countries.iso3, upperInput)
        )
      )
      .limit(1);
    
    if (isoMatch.length > 0) {
      return {
        ...isoMatch[0],
        confidence: 'alias'
      };
    }
  }

  return null;
}

/**
 * Get all countries for validation
 */
export async function getAllCountries() {
  return await db.select().from(countries).orderBy(countries.name);
}

/**
 * Validate country name exists
 */
export async function validateCountryName(countryName: string): Promise<boolean> {
  const match = await normalizeAndMatchCountry(countryName);
  return match !== null;
}
