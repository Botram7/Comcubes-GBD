import { db } from '../db';
import { companies, industries, companyLocations, countries } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { matchSector, matchIndustry } from './categoryMatcher';

interface WikidataCompany {
  name: string;
  websiteUrl: string | null;
  country: string | null;
  countryCode: string | null;
  foundedYear: number | null;
  employeeCount: string | null;
  description: string | null;
  wikidataId: string;
}

interface WikidataImportResult {
  industry: string;
  sector: string;
  total: number;
  imported: number;
  skippedDuplicates: number;
  skippedErrors: number;
  errors: string[];
  companies: WikidataCompany[];
}

interface WikidataPreviewResult {
  industry: string;
  sector: string;
  companies: WikidataCompany[];
  existingNames: string[];
  newCompanies: WikidataCompany[];
  duplicateCount: number;
}

const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const FETCH_TIMEOUT_MS = 25000;

const CONTINENT_QIDS: Record<string, string> = {
  'africa': 'Q15',
  'europe': 'Q46',
  'asia': 'Q48',
  'north america': 'Q49',
  'south america': 'Q18',
  'oceania': 'Q55643',
};

// Maps search terms to Wikidata QIDs for fast, indexed queries
// Using direct instance-of QIDs is orders of magnitude faster than label text search
const TERM_TO_QID_MAP: Record<string, string[]> = {
  'bank': ['Q22687'],                      // bank
  'commercial bank': ['Q22687'],
  'investment bank': ['Q17156070'],        // investment bank
  'airline': ['Q46970'],                   // airline
  'hospital': ['Q16917'],                  // hospital
  'university': ['Q3918'],                 // university
  'insurance': ['Q43183'],                 // insurance company
  'hotel': ['Q27686'],                     // hotel
  'supermarket': ['Q180674'],              // supermarket
  'pharmaceutical': ['Q507443'],           // pharmaceutical company
  'mining': ['Q161379'],                   // mining company
  'oil': ['Q130933', 'Q40185'],            // oil company, oil & gas company
  'petroleum': ['Q130933'],
  'gas': ['Q130933'],
  'software': ['Q6881511'],               // software company
  'telecom': ['Q622569'],                  // telecommunications company
  'telecommunications': ['Q622569'],
  'mobile': ['Q2061309'],                  // mobile network operator
  'internet': ['Q2349975'],               // internet service provider
  'semiconductor': ['Q4830453'],
  'automobile': ['Q786820'],              // automobile manufacturer
  'automotive': ['Q786820'],
  'car': ['Q786820'],
  'shipping': ['Q18388218'],              // shipping company
  'railway': ['Q201896'],                 // railway company
  'rail': ['Q201896'],
  'real estate': ['Q1137012'],            // real estate company
  'property': ['Q1137012'],
  'construction': ['Q562966'],            // construction company
  'food': ['Q1454471'],                   // food company
  'beverage': ['Q4540',  'Q1454471'],     // brewery / food company
  'media': ['Q1750916'],                  // media company
  'broadcast': ['Q41298'],               // broadcasting company
  'television': ['Q41298'],
  'film': ['Q18127',  'Q212156'],         // film production / film studio
  'music': ['Q18127'],
  'energy': ['Q4830453'],
  'electric': ['Q1057118'],               // electric utility
  'power': ['Q1057118'],
  'retail': ['Q507029'],                  // retailer
  'department store': ['Q216107'],
  'chemical': ['Q83588'],                 // chemical company
  'steel': ['Q83588'],
  'agriculture': ['Q389970'],             // agricultural company
  'fertilizer': ['Q167336'],
  'logistics': ['Q177597'],              // logistics company
  'transport': ['Q177597'],
};

function getQidsForTerm(term: string): string[] {
  const lower = term.toLowerCase().trim();
  if (TERM_TO_QID_MAP[lower]) return TERM_TO_QID_MAP[lower];
  // partial match
  for (const key of Object.keys(TERM_TO_QID_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return TERM_TO_QID_MAP[key];
    }
  }
  return [];
}

