import { db } from "../db";
import { companies, industries, sectors, companyLocations } from "@shared/schema";
import { sql } from "drizzle-orm";
import * as fs from "fs";

interface AggregatedRow {
  sn: string;
  sector: string;
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

export async function purgeFreshImport(aggregatedFilePath: string) {
  console.log("🔥 STARTING COMPLETE DATABASE PURGE AND FRESH IMPORT");
  console.log("=" .repeat(80));

  // Step 1: Purge all existing business data
  console.log("\n📦 STEP 1: PURGING ALL EXISTING DATA");
  console.log("-".repeat(80));

  try {
    // Delete in correct order to respect foreign key constraints
    console.log("Deleting company_locations...");
    await db.delete(companyLocations);
    
    console.log("Deleting companies...");
    await db.delete(companies);
    
    console.log("Deleting industries...");
    await db.delete(industries);
    
    console.log("Deleting sectors...");
    await db.delete(sectors);
    
    console.log("✅ All business data purged successfully\n");
  } catch (error) {
    console.error("❌ Error during purge:", error);
    throw error;
  }

  // Step 2: Read and parse aggregated file
  console.log("📂 STEP 2: READING AGGREGATED DATA FILE");
  console.log("-".repeat(80));

  const fileContent = fs.readFileSync(aggregatedFilePath, "utf-8");
  const lines = fileContent.split("\n").filter(line => line.trim());
  
  console.log(`Total lines: ${lines.length}`);
  console.log(`Expected companies: ${lines.length - 1} (excluding header)\n`);

  // Step 3: Parse data
  console.log("🔍 STEP 3: PARSING DATA");
  console.log("-".repeat(80));

  const rows: AggregatedRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split("\t");
    if (parts.length >= 12) {
      rows.push({
        sn: parts[0],
        sector: parts[1],
        industry: parts[2],
        companyName: parts[3],
        hqCountry: parts[4],
        website: parts[5],
        employeeCount: parts[6],
        revenueEstimate: parts[7],
        founded: parts[8],
        companySize: parts[9],
        specializationTags: parts[10],
        status: parts[11]
      });
    }
  }

  console.log(`Parsed ${rows.length} companies\n`);

  // Step 4: Extract unique sectors and industries
  console.log("🏗️ STEP 4: EXTRACTING SECTORS AND INDUSTRIES");
  console.log("-".repeat(80));

  const sectorsMap = new Map<string, Set<string>>();
  
  for (const row of rows) {
    if (!sectorsMap.has(row.sector)) {
      sectorsMap.set(row.sector, new Set());
    }
    sectorsMap.get(row.sector)!.add(row.industry);
  }

  console.log(`Found ${sectorsMap.size} unique sectors`);
  console.log(`Total unique industries across all sectors\n`);

  // Step 5: Insert sectors
  console.log("📥 STEP 5: INSERTING SECTORS");
  console.log("-".repeat(80));

  const sectorNames = Array.from(sectorsMap.keys());
  for (const sectorName of sectorNames) {
    await db.insert(sectors).values({
      name: sectorName
    });
    console.log(`✓ Inserted sector: ${sectorName}`);
  }

  console.log(`✅ Inserted ${sectorNames.length} sectors\n`);

  // Step 6: Insert industries
  console.log("📥 STEP 6: INSERTING INDUSTRIES");
  console.log("-".repeat(80));

  let totalIndustries = 0;
  for (const [sectorName, industriesSet] of Array.from(sectorsMap.entries())) {
    const industryNames = Array.from(industriesSet);
    for (const industryName of industryNames) {
      await db.insert(industries).values({
        name: industryName,
        sectorName: sectorName
      });
      totalIndustries++;
    }
    console.log(`✓ Inserted ${industryNames.length} industries for ${sectorName}`);
  }

  console.log(`✅ Inserted ${totalIndustries} industries total\n`);

