import OpenAI from "openai";
import { db } from "../db";
import { companies } from "@shared/schema";
import { eq, sql, or, isNull } from "drizzle-orm";
import type { Company } from "@shared/schema";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface EnrichmentResult {
  companyId: number;
  companyName: string;
  description: string;
  success: boolean;
  error?: string;
}

export async function generateCompanyDescription(company: Company): Promise<string> {
  const details = [
    company.industryName && `Industry: ${company.industryName}`,
    company.sectorName && `Sector: ${company.sectorName}`,
    company.foundedYear && `Founded: ${company.foundedYear}`,
    company.employeeCount && `Employees: ${company.employeeCount}`,
    company.companySize && `Size: ${company.companySize}`,
    company.specializationTags && `Specializations: ${company.specializationTags}`,
    company.websiteUrl && `Website: ${company.websiteUrl}`,
  ].filter(Boolean).join(", ");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a business directory content writer. Write concise, professional company descriptions for a global business directory. Each description should be 2-3 sentences, factual, and informative. Do not use marketing hype or unverifiable claims. Focus on what the company does, its industry positioning, and any notable characteristics. Do not start with the company name - the name is already displayed separately.`,
      },
      {
        role: "user",
        content: `Write a directory description for: ${company.name}. Known details: ${details}`,
      },
    ],
    max_tokens: 200,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}

export async function generateIndustryDescription(
  industryName: string,
  sectorName: string,
  companyCount: number
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a business directory content writer. Write SEO-friendly industry descriptions for a global business directory. Each description should be 3-4 sentences explaining what the industry encompasses, its importance, and what types of companies operate in it. Write for a general audience including professionals, students, job seekers, and shoppers.`,
      },
      {
        role: "user",
        content: `Write a directory description for the "${industryName}" industry within the "${sectorName}" sector. This industry currently has ${companyCount} companies listed in our directory.`,
      },
    ],
    max_tokens: 250,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content?.trim() || "";
}

export async function getCompaniesWithoutDescriptions(limit: number = 50): Promise<Company[]> {
  return await db
    .select()
    .from(companies)
    .where(
      or(
        isNull(companies.description),
        sql`${companies.description} = ''`
      )
    )
    .limit(limit)
    .orderBy(companies.id);
}

export async function getDescriptionStats(): Promise<{
  totalCompanies: number;
  withDescription: number;
  withoutDescription: number;
  percentComplete: number;
}> {
  const [total] = await db.select({ count: sql<number>`count(*)` }).from(companies);
  const [withDesc] = await db
    .select({ count: sql<number>`count(*)` })
    .from(companies)
    .where(sql`description IS NOT NULL AND description != ''`);

  const totalCount = Number(total.count);
  const withDescCount = Number(withDesc.count);

  return {
    totalCompanies: totalCount,
    withDescription: withDescCount,
    withoutDescription: totalCount - withDescCount,
    percentComplete: totalCount > 0 ? Math.round((withDescCount / totalCount) * 100) : 0,
  };
}

export async function enrichBatch(batchSize: number = 10): Promise<{
  results: EnrichmentResult[];
  remaining: number;
}> {
  const companiesWithout = await getCompaniesWithoutDescriptions(batchSize);
  const results: EnrichmentResult[] = [];

  for (const company of companiesWithout) {
    try {
      const description = await generateCompanyDescription(company);
      if (description) {
        await db
          .update(companies)
          .set({ description })
          .where(eq(companies.id, company.id));
        results.push({
          companyId: company.id,
          companyName: company.name,
          description,
          success: true,
        });
      } else {
        results.push({
          companyId: company.id,
          companyName: company.name,
          description: "",
          success: false,
          error: "Empty response from AI",
        });
      }
    } catch (error) {
      results.push({
        companyId: company.id,
        companyName: company.name,
        description: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const stats = await getDescriptionStats();

  return {
    results,
    remaining: stats.withoutDescription,
  };
}

export async function enrichSingleCompany(companyId: number): Promise<EnrichmentResult> {
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId));

  if (!company) {
    return {
      companyId,
      companyName: "Unknown",
      description: "",
      success: false,
      error: "Company not found",
    };
  }

  try {
    const description = await generateCompanyDescription(company);
    if (description) {
      await db
        .update(companies)
        .set({ description })
        .where(eq(companies.id, companyId));
      return {
        companyId,
        companyName: company.name,
        description,
        success: true,
      };
    }
    return {
      companyId,
      companyName: company.name,
      description: "",
      success: false,
      error: "Empty response from AI",
    };
  } catch (error) {
    return {
      companyId,
      companyName: company.name,
      description: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
