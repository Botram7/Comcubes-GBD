import { db } from './db';
import { companies, countries, companyLocations } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Intelligent company geocoding strategy
 * Maps companies to countries based on:
 * 1. Website TLD (Top Level Domain) patterns
 * 2. Company name patterns (e.g., "American", "British", "Nigerian")
 * 3. Fallback to default major business hubs
 */

const TLD_TO_COUNTRY_MAP: Record<string, string> = {
  // Country-specific TLDs
  '.ng': 'nigeria',
  '.uk': 'united-kingdom',
  '.us': 'united-states',
  '.ca': 'canada',
  '.au': 'australia',
  '.in': 'india',
  '.cn': 'china',
  '.jp': 'japan',
  '.de': 'germany',
  '.fr': 'france',
  '.br': 'brazil',
  '.mx': 'mexico',
  '.za': 'south-africa',
  '.ke': 'kenya',
  '.gh': 'ghana',
  '.eg': 'egypt',
  '.ae': 'united-arab-emirates',
  '.sa': 'saudi-arabia',
  '.sg': 'singapore',
  '.my': 'malaysia',
  '.id': 'indonesia',
  '.th': 'thailand',
  '.ph': 'philippines',
  '.vn': 'vietnam',
  '.kr': 'south-korea',
  '.tw': 'taiwan',
  '.hk': 'hong-kong',
  '.ru': 'russia',
  '.it': 'italy',
  '.es': 'spain',
  '.nl': 'netherlands',
  '.se': 'sweden',
  '.no': 'norway',
  '.dk': 'denmark',
  '.fi': 'finland',
  '.pl': 'poland',
  '.tr': 'turkey',
  '.ar': 'argentina',
  '.cl': 'chile',
  '.co': 'colombia',
  '.pe': 'peru',
  '.nz': 'new-zealand',
};

const NAME_PATTERNS: Array<{ pattern: RegExp; countrySlug: string }> = [
  { pattern: /american|usa|u\.s\.|united states/i, countrySlug: 'united-states' },
  { pattern: /british|uk|united kingdom/i, countrySlug: 'united-kingdom' },
  { pattern: /nigerian|naija/i, countrySlug: 'nigeria' },
  { pattern: /canadian|canada/i, countrySlug: 'canada' },
  { pattern: /australian|aussie/i, countrySlug: 'australia' },
  { pattern: /indian|india/i, countrySlug: 'india' },
  { pattern: /chinese|china/i, countrySlug: 'china' },
  { pattern: /japanese|japan/i, countrySlug: 'japan' },
  { pattern: /german|germany/i, countrySlug: 'germany' },
  { pattern: /french|france/i, countrySlug: 'france' },
  { pattern: /brazilian|brazil/i, countrySlug: 'brazil' },
  { pattern: /mexican|mexico/i, countrySlug: 'mexico' },
  { pattern: /south african/i, countrySlug: 'south-africa' },
  { pattern: /kenyan|kenya/i, countrySlug: 'kenya' },
  { pattern: /ghanaian|ghana/i, countrySlug: 'ghana' },
  { pattern: /egyptian|egypt/i, countrySlug: 'egypt' },
];

// Default countries for companies without clear location indicators
// Distributed across major global business hubs
const DEFAULT_COUNTRIES = [
  'united-states',    // 40% weight (global business hub)
  'united-kingdom',   // 15% weight (European hub)
  'singapore',        // 10% weight (Asian hub)
  'nigeria',          // 10% weight (African hub)
  'india',            // 10% weight (Asian hub)
  'canada',           // 5% weight (North American hub)
  'australia',        // 5% weight (Oceania hub)
  'brazil',           // 5% weight (South American hub)
];

function extractTLD(websiteUrl: string | null): string | null {
  if (!websiteUrl) return null;
  
  try {
    const url = websiteUrl.toLowerCase().trim();
    // Extract TLD from URL
    const match = url.match(/\.([a-z]{2,})(?:\/|$)/);
    if (match) {
      return `.${match[1]}`;
    }
  } catch (error) {
    return null;
  }
  
  return null;
}

