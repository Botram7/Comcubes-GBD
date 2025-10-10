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

export async function purgeFreshImportOptimized(aggregatedFilePath: string) {
  console.log("🔥 OPTIMIZED DATABASE PURGE AND FRESH IMPORT");
  console.log("=" .repeat(80));

  // Step 1: Purge
  console.log("\n📦 PURGING ALL EXISTING DATA...");
  await db.delete(companyLocations);
  await db.delete(companies);
  await db.delete(industries);
  await db.delete(sectors);
  console.log("✅ Data purged\n");

  // Step 2: Parse file
  console.log("📂 PARSING DATA FILE...");
  const fileContent = fs.readFileSync(aggregatedFilePath, "utf-8");
  const lines = fileContent.split("\n").filter(line => line.trim());
  
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

  // Step 3: Extract sectors and industries
  console.log("🏗️ EXTRACTING SECTORS & INDUSTRIES...");
  const sectorsMap = new Map<string, Set<string>>();
  for (const row of rows) {
    if (!sectorsMap.has(row.sector)) {
      sectorsMap.set(row.sector, new Set());
    }
    sectorsMap.get(row.sector)!.add(row.industry);
  }

  // Step 4: Batch insert sectors
  console.log("📥 INSERTING SECTORS...");
  const sectorValues = Array.from(sectorsMap.keys()).map(name => ({ name }));
  await db.insert(sectors).values(sectorValues);
  console.log(`✅ Inserted ${sectorValues.length} sectors\n`);

  // Step 5: Batch insert industries
  console.log("📥 INSERTING INDUSTRIES...");
  const industryValues = [];
  for (const [sectorName, industriesSet] of Array.from(sectorsMap.entries())) {
    for (const industryName of Array.from(industriesSet)) {
      industryValues.push({
        name: industryName,
        sectorName: sectorName
      });
    }
  }
  await db.insert(industries).values(industryValues);
  console.log(`✅ Inserted ${industryValues.length} industries\n`);

  // Step 6: Load countries
  console.log("🌍 LOADING COUNTRIES...");
  const allCountries = await db.execute(sql`SELECT id, name FROM countries`);
  const countryMap = new Map<string, number>();
  for (const country of allCountries.rows as any[]) {
    countryMap.set(country.name.toLowerCase(), country.id);
  }
  console.log(`Loaded ${countryMap.size} countries\n`);

  // Step 7: Batch insert companies in chunks
  console.log("📥 INSERTING COMPANIES (BATCHED)...");
  const BATCH_SIZE = 100;
  const countryAliases: Record<string, string> = {
    'USA': 'United States',
    'US': 'United States',
    'UK': 'United Kingdom',
    'UAE': 'United Arab Emirates'
  };

  const stats = {
    total: 0,
    geocoded: 0,
    notGeocoded: 0,
    bySector: new Map<string, number>(),
    byCountry: new Map<string, number>()
  };

  const companyIdMap = new Map<number, { row: AggregatedRow, index: number }>();
  
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, Math.min(i + BATCH_SIZE, rows.length));
    const companyValues = batch.map(row => {
      const cleanEmployeeCount = row.employeeCount.replace(/"/g, "").replace(/,/g, "").replace(/\+/g, "").trim();
      const cleanTags = row.specializationTags.replace(/^"|"$/g, "").trim();
      const foundedYearParsed = row.founded ? parseInt(row.founded, 10) : null;
      const foundedYear = foundedYearParsed && !isNaN(foundedYearParsed) ? foundedYearParsed : null;
      
      return {
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
      };
    });

    const insertedCompanies = await db.insert(companies).values(companyValues).returning({ id: companies.id });
    
    // Map company IDs to rows for geocoding
    for (let j = 0; j < insertedCompanies.length; j++) {
      const originalIndex = i + j;
      companyIdMap.set(insertedCompanies[j].id, { row: batch[j], index: originalIndex });
    }

    stats.total += batch.length;
    
    // Update sector stats
    for (const row of batch) {
      stats.bySector.set(row.sector, (stats.bySector.get(row.sector) || 0) + 1);
    }

    console.log(`  Progress: ${stats.total}/${rows.length} companies...`);
  }
  
  console.log(`✅ Inserted ${stats.total} companies\n`);

  // Step 8: Batch insert company locations
  console.log("📍 GEOCODING COMPANIES (BATCHED)...");
  const locationValues = [];
  
  for (const [companyId, { row }] of companyIdMap.entries()) {
    const normalizedCountry = countryAliases[row.hqCountry] || row.hqCountry;
    const countryId = countryMap.get(normalizedCountry.toLowerCase());

    if (countryId) {
      locationValues.push({
        companyId: companyId,
        countryId: countryId,
        isPrimary: true,
        confidence: "high",
        source: "verified_csv"
      });
      stats.geocoded++;
      stats.byCountry.set(normalizedCountry, (stats.byCountry.get(normalizedCountry) || 0) + 1);
    } else {
      stats.notGeocoded++;
      if (stats.notGeocoded <= 10) {
        console.log(`  ⚠️  Could not geocode: ${row.companyName} (${row.hqCountry})`);
      }
    }
  }

  // Insert locations in batches
  for (let i = 0; i < locationValues.length; i += BATCH_SIZE) {
    const batch = locationValues.slice(i, Math.min(i + BATCH_SIZE, locationValues.length));
    await db.insert(companyLocations).values(batch);
    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, locationValues.length)}/${locationValues.length} locations...`);
  }

  console.log(`✅ Geocoded ${stats.geocoded} companies\n`);

  // Final report
  console.log("📊 FINAL IMPORT REPORT");
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
