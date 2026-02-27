import { db } from '../db';
import { companies, industries, companyLocations, countries } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

const INDUSTRY_TO_WIKIDATA_MAP: Record<string, string[]> = {
  'Commercial Banking': ['Q000000', 'commercial bank', 'bank'],
  'Investment Banking': ['Q000000', 'investment bank'],
  'Asset Management': ['Q000000', 'asset management company', 'investment management'],
  'Insurance Underwriting': ['Q000000', 'insurance company'],
  'FinTech': ['Q000000', 'financial technology company'],
  'Stock Exchanges': ['Q000000', 'stock exchange'],
  'Cryptocurrency Exchanges': ['Q000000', 'cryptocurrency exchange'],
  'Consumer Finance': ['Q000000', 'consumer finance', 'financial services company'],
  'Credit Cards': ['Q000000', 'credit card company'],
  'Airlines': ['Q000000', 'airline'],
  'Passenger Vehicles': ['Q000000', 'automobile manufacturer'],
  'Electric Vehicles': ['Q000000', 'electric vehicle manufacturer'],
  'Motorcycles': ['Q000000', 'motorcycle manufacturer'],
  'Commercial Trucks': ['Q000000', 'truck manufacturer'],
  'Auto Parts Manufacturing': ['Q000000', 'auto parts manufacturer'],
  'Pharmaceutical Companies': ['Q000000', 'pharmaceutical company'],
  'Hospital Management': ['Q000000', 'hospital', 'hospital chain'],
  'Diagnostic Labs': ['Q000000', 'medical laboratory'],
  'Biopharmaceuticals': ['Q000000', 'biopharmaceutical company'],
  'Generic Drugs': ['Q000000', 'generic drug manufacturer'],
  'Film Production': ['Q000000', 'film production company', 'film studio'],
  'Music Industry': ['Q000000', 'record label', 'music company'],
  'Broadcasting': ['Q000000', 'broadcasting company', 'television network'],
  'Digital Media': ['Q000000', 'digital media company'],
  'Video Games': ['Q000000', 'video game company'],
  'Oil and Gas': ['Q000000', 'oil company', 'petroleum company'],
  'Renewable Energy': ['Q000000', 'renewable energy company'],
  'Solar Energy': ['Q000000', 'solar energy company'],
  'Wind Energy': ['Q000000', 'wind energy company'],
  'Electricity Distribution': ['Q000000', 'electric utility', 'electricity company'],
  'Telecommunications': ['Q000000', 'telecommunications company'],
  'Broadband Providers': ['Q000000', 'internet service provider'],
  'Mobile Networks': ['Q000000', 'mobile phone operator'],
  'Enterprise Software': ['Q000000', 'software company'],
  'Cloud Computing': ['Q000000', 'cloud computing company'],
  'Semiconductor': ['Q000000', 'semiconductor company'],
  'Consumer Electronics': ['Q000000', 'consumer electronics company'],
  'E-commerce': ['Q000000', 'e-commerce company', 'online retailer'],
  'Department Stores': ['Q000000', 'department store', 'retail chain'],
  'Grocery Chains': ['Q000000', 'supermarket chain', 'grocery store chain'],
  'Luxury Fashion': ['Q000000', 'luxury fashion house', 'luxury brand'],
  'Construction Services': ['Q000000', 'construction company'],
  'Civil Engineering': ['Q000000', 'civil engineering company'],
  'Building Materials': ['Q000000', 'building materials company'],
  'Universities': ['Q000000', 'university'],
  'EdTech': ['Q000000', 'educational technology company'],
  'Crop Production': ['Q000000', 'agricultural company'],
  'Food Processing': ['Q000000', 'food processing company'],
  'Beverage Production': ['Q000000', 'beverage company'],
  'Mining': ['Q000000', 'mining company'],
  'Steel Manufacturing': ['Q000000', 'steel company'],
  'Chemical Manufacturing': ['Q000000', 'chemical company'],
  'Shipping': ['Q000000', 'shipping company', 'shipping line'],
  'Rail Transport': ['Q000000', 'railway company'],
  'Hotels and Resorts': ['Q000000', 'hotel chain', 'hotel company'],
  'Real Estate Development': ['Q000000', 'real estate company', 'property developer'],
};