  // Step 7: Get all countries for mapping
  console.log("🌍 STEP 7: LOADING COUNTRY MAPPINGS");
  console.log("-".repeat(80));

  const allCountries = await db.execute(sql`SELECT id, name FROM countries`);
  const countryMap = new Map<string, number>();
  for (const country of allCountries.rows as any[]) {
    countryMap.set(country.name.toLowerCase(), country.id);
  }

  console.log(`Loaded ${countryMap.size} countries from database\n`);

  // Step 8: Insert companies with geocoding
  console.log("📥 STEP 8: INSERTING COMPANIES WITH GEOCODING");
  console.log("-".repeat(80));

  const stats = {
    total: 0,
    geocoded: 0,
    notGeocoded: 0,
    bySector: new Map<string, number>(),
    byCountry: new Map<string, number>()
  };

  for (const row of rows) {
    // Clean employee count
    const cleanEmployeeCount = row.employeeCount
      .replace(/"/g, "")
      .replace(/,/g, "")
      .replace(/\+/g, "")
      .trim();

    // Clean specialization tags
    const cleanTags = row.specializationTags
      .replace(/^"|"$/g, "")
      .trim();

    // Parse founded year
    const foundedYear = row.founded ? parseInt(row.founded, 10) : null;
    
    // Insert company
    const [company] = await db.insert(companies).values({
      name: row.companyName,
      industryName: row.industry,
      sectorName: row.sector,
      websiteUrl: row.website || null,
      employeeCount: cleanEmployeeCount || null,
      revenueEstimate: row.revenueEstimate || null,
      foundedYear: foundedYear,
      companySize: row.companySize || null,
      specializationTags: cleanTags || null,
      verificationStatus: row.status || "Unverified"
    }).returning({ id: companies.id });

    stats.total++;
    stats.bySector.set(row.sector, (stats.bySector.get(row.sector) || 0) + 1);

    // Geocode - use simple country name lookup with common aliases
    const countryAliases: Record<string, string> = {
      'USA': 'United States',
      'US': 'United States',
      'UK': 'United Kingdom',
      'UAE': 'United Arab Emirates'
    };
    
    const normalizedCountry = countryAliases[row.hqCountry] || row.hqCountry;
    const countryId = countryMap.get(normalizedCountry.toLowerCase());

    if (countryId) {
      await db.insert(companyLocations).values({
        companyId: company.id,
        countryId: countryId,
        isPrimary: true,
        confidence: "high",
        source: "verified_csv"
      });
      stats.geocoded++;
      stats.byCountry.set(normalizedCountry, (stats.byCountry.get(normalizedCountry) || 0) + 1);
    } else {
      stats.notGeocoded++;
      console.log(`⚠️  Could not geocode: ${row.companyName} (${row.hqCountry})`);
    }

    if (stats.total % 500 === 0) {
      console.log(`Progress: ${stats.total} companies inserted...`);
    }
  }

  console.log(`✅ Inserted ${stats.total} companies\n`);

  // Step 9: Generate report
  console.log("📊 STEP 9: FINAL IMPORT REPORT");
  console.log("=".repeat(80));

  console.log(`\n✅ IMPORT COMPLETE!`);
  console.log(`\nTotal Companies: ${stats.total}`);
  console.log(`Geocoded: ${stats.geocoded} (${((stats.geocoded/stats.total)*100).toFixed(1)}%)`);
  console.log(`Not Geocoded: ${stats.notGeocoded}`);

  console.log(`\n📈 BY SECTOR:`);
  const sortedSectors = Array.from(stats.bySector.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [sector, count] of sortedSectors) {
    console.log(`  ${sector}: ${count}`);
  }

  console.log(`\n🌍 TOP 15 COUNTRIES:`);
  const sortedCountries = Array.from(stats.byCountry.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  for (const [country, count] of sortedCountries) {
    console.log(`  ${country}: ${count}`);
  }

  console.log("\n" + "=".repeat(80));

  return stats;
}