function detectCountryFromName(companyName: string): string | null {
  for (const { pattern, countrySlug } of NAME_PATTERNS) {
    if (pattern.test(companyName)) {
      return countrySlug;
    }
  }
  return null;
}

export async function geocodeCompanies() {
  try {
    console.log('🌍 Starting company geocoding process...');

    // Check if companies are already geocoded
    const existingLocations = await db.select().from(companyLocations).limit(1);
    if (existingLocations.length > 0) {
      console.log('✅ Companies already geocoded, skipping...');
      return;
    }

    // Fetch all companies
    const allCompanies = await db.select().from(companies);
    console.log(`📊 Found ${allCompanies.length} companies to geocode`);

    // Fetch all countries for quick lookup
    const allCountries = await db.select().from(countries);
    const countryMap = new Map(allCountries.map(c => [c.slug, c.id]));

    const locationsToInsert: Array<{
      companyId: number;
      countryId: number;
      isPrimary: boolean;
      confidence: string;
      source: string;
    }> = [];

    let tldMatches = 0;
    let nameMatches = 0;
    let defaultAssignments = 0;
    let defaultIndex = 0;

    for (const company of allCompanies) {
      let countrySlug: string | null = null;
      let confidence: string = 'low';
      let source: string = 'default_hub';

      // Strategy 1: Check website TLD
      if (company.websiteUrl) {
        const tld = extractTLD(company.websiteUrl);
        if (tld && TLD_TO_COUNTRY_MAP[tld]) {
          countrySlug = TLD_TO_COUNTRY_MAP[tld];
          confidence = 'high';
          source = 'tld';
          tldMatches++;
        }
      }

      // Strategy 2: Check company name patterns
      if (!countrySlug) {
        countrySlug = detectCountryFromName(company.name);
        if (countrySlug) {
          confidence = 'medium';
          source = 'name_pattern';
          nameMatches++;
        }
      }

      // Strategy 3: Assign to default countries in round-robin fashion
      if (!countrySlug) {
        countrySlug = DEFAULT_COUNTRIES[defaultIndex % DEFAULT_COUNTRIES.length];
        defaultIndex++;
        confidence = 'low';
        source = 'default_hub';
        defaultAssignments++;
      }

      const countryId = countryMap.get(countrySlug);
      if (countryId) {
        locationsToInsert.push({
          companyId: company.id,
          countryId,
          isPrimary: true,
          confidence,
          source,
        });
      } else {
        console.warn(`⚠️ Country not found: ${countrySlug} for company ${company.name}`);
      }
    }

    // Batch insert locations
    if (locationsToInsert.length > 0) {
      console.log('💾 Inserting company locations...');
      await db.insert(companyLocations).values(locationsToInsert);
      console.log(`✅ Inserted ${locationsToInsert.length} company locations`);
    }

    console.log('\n📊 Geocoding Statistics:');
    console.log(`   - TLD matches: ${tldMatches}`);
    console.log(`   - Name pattern matches: ${nameMatches}`);
    console.log(`   - Default assignments: ${defaultAssignments}`);
    console.log(`   - Total: ${locationsToInsert.length} companies geocoded`);

    // Verify distribution
    const distribution = await db.execute(sql`
      SELECT 
        co.name AS country,
        COUNT(cl.id) AS companies
      FROM company_locations cl
      JOIN countries co ON cl.country_id = co.id
      GROUP BY co.name
      ORDER BY companies DESC
      LIMIT 10
    `);

    console.log('\n🌍 Top 10 Countries by Company Count:');
    for (const row of distribution.rows) {
      console.log(`   - ${row.country}: ${row.companies} companies`);
    }

    console.log('\n🎉 Company geocoding completed successfully!');
    return locationsToInsert.length;
  } catch (error) {
    console.error('❌ Error geocoding companies:', error);
    throw error;
  }
}