function buildSparqlQuery(industryKeywords: string[], countryCode?: string, limit: number = 50): string {
  const keywordFilters = industryKeywords
    .map(kw => `CONTAINS(LCASE(?desc), "${kw.toLowerCase()}")`)
    .join(' || ');

  const countryFilter = countryCode
    ? `?company wdt:P17 ?country . ?country wdt:P297 "${countryCode}" .`
    : '';

  const continentFilter = '';

  return `
    SELECT DISTINCT ?company ?companyLabel ?website ?countryLabel ?countryCode ?founded ?employees ?description WHERE {
      ?company wdt:P31/wdt:P279* wd:Q4830453 .
      ${countryFilter}
      ${continentFilter}
      OPTIONAL { ?company wdt:P856 ?website . }
      OPTIONAL {
        ?company wdt:P17 ?countryEntity .
        ?countryEntity rdfs:label ?countryLabel .
        FILTER(LANG(?countryLabel) = "en")
        OPTIONAL { ?countryEntity wdt:P297 ?countryCode . }
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      OPTIONAL {
        ?company schema:description ?description .
        FILTER(LANG(?description) = "en")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
      ${keywordFilters ? `FILTER(${keywordFilters})` : ''}
    }
    LIMIT ${limit}
  `;
}

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

  const termFilters = searchTerms
    .map(term => {
      const escaped = term.replace(/"/g, '\\"').toLowerCase();
      return `CONTAINS(LCASE(?companyLabel), "${escaped}")`;
    });

  const descFilters = searchTerms
    .map(term => {
      const escaped = term.replace(/"/g, '\\"').toLowerCase();
      return `CONTAINS(LCASE(?description), "${escaped}")`;
    });

  const allFilters = [...termFilters, ...descFilters].join(' || ');

  return `
    SELECT DISTINCT ?company ?companyLabel ?website ?countryLabel ?countryCode ?founded ?employees ?description WHERE {
      ?company wdt:P31/wdt:P279* wd:Q4830453 .
      ${countryFilter}
      ${continentFilter}
      OPTIONAL { ?company wdt:P856 ?website . }
      OPTIONAL {
        ?company wdt:P17 ?cEntity .
        ?cEntity rdfs:label ?countryLabel .
        FILTER(LANG(?countryLabel) = "en")
        OPTIONAL { ?cEntity wdt:P297 ?countryCode . }
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      OPTIONAL {
        ?company schema:description ?description .
        FILTER(LANG(?description) = "en")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
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
        FILTER(LANG(?countryLabel) = "en")
        OPTIONAL { ?cEntity wdt:P297 ?countryCode . }
      }
      OPTIONAL { ?company wdt:P571 ?founded . }
      OPTIONAL { ?company wdt:P1128 ?employees . }
      OPTIONAL {
        ?company schema:description ?description .
        FILTER(LANG(?description) = "en")
      }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
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

    if (!name || name.startsWith('Q') || seen.has(name.toLowerCase())) {
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
        searchTerms = mapped.filter(t => !t.startsWith('Q'));
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
    const companies = parseWikidataResults(results);

    console.log(`[Wikidata] Found ${companies.length} companies from ${results.length} raw results`);

    return companies;
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

    const existingNames = existingCompanies.map(c => c.name.toLowerCase());

    const newCompanies = wikidataCompanies.filter(
      wc => !existingNames.includes(wc.name.toLowerCase())
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

    const existingCompanies = await db.select({ name: companies.name })
      .from(companies)
      .where(eq(companies.industryName, industryName));

    const existingNames = new Set(existingCompanies.map(c => c.name.toLowerCase()));

    let imported = 0;
    let skippedDuplicates = 0;
    let skippedErrors = 0;

    for (const wc of selectedCompanies) {
      if (existingNames.has(wc.name.toLowerCase())) {
        skippedDuplicates++;
        continue;
      }

      try {
        const [newCompany] = await db.insert(companies).values({
          name: wc.name,
          websiteUrl: wc.websiteUrl,
          industryName,
          sectorName,
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
            console.warn(`[Wikidata] Could not assign location for ${wc.name}:`, locErr);
          }
        }

        existingNames.add(wc.name.toLowerCase());
        imported++;
      } catch (err) {
        console.warn(`[Wikidata] Error importing ${wc.name}:`, err);
        skippedErrors++;
      }
    }

    console.log(`[Wikidata] Import complete: ${imported} imported, ${skippedDuplicates} duplicates, ${skippedErrors} errors`);

    return {
      industry: industryName,
      sector: sectorName,
      total: selectedCompanies.length,
      imported,
      skippedDuplicates,
      skippedErrors,
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