function buildQidQuery(qids: string[], countryCode?: string, continentName?: string, limit = 50): string {
  const typeFilter = qids.map(q => `{ ?company wdt:P31/wdt:P279* wd:${q} }`).join(' UNION\n      ');

  const countryFilter = countryCode
    ? `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P297 "${countryCode.toUpperCase()}" .`
    : '';

  let continentFilter = '';
  if (continentName && !countryCode) {
    const qid = CONTINENT_QIDS[continentName.toLowerCase()];
    if (qid) {
      continentFilter = `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P30 wd:${qid} .`;
    }
  }

  return `
    SELECT DISTINCT ?company ?companyLabel ?website ?countryLabel ?countryCode ?founded ?employees WHERE {
      ${typeFilter}
      ${countryFilter}
      ${continentFilter}
      OPTIONAL { ?company wdt:P856 ?website . }
      OPTIONAL {
        ?company wdt:P17 ?cEntity .
        ?cEntity rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en")
        OPTIONAL { ?cEntity wdt:P297 ?countryCode . }
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,es,pt,ar,sw" . }
    }
    LIMIT ${limit}
  `;
}

function buildLabelSearchQuery(term: string, countryCode?: string, continentName?: string, limit = 30): string {
  const escaped = term.replace(/"/g, '\\"').toLowerCase();

  const countryFilter = countryCode
    ? `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P297 "${countryCode.toUpperCase()}" .`
    : '';

  let continentFilter = '';
  if (continentName && !countryCode) {
    const qid = CONTINENT_QIDS[continentName.toLowerCase()];
    if (qid) {
      continentFilter = `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P30 wd:${qid} .`;
    }
  }

  return `
    SELECT DISTINCT ?company ?companyLabel ?website ?countryLabel ?countryCode ?founded ?employees WHERE {
      ?company wdt:P31/wdt:P279* wd:Q4830453 .
      ?company wdt:P856 ?website .
      ${countryFilter}
      ${continentFilter}
      OPTIONAL {
        ?company wdt:P17 ?cEntity .
        ?cEntity rdfs:label ?countryLabel . FILTER(LANG(?countryLabel) = "en")
        OPTIONAL { ?cEntity wdt:P297 ?countryCode . }
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en,fr,es,pt,ar,sw" . }
      FILTER(CONTAINS(LCASE(?companyLabel), "${escaped}"))
    }
    LIMIT ${limit}
  `;
}

async function executeSparqlQuery(query: string): Promise<any[]> {
  const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'COMCUBES-Directory/1.0 (https://comcubes.com; admin@comcubes.com)',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wikidata SPARQL query failed (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    return data.results?.bindings || [];
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Wikidata query timed out (25s). Try adding a country code like "NG" or "ZA" to narrow results.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function parseWikidataResults(results: any[]): WikidataCompany[] {
  const seen = new Set<string>();
  const parsed: WikidataCompany[] = [];

  for (const result of results) {
    const wikidataId = result.company?.value?.split('/').pop() || '';
    const name = result.companyLabel?.value || '';

    if (!name || /^Q\d+$/.test(name) || seen.has(name.toLowerCase())) {
      continue;
    }
    seen.add(name.toLowerCase());

    let websiteUrl = result.website?.value || null;
    if (websiteUrl && !websiteUrl.startsWith('http')) {
      websiteUrl = 'https://' + websiteUrl;
    }

    let foundedYear: number | null = null;
    if (result.founded?.value) {
      const dateStr = result.founded.value;
      const yearMatch = dateStr.match(/(\d{4})/);
      if (yearMatch) {
        foundedYear = parseInt(yearMatch[1]);
        if (foundedYear < 1600 || foundedYear > new Date().getFullYear()) {
          foundedYear = null;
        }
      }
    }

    let employeeCount: string | null = null;
    if (result.employees?.value) {
      const emp = parseInt(result.employees.value);
      if (!isNaN(emp) && emp > 0) {
        if (emp >= 1000000) employeeCount = `${(emp / 1000000).toFixed(1)}M+`;
        else if (emp >= 1000) employeeCount = `${(emp / 1000).toFixed(0)}K+`;
        else employeeCount = `${emp}+`;
      }
    }

    parsed.push({
      name: name.trim(),
      websiteUrl,
      country: result.countryLabel?.value || null,
      countryCode: result.countryCode?.value || null,
      foundedYear,
      employeeCount,
      description: null,
      wikidataId,
    });
  }

  return parsed;
}

export class WikidataService {
  async searchCompanies(options: {
    industryName?: string;
    sectorName?: string;
    countryCode?: string;
    continentName?: string;
    limit?: number;
  }): Promise<WikidataCompany[]> {
    const { industryName, sectorName, countryCode, continentName, limit = 50 } = options;

    const searchTerm = industryName || sectorName || '';

    console.log(`[Wikidata] Searching: term="${searchTerm}", country="${countryCode || 'all'}", continent="${continentName || 'all'}"`);

    // First try: QID-based query (fast, indexed)
    const qids = getQidsForTerm(searchTerm);

    if (qids.length > 0) {
      console.log(`[Wikidata] Using QID-based query for "${searchTerm}": ${qids.join(', ')}`);
      try {
        const results = await executeSparqlQuery(buildQidQuery(qids, countryCode, continentName, limit));
        const parsed = parseWikidataResults(results);
        console.log(`[Wikidata] QID query found ${parsed.length} companies`);
        if (parsed.length > 0) return parsed;
      } catch (err: any) {
        console.warn(`[Wikidata] QID query failed: ${err.message} — falling back to label search`);
      }
    }

    // Fallback: label CONTAINS search — only works well with country code (not continent-wide)
    console.log(`[Wikidata] Falling back to label search for "${searchTerm}"`);
    if (!countryCode && continentName) {
      // Label search + continent without country is too slow — require country code
      throw new Error(
        `The search term "${searchTerm}" isn't in our fast-lookup database. For continent-wide searches, please add a Country Code (e.g. "NG" for Nigeria) to keep results fast.`
      );
    }

    const results = await executeSparqlQuery(buildLabelSearchQuery(searchTerm, countryCode, continentName, limit));
    const parsed = parseWikidataResults(results);
    console.log(`[Wikidata] Label search found ${parsed.length} companies`);
    return parsed;
  }

  async previewImport(options: {
    industryName: string;
    sectorName: string;
    countryCode?: string;
    continentName?: string;
    limit?: number;
  }): Promise<WikidataPreviewResult> {
    const { industryName, sectorName } = options;

    const wikidataCompanies = await this.searchCompanies(options);

    const existingCompanies = await db.select({ name: companies.name })
      .from(companies)
      .where(eq(companies.industryName, industryName));

    const existingNameSet = new Set(existingCompanies.map(c => c.name.toLowerCase()));

    const newCompanies = wikidataCompanies.filter(
      wc => !existingNameSet.has(wc.name.toLowerCase())
    );

    return {
      industry: industryName,
      sector: sectorName,
      companies: wikidataCompanies,
      existingNames: existingCompanies.map(c => c.name),
      newCompanies,
      duplicateCount: wikidataCompanies.length - newCompanies.length,
    };
  }

  async importCompanies(options: {
    industryName: string;
    sectorName: string;
    selectedCompanies: WikidataCompany[];
  }): Promise<WikidataImportResult> {
    const { industryName, sectorName, selectedCompanies } = options;

    let resolvedSectorName = sectorName;
    let resolvedIndustryName = industryName;

    const sectorMatch = matchSector(sectorName);
    if (sectorMatch.name) {
      resolvedSectorName = sectorMatch.name;
    }

    const industryMatch = matchIndustry(industryName, resolvedSectorName);
    if (industryMatch.name) {
      resolvedIndustryName = industryMatch.name;
    }

    const existingCompanies = await db.select({ name: companies.name })
      .from(companies)
      .where(eq(companies.industryName, resolvedIndustryName));

    const existingNames = new Set(existingCompanies.map(c => c.name.toLowerCase()));

    let imported = 0;
    let skippedDuplicates = 0;
    let skippedErrors = 0;
    const errors: string[] = [];

    for (const wc of selectedCompanies) {
      if (existingNames.has(wc.name.toLowerCase())) {
        skippedDuplicates++;
        continue;
      }

      try {
        const [newCompany] = await db.insert(companies).values({
          name: wc.name,
          websiteUrl: wc.websiteUrl,
          description: wc.description,
          industryName: resolvedIndustryName,
          sectorName: resolvedSectorName,
          employeeCount: wc.employeeCount,
          foundedYear: wc.foundedYear,
          companySize: wc.employeeCount ? this.estimateCompanySize(wc.employeeCount) : null,
          verificationStatus: 'unverified',
        }).returning();

        if (wc.countryCode && newCompany) {
          try {
            const [country] = await db.select().from(countries)
              .where(eq(countries.iso2, wc.countryCode.toUpperCase()))
              .limit(1);

            if (country) {
              await db.insert(companyLocations).values({
                companyId: newCompany.id,
                countryId: country.id,
                isPrimary: true,
                confidence: 'medium',
                source: 'wikidata',
              });
            }
          } catch (locErr) {
            const locErrMsg = locErr instanceof Error ? locErr.message : String(locErr);
            errors.push(`Location assignment failed for "${wc.name}": ${locErrMsg}`);
          }
        }

        existingNames.add(wc.name.toLowerCase());
        imported++;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('unique') || errMsg.includes('duplicate')) {
          skippedDuplicates++;
        } else {
          errors.push(`Failed to import "${wc.name}": ${errMsg}`);
          skippedErrors++;
        }
      }
    }

    console.log(`[Wikidata] Import complete: ${imported} imported, ${skippedDuplicates} duplicates, ${skippedErrors} errors`);

    return {
      industry: resolvedIndustryName,
      sector: resolvedSectorName,
      total: selectedCompanies.length,
      imported,
      skippedDuplicates,
      skippedErrors,
      errors,
      companies: selectedCompanies,
    };
  }

  async getIndustryGaps(sectorName?: string): Promise<Array<{
    industryName: string;
    sectorName: string;
    currentCount: number;
    maxSlots: number;
    gapCount: number;
  }>> {
    const allIndustries = sectorName
      ? await db.select().from(industries).where(eq(industries.sectorName, sectorName))
      : await db.select().from(industries);

    const gaps = [];
    for (const industry of allIndustries) {
      const companiesInIndustry = await db.select({ id: companies.id })
        .from(companies)
        .where(eq(companies.industryName, industry.name));

      const currentCount = companiesInIndustry.length;
      const maxSlots = 20;

      if (currentCount < maxSlots) {
        gaps.push({
          industryName: industry.name,
          sectorName: industry.sectorName,
          currentCount,
          maxSlots,
          gapCount: maxSlots - currentCount,
        });
      }
    }

    return gaps.sort((a, b) => b.gapCount - a.gapCount);
  }

  private estimateCompanySize(employeeCount: string): string {
    const numMatch = employeeCount.match(/[\d,.]+/);
    if (!numMatch) return 'SME';

    const num = parseFloat(numMatch[0].replace(/,/g, ''));
    if (employeeCount.includes('M')) return 'Large Enterprise';
    if (employeeCount.includes('K')) {
      const thousands = num;
      if (thousands >= 10) return 'Large Enterprise';
      if (thousands >= 1) return 'Mid-size Enterprise';
      return 'SME';
    }
    if (num >= 10000) return 'Large Enterprise';
    if (num >= 1000) return 'Mid-size Enterprise';
    if (num >= 250) return 'SME';
    return 'Small Business';
  }
}

export const wikidataService = new WikidataService();
