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
const FETCH_TIMEOUT_MS = 28000;

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
  // Banking & Financial Services
  'bank': ['Q22687'],
  'banking': ['Q22687'],
  'commercial bank': ['Q22687'],
  'investment bank': ['Q17156070'],
  'investment banking': ['Q17156070'],
  'microfinance': ['Q1339811'],
  'credit union': ['Q745801'],
  'savings bank': ['Q847017'],
  'central bank': ['Q1553944'],
  'insurance': ['Q43183'],
  'insurance company': ['Q43183'],
  'reinsurance': ['Q190507'],
  'fintech': ['Q1655921'],
  'stock exchange': ['Q11691'],
  'asset management': ['Q4830453'],
  'hedge fund': ['Q846982'],
  'private equity': ['Q1527570'],
  'venture capital': ['Q162668'],
  'mortgage': ['Q151794'],
  'payment': ['Q4830453'],

  // Technology
  'software': ['Q6881511'],
  'software company': ['Q6881511'],
  'technology': ['Q4830453'],
  'tech': ['Q4830453'],
  'semiconductor': ['Q327333'],
  'semiconductor company': ['Q327333'],
  'internet': ['Q2349975'],
  'internet company': ['Q2349975'],
  'e-commerce': ['Q183385'],
  'ecommerce': ['Q183385'],
  'artificial intelligence': ['Q4830453'],
  'cloud computing': ['Q4830453'],
  'cybersecurity': ['Q4830453'],
  'data analytics': ['Q4830453'],
  'robotics': ['Q4830453'],

  // Telecommunications
  'telecom': ['Q622569'],
  'telecoms': ['Q622569'],
  'telecommunications': ['Q622569'],
  'mobile': ['Q2061309'],
  'mobile operator': ['Q2061309'],
  'wireless': ['Q2061309'],
  'internet service provider': ['Q2349975'],
  'isp': ['Q2349975'],
  'broadband': ['Q2349975'],
  'satellite': ['Q855269'],

  // Energy
  'energy': ['Q1057118'],
  'oil': ['Q130933'],
  'oil company': ['Q130933'],
  'petroleum': ['Q130933'],
  'gas': ['Q130933'],
  'oil and gas': ['Q130933', 'Q40185'],
  'renewable energy': ['Q1057118'],
  'solar': ['Q1057118'],
  'wind energy': ['Q1057118'],
  'nuclear': ['Q1057118'],
  'electricity': ['Q1057118'],
  'power': ['Q1057118'],
  'mining': ['Q161379'],
  'coal': ['Q161379'],

  // Transportation & Logistics
  'airline': ['Q46970'],
  'airlines': ['Q46970'],
  'aviation': ['Q46970'],
  'airport': ['Q1248784'],
  'shipping': ['Q18388218'],
  'maritime': ['Q18388218'],
  'railway': ['Q201896'],
  'rail': ['Q201896'],
  'railroad': ['Q201896'],
  'logistics': ['Q177597'],
  'transport': ['Q177597'],
  'trucking': ['Q177597'],
  'freight': ['Q177597'],
  'courier': ['Q177597'],
  'port': ['Q44782'],

  // Healthcare & Pharmaceuticals
  'hospital': ['Q16917'],
  'healthcare': ['Q4916'],
  'health': ['Q4916'],
  'pharmaceutical': ['Q507443'],
  'pharma': ['Q507443'],
  'drug': ['Q507443'],
  'biotech': ['Q4830453'],
  'biotechnology': ['Q4830453'],
  'medical': ['Q507443'],
  'clinic': ['Q16917'],
  'laboratory': ['Q4830453'],

  // Manufacturing
  'manufacturing': ['Q13235160'],
  'manufacturer': ['Q13235160'],
  'factory': ['Q13235160'],
  'automobile': ['Q786820'],
  'automotive': ['Q786820'],
  'car': ['Q786820'],
  'vehicle': ['Q786820'],
  'steel': ['Q83588'],
  'chemical': ['Q83588'],
  'chemicals': ['Q83588'],
  'cement': ['Q13235160'],
  'textile': ['Q13235160'],
  'electronics': ['Q13235160'],

  // Retail
  'retail': ['Q507029'],
  'retailer': ['Q507029'],
  'supermarket': ['Q180674'],
  'grocery': ['Q180674'],
  'department store': ['Q216107'],
  'fashion': ['Q507029'],
  'clothing': ['Q507029'],
  'luxury': ['Q507029'],

  // Food & Beverage
  'food': ['Q1454471'],
  'food company': ['Q1454471'],
  'beverage': ['Q4540', 'Q1454471'],
  'brewery': ['Q4540'],
  'beer': ['Q4540'],
  'restaurant': ['Q11707'],
  'fast food': ['Q11707'],
  'agriculture': ['Q389970'],
  'agricultural': ['Q389970'],
  'agribusiness': ['Q389970'],
  'farming': ['Q389970'],
  'farm': ['Q389970'],
  'fertilizer': ['Q167336'],

  // Real Estate
  'real estate': ['Q1137012'],
  'property': ['Q1137012'],
  'construction': ['Q562966'],
  'building': ['Q562966'],

  // Media & Entertainment
  'media': ['Q1750916'],
  'broadcast': ['Q41298'],
  'broadcasting': ['Q41298'],
  'television': ['Q41298'],
  'tv': ['Q41298'],
  'film': ['Q18127', 'Q212156'],
  'movie': ['Q18127'],
  'music': ['Q18127'],
  'publishing': ['Q4830453'],
  'newspaper': ['Q11032'],
  'news': ['Q11032'],
  'radio': ['Q41298'],
  'gaming': ['Q4830453'],

  // Professional Services
  'consulting': ['Q4830453'],
  'law firm': ['Q4830453'],
  'accounting': ['Q4830453'],
  'audit': ['Q4830453'],

  // Education
  'university': ['Q3918'],
  'education': ['Q3914', 'Q3918'],
  'school': ['Q3914'],
  'college': ['Q3918'],
  'training': ['Q4830453'],

  // Travel & Tourism
  'hotel': ['Q27686'],
  'hotels': ['Q27686'],
  'hospitality': ['Q27686'],
  'tourism': ['Q27686'],
  'travel': ['Q27686'],
  'resort': ['Q27686'],
  'airline': ['Q46970'],
};

function getQidsForTerm(term: string): string[] {
  const lower = term.toLowerCase().trim();
  if (TERM_TO_QID_MAP[lower]) return TERM_TO_QID_MAP[lower];
  // partial match — find the best (longest) matching key
  let bestMatch: string[] = [];
  let bestLen = 0;
  for (const key of Object.keys(TERM_TO_QID_MAP)) {
    if ((lower.includes(key) || key.includes(lower)) && key.length > bestLen) {
      bestMatch = TERM_TO_QID_MAP[key];
      bestLen = key.length;
    }
  }
  return bestMatch;
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
      throw new Error('Wikidata query timed out. Try adding a country code (e.g. "NG", "ZA", "US") to narrow results.');
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
        console.log(`[Wikidata] QID query returned 0 results, falling back to label search`);
      } catch (err: any) {
        console.warn(`[Wikidata] QID query failed: ${err.message} — falling back to label search`);
        // If it timed out, re-throw so user gets a helpful message
        if (err.message.includes('timed out')) throw err;
      }
    }

    // Fallback: label CONTAINS search — works for any term
    console.log(`[Wikidata] Running label search for "${searchTerm}"`);
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
