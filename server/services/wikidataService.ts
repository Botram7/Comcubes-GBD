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

const WIKIDATA_LANG_LIST = '"en","fr","pt","es","ar","de","zh","ja","sw","ha","yo","am","hi","ko","ru","it","nl","tr","pl","id"';
const WIKIDATA_LABEL_LANGS = 'en,fr,pt,es,ar,de,zh,ja,sw,ha,yo,am,hi,ko,ru,it,nl,tr,pl,id';

const INDUSTRY_TO_WIKIDATA_MAP: Record<string, string[]> = {
  'Commercial Banking': ['commercial bank', 'bank'],
  'Investment Banking': ['investment bank'],
  'Asset Management': ['asset management company', 'investment management'],
  'Insurance Underwriting': ['insurance company'],
  'FinTech': ['financial technology company'],
  'Stock Exchanges': ['stock exchange'],
  'Cryptocurrency Exchanges': ['cryptocurrency exchange'],
  'Consumer Finance': ['consumer finance', 'financial services company'],
  'Credit Cards': ['credit card company'],
  'Airlines': ['airline'],
  'Passenger Vehicles': ['automobile manufacturer'],
  'Electric Vehicles': ['electric vehicle manufacturer'],
  'Motorcycles': ['motorcycle manufacturer'],
  'Commercial Trucks': ['truck manufacturer'],
  'Auto Parts Manufacturing': ['auto parts manufacturer'],
  'Pharmaceutical Companies': ['pharmaceutical company'],
  'Hospital Management': ['hospital', 'hospital chain'],
  'Diagnostic Labs': ['medical laboratory'],
  'Biopharmaceuticals': ['biopharmaceutical company'],
  'Generic Drugs': ['generic drug manufacturer'],
  'Film Production': ['film production company', 'film studio'],
  'Music Industry': ['record label', 'music company'],
  'Broadcasting': ['broadcasting company', 'television network'],
  'Digital Media': ['digital media company'],
  'Video Games': ['video game company'],
  'Oil and Gas': ['oil company', 'petroleum company'],
  'Renewable Energy': ['renewable energy company'],
  'Solar Energy': ['solar energy company'],
  'Wind Energy': ['wind energy company'],
  'Electricity Distribution': ['electric utility', 'electricity company'],
  'Telecommunications': ['telecommunications company'],
  'Broadband Providers': ['internet service provider'],
  'Mobile Networks': ['mobile phone operator'],
  'Enterprise Software': ['software company'],
  'Cloud Computing': ['cloud computing company'],
  'Semiconductor': ['semiconductor company'],
  'Consumer Electronics': ['consumer electronics company'],
  'E-commerce': ['e-commerce company', 'online retailer'],
  'Department Stores': ['department store', 'retail chain'],
  'Grocery Chains': ['supermarket chain', 'grocery store chain'],
  'Luxury Fashion': ['luxury fashion house', 'luxury brand'],
  'Construction Services': ['construction company'],
  'Civil Engineering': ['civil engineering company'],
  'Building Materials': ['building materials company'],
  'Universities': ['university'],
  'EdTech': ['educational technology company'],
  'Crop Production': ['agricultural company'],
  'Food Processing': ['food processing company'],
  'Beverage Production': ['beverage company'],
  'Mining': ['mining company'],
  'Steel Manufacturing': ['steel company'],
  'Chemical Manufacturing': ['chemical company'],
  'Shipping': ['shipping company', 'shipping line'],
  'Rail Transport': ['railway company'],
  'Hotels and Resorts': ['hotel chain', 'hotel company'],
  'Real Estate Development': ['real estate company', 'property developer'],
};

