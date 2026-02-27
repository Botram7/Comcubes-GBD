import OpenAI from "openai";
import { db } from "../db";
import { companies, industries, sectors, countries, companyLocations } from "@shared/schema";
import { eq, sql, ilike } from "drizzle-orm";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export interface GeneratedCompany {
  name: string;
  websiteUrl: string;
  description: string;
  employeeCount: string;
  foundedYear: number | null;
  country: string;
  isDuplicate?: boolean;
  urlReachable?: boolean | null;
}

export interface GenerationRequest {
  industryName: string;
  sectorName: string;
  count: number;
  geographicFocus?: string;
}

export interface GenerationResult {
  industryName: string;
  sectorName: string;
  currentCount: number;
  maxSlots: number;
  generated: GeneratedCompany[];
  errors: string[];
}

export interface IndustryGap {
  industryName: string;
  sectorName: string;
  currentCount: number;
  maxSlots: number;
  gap: number;
}

export async function getIndustryGaps(maxSlots: number = 20): Promise<IndustryGap[]> {
  const allIndustries = await db.select().from(industries).orderBy(industries.name);

  const companyCounts = await db
    .select({
      industryName: companies.industryName,
      count: sql<number>`count(*)`
    })
    .from(companies)
    .groupBy(companies.industryName);

  const countMap = new Map<string, number>();
  for (const row of companyCounts) {
    countMap.set(row.industryName, Number(row.count));
  }

  const gaps: IndustryGap[] = [];
  for (const industry of allIndustries) {
    const currentCount = countMap.get(industry.name) || 0;
    if (currentCount < maxSlots) {
      gaps.push({
        industryName: industry.name,
        sectorName: industry.sectorName,
        currentCount,
        maxSlots,
        gap: maxSlots - currentCount,
      });
    }
  }

  return gaps.sort((a, b) => b.gap - a.gap);
}

export async function generateCompaniesForIndustry(
  request: GenerationRequest
): Promise<GenerationResult> {
  const { industryName, sectorName, count, geographicFocus } = request;
  const errors: string[] = [];

  const existingCompanies = await db
    .select({ name: companies.name })
    .from(companies)
    .where(eq(companies.industryName, industryName));

  const existingNames = new Set(existingCompanies.map((c) => c.name.toLowerCase()));
  const currentCount = existingCompanies.length;
  const maxSlots = 20;

  const slotsAvailable = Math.max(0, maxSlots - currentCount);
  const toGenerate = Math.min(count, slotsAvailable);

  if (toGenerate === 0) {
    return {
      industryName,
      sectorName,
      currentCount,
      maxSlots,
      generated: [],
      errors: [`Industry "${industryName}" already has ${currentCount}/${maxSlots} companies. No slots available.`],
    };
  }

  const geographicInstruction = geographicFocus
    ? `Focus specifically on companies headquartered in or primarily operating in ${geographicFocus}. Prioritize well-known, notable companies from this region.`
    : "Include a diverse global mix of companies from different countries and regions.";

  const existingNamesList = existingCompanies.map((c) => c.name).join(", ");

  const prompt = `You are a business research assistant. Generate a list of ${toGenerate} real, notable, verifiable companies that operate in the "${industryName}" industry (part of the "${sectorName}" sector).

${geographicInstruction}

IMPORTANT RULES:
- Only include REAL companies that actually exist and can be verified
- Do NOT include any of these existing companies: ${existingNamesList || "none"}
- Each company must have a working website URL
- Provide accurate information based on your knowledge

For each company, provide:
1. name: Official company name
2. websiteUrl: The company's official website URL (must start with https://)
3. description: A 1-2 sentence professional description of what the company does
4. employeeCount: Estimated employee count as a string (e.g., "10,000+", "500-1,000", "50,000+")
5. foundedYear: Year the company was founded (number or null if unknown)
6. country: Country where the company is headquartered

Respond with ONLY a valid JSON array of objects. No markdown, no explanation, just the JSON array.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise business data researcher. Always respond with valid JSON arrays only. No markdown formatting, no code blocks, no explanations."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      errors.push("OpenAI returned empty response");
      return { industryName, sectorName, currentCount, maxSlots, generated: [], errors };
    }

    let cleanContent = content;
    if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    let parsed: any[];
    try {
      parsed = JSON.parse(cleanContent);
    } catch (parseError) {
      errors.push(`Failed to parse AI response as JSON: ${(parseError as Error).message}`);
      return { industryName, sectorName, currentCount, maxSlots, generated: [], errors };
    }

    if (!Array.isArray(parsed)) {
      errors.push("AI response is not an array");
      return { industryName, sectorName, currentCount, maxSlots, generated: [], errors };
    }

    const generated: GeneratedCompany[] = [];
    for (const item of parsed) {
      if (!item.name || !item.websiteUrl) {
        errors.push(`Skipping invalid entry: missing name or websiteUrl`);
        continue;
      }

      const isDuplicate = existingNames.has(item.name.toLowerCase());

      let websiteUrl = item.websiteUrl;
      if (!websiteUrl.startsWith("http")) {
        websiteUrl = `https://${websiteUrl}`;
      }

      generated.push({
        name: item.name,
        websiteUrl,
        description: item.description || "",
        employeeCount: item.employeeCount || "",
        foundedYear: item.foundedYear ? Number(item.foundedYear) : null,
        country: item.country || "",
        isDuplicate,
        urlReachable: null,
      });
    }

    return { industryName, sectorName, currentCount, maxSlots, generated, errors };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    errors.push(`OpenAI API error: ${errMsg}`);
    return { industryName, sectorName, currentCount, maxSlots, generated: [], errors };
  }
}

