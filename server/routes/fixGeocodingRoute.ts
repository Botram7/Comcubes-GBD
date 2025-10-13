import type { Express } from "express";
import { db } from "../db";
import { companyLocations } from "../../shared/schema";
import { requireAdminAuth } from "../adminAuth";
import fs from "fs";
import path from "path";

interface GeocodingRow {
  id: string;
  name: string;
  country_id: string;
  country_name: string;
}

export async function registerFixGeocodingRoute(app: Express) {
  app.post("/api/admin/fix-geocoding", requireAdminAuth, async (req, res) => {
    try {
      console.log("🔧 Starting geocoding fix for production...");

      const csvPath = path.resolve(import.meta.dirname, "../data/correct_geocoding.csv");
      
      if (!fs.existsSync(csvPath)) {
        throw new Error("Correct geocoding CSV file not found");
      }

      console.log("📂 Reading correct geocoding data...");
      const csvContent = fs.readFileSync(csvPath, "utf-8");
      const lines = csvContent.split("\n").filter(line => line.trim());
      
      const geocodingData: GeocodingRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length >= 4) {
          geocodingData.push({
            id: parts[0],
            name: parts[1],
            country_id: parts[2],
            country_name: parts[3]
          });
        }
      }

      console.log(`✅ Loaded ${geocodingData.length} correct geocoding mappings`);

      console.log("🗑️ Deleting old incorrect company locations...");
      await db.delete(companyLocations);
      console.log("✅ Old locations deleted");

      console.log("📥 Inserting correct company locations...");
      const batchSize = 500;
      let inserted = 0;

      for (let i = 0; i < geocodingData.length; i += batchSize) {
        const batch = geocodingData.slice(i, i + batchSize);
        const valuesToInsert = batch.map(row => ({
          companyId: parseInt(row.id),
          countryId: parseInt(row.country_id),
          isPrimary: true,
          confidence: 'high' as const,
          source: 'verified_csv'
        }));

        await db.insert(companyLocations).values(valuesToInsert);
        inserted += valuesToInsert.length;
        console.log(`  Inserted ${inserted}/${geocodingData.length} locations...`);
      }

      console.log(`✅ Successfully fixed geocoding for ${inserted} companies`);

      res.json({
        success: true,
        message: `Geocoding fixed successfully for ${inserted} companies`,
        companiesUpdated: inserted
      });
    } catch (error) {
      console.error("❌ Error fixing geocoding:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