function buildIndustrySearchQuery(searchTerms: string[], countryCode?: string, continentName?: string, limit: number = 50): string {
  const countryFilter = countryCode
    ? `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P297 "${countryCode.toUpperCase()}" .`
    : '';

  let continentFilter = '';
  if (continentName && !countryCode) {
    const continentQids: Record<string, string> = {
      'africa': 'Q15',
      'europe': 'Q46',
      'asia': 'Q48',
      'north america': 'Q49',
      'south america': 'Q18',
      'oceania': 'Q55643',
      'antarctica': 'Q51',
    };
    const qid = continentQids[continentName.toLowerCase()];
    if (qid) {
      continentFilter = `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P30 wd:${qid} .`;
    }
  }

  const nameFilters = searchTerms
    .map(term => {
      const escaped = term.replace(/"/g, '\\"').toLowerCase();
      return `CONTAINS(LCASE(?companyLabel), "${escaped}")`;
    });

  const descFilters = searchTerms
    .map(term => {
      const escaped = term.replace(/"/g, '\\"').toLowerCase();
      return `(BOUND(?description) && CONTAINS(LCASE(?description), "${escaped}"))`;
    });

  const allFilters = [...nameFilters, ...descFilters].join(' || ');

  return `
    SELECT DISTINCT ?company ?companyLabel ?website ?countryLabel ?countryCode ?founded ?employees ?description WHERE {
      ?company wdt:P31/wdt:P279* wd:Q4830453 .
      ${countryFilter}
      ${continentFilter}
      OPTIONAL { ?company wdt:P856 ?website . }
      OPTIONAL {
        ?company wdt:P17 ?cEntity .
        ?cEntity rdfs:label ?countryLabel .
        FILTER(LANG(?countryLabel) IN (${WIKIDATA_LANG_LIST}))
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      OPTIONAL {
        ?company schema:description ?description .
        FILTER(LANG(?description) IN (${WIKIDATA_LANG_LIST}))
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${WIKIDATA_LABEL_LANGS}" . }
      ${allFilters ? `FILTER(${allFilters})` : ''}
    }
    LIMIT ${limit}
  `;
}

function buildGenericCompanyQuery(countryCode?: string, continentName?: string, limit: number = 100): string {
  const countryFilter = countryCode
    ? `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P297 "${countryCode.toUpperCase()}" .`
    : '';

  let continentFilter = '';
  if (continentName && !countryCode) {
    const continentQids: Record<string, string> = {
      'africa': 'Q15',
      'europe': 'Q46',
      'asia': 'Q48',
      'north america': 'Q49',
      'south america': 'Q18',
      'oceania': 'Q55643',
      'antarctica': 'Q51',
    };
    const qid = continentQids[continentName.toLowerCase()];
    if (qid) {
      continentFilter = `?company wdt:P17 ?countryEntity . ?countryEntity wdt:P30 wd:${qid} .`;
    }
  }

  return `
    SELECT DISTINCT ?company ?companyLabel ?website ?countryLabel ?countryCode ?founded ?employees ?description WHERE {
      ?company wdt:P31/wdt:P279* wd:Q4830453 .
      ?company wdt:P856 ?website .
      ${countryFilter}
      ${continentFilter}
      OPTIONAL {
        ?company wdt:P17 ?cEntity .
        ?cEntity rdfs:label ?countryLabel .
        FILTER(LANG(?countryLabel) IN (${WIKIDATA_LANG_LIST}))
        OPTIONAL { ?cEntity wdt:P297 ?countryCode . }
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      OPTIONAL {
        ?company schema:description ?description .
        FILTER(LANG(?description) IN (${WIKIDATA_LANG_LIST}))
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "${WIKIDATA_LABEL_LANGS}" . }
    }
    LIMIT ${limit}
  `;
}

async function executeSparqlQuery(query: string): Promise<any[]> {
  const url = `${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'COMCUBES-Directory/1.0 (https://comcubes.com; admin@comcubes.com)',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Wikidata SPARQL query failed (${response.status}): ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.results?.bindings || [];
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
      description: result.description?.value || null,
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

    let searchTerms: string[] = [];

    if (industryName) {
      const mapped = INDUSTRY_TO_WIKIDATA_MAP[industryName];
      if (mapped) {
        searchTerms = mapped;
      } else {
        searchTerms = industryName.toLowerCase().split(/\s+and\s+|\s+&\s+/).map(t => t.trim());
      }
    } else if (sectorName) {
      searchTerms = sectorName.toLowerCase().split(/\s+and\s+|\s+&\s+/).map(t => t.trim());
    }

    let sparqlQuery: string;
    if (searchTerms.length > 0) {
      sparqlQuery = buildIndustrySearchQuery(searchTerms, countryCode, continentName, limit);
    } else {
      sparqlQuery = buildGenericCompanyQuery(countryCode, continentName, limit);
    }

    console.log(`[Wikidata] Querying for industry="${industryName || 'all'}", sector="${sectorName || 'all'}", country="${countryCode || 'all'}", continent="${continentName || 'all'}"`);

    const results = await executeSparqlQuery(sparqlQuery);
    const parsedCompanies = parseWikidataResults(results);

    console.log(`[Wikidata] Found ${parsedCompanies.length} companies from ${results.length} raw results`);

    return parsedCompanies;
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
      if (sectorMatch.matchType !== "exact") {
        console.log(`[Wikidata] Sector fuzzy match: "${sectorName}" → "${sectorMatch.name}" (confidence: ${sectorMatch.confidence}, type: ${sectorMatch.matchType})`);
      }
      resolvedSectorName = sectorMatch.name;
      if (sectorMatch.needsReview) {
        console.warn(`[Wikidata] Low confidence sector match: "${sectorName}" → "${sectorMatch.name}" (confidence: ${sectorMatch.confidence}) — flagged for review`);
      }
    } else {
      console.warn(`[Wikidata] No sector match found for "${sectorName}" — using original name`);
    }

    const industryMatch = matchIndustry(industryName, resolvedSectorName);
    if (industryMatch.name) {
      if (industryMatch.matchType !== "exact") {
        console.log(`[Wikidata] Industry fuzzy match: "${industryName}" → "${industryMatch.name}" (confidence: ${industryMatch.confidence}, type: ${industryMatch.matchType})`);
      }
      resolvedIndustryName = industryMatch.name;
      if (industryMatch.needsReview) {
        console.warn(`[Wikidata] Low confidence industry match: "${industryName}" → "${industryMatch.name}" (confidence: ${industryMatch.confidence}) — flagged for review`);
      }
    } else {
      console.warn(`[Wikidata] No industry match found for "${industryName}" — using original name`);
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
            } else {
              console.warn(`[Wikidata] Country code "${wc.countryCode}" not found in database for "${wc.name}"`);
              errors.push(`Country code "${wc.countryCode}" not found for "${wc.name}" — imported without location`);
            }
          } catch (locErr) {
            const locErrMsg = locErr instanceof Error ? locErr.message : String(locErr);
            console.warn(`[Wikidata] Location insert failed for ${wc.name}: ${locErrMsg}`);
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
          console.warn(`[Wikidata] Error importing ${wc.name}:`, err);
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