export async function generateBatchCompanies(
  industryNames: string[],
  geographicFocus?: string,
  countPerIndustry: number = 5
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];

  for (const industryName of industryNames) {
    const [industry] = await db
      .select()
      .from(industries)
      .where(eq(industries.name, industryName))
      .limit(1);

    if (!industry) {
      results.push({
        industryName,
        sectorName: "",
        currentCount: 0,
        maxSlots: 20,
        generated: [],
        errors: [`Industry "${industryName}" not found in database`],
      });
      continue;
    }

    const result = await generateCompaniesForIndustry({
      industryName: industry.name,
      sectorName: industry.sectorName,
      count: countPerIndustry,
      geographicFocus,
    });

    results.push(result);

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

export async function importGeneratedCompanies(
  companiesToImport: Array<{
    name: string;
    websiteUrl: string;
    industryName: string;
    sectorName: string;
    employeeCount?: string;
    foundedYear?: number | null;
    country?: string;
  }>
): Promise<{ imported: number; skipped: number; errors: string[] }> {
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const company of companiesToImport) {
    try {
      const existing = await db
        .select({ id: companies.id })
        .from(companies)
        .where(
          eq(companies.name, company.name)
        )
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      const [created] = await db
        .insert(companies)
        .values({
          name: company.name,
          websiteUrl: company.websiteUrl,
          industryName: company.industryName,
          sectorName: company.sectorName,
          employeeCount: company.employeeCount || null,
          foundedYear: company.foundedYear || null,
          companySize: inferCompanySize(company.employeeCount),
          verificationStatus: "unverified",
        })
        .returning();

      if (created && company.country) {
        try {
          const [country] = await db
            .select()
            .from(countries)
            .where(ilike(countries.name, company.country))
            .limit(1);

          if (country) {
            await db.insert(companyLocations).values({
              companyId: created.id,
              countryId: country.id,
              isPrimary: true,
              confidence: "medium",
              source: "ai_generated",
            });
          }
        } catch (locErr) {
          // non-fatal
        }
      }

      imported++;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      if (errMsg.includes("unique") || errMsg.includes("duplicate")) {
        skipped++;
      } else {
        errors.push(`Failed to import "${company.name}": ${errMsg}`);
      }
    }
  }

  return { imported, skipped, errors };
}

function inferCompanySize(employeeCount?: string | null): string {
  if (!employeeCount) return "Unknown";

  const cleaned = employeeCount.replace(/[,+\s]/g, "");
  const match = cleaned.match(/(\d+)/);
  if (!match) return "Unknown";

  const num = parseInt(match[1], 10);
  if (num >= 50000) return "Large Enterprise";
  if (num >= 10000) return "Large Enterprise";
  if (num >= 1000) return "Mid-Market";
  if (num >= 200) return "SME";
  if (num >= 50) return "Small Business";
  return "Startup";
}

export async function validateUrls(
  generatedCompanies: GeneratedCompany[]
): Promise<GeneratedCompany[]> {
  const validated = [...generatedCompanies];

  for (const company of validated) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(company.websiteUrl, {
        method: "HEAD",
        signal: controller.signal,
        headers: { "User-Agent": "COMCUBES-URL-Checker/1.0" },
        redirect: "follow",
      });

      clearTimeout(timeoutId);
      company.urlReachable = response.ok || (response.status >= 200 && response.status < 400);
    } catch {
      company.urlReachable = false;
    }
  }

  return validated;
}
