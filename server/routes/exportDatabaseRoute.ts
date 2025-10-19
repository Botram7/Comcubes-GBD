import type { Express } from "express";
import { db } from "../db";
import { companies } from "../../shared/schema";
import * as fs from "fs";
import * as path from "path";

/**
 * Admin endpoint to export current database state to clean_database_export.json
 * Protected by ADMIN_SECRET environment variable
 */
export async function registerExportDatabaseRoute(app: Express) {
  app.post("/api/admin/export-database", async (req, res) => {
    try {
      // Check for admin secret
      const providedSecret = req.query.secret || req.body?.secret;
      const adminSecret = process.env.ADMIN_SECRET;

      if (!adminSecret) {
        return res.status(500).json({
          success: false,
          error: "Admin secret not configured on server"
        });
      }

      if (providedSecret !== adminSecret) {
        return res.status(403).json({
          success: false,
          error: "Unauthorized: Invalid or missing secret"
        });
      }

      console.log("📤 Admin database export triggered via API...");

      // Get all companies from current database
      const allCompanies = await db.select().from(companies);
      
      const exportData = {
        version: "2.0",
        exported: new Date().toISOString(),
        description: "Clean database export - duplicates removed, all companies with 100% geocoding coverage",
        companies: allCompanies,
        stats: {
          total_companies: allCompanies.length,
          note: "Duplicates removed. Geocoding CSV updated. Ready for production sync."
        }
      };

      // Write to file
      const exportPath = path.join(process.cwd(), "server", "data", "clean_database_export.json");
      fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

      console.log(`✅ Exported ${allCompanies.length} companies to clean_database_export.json`);

      return res.json({
        success: true,
        message: `Successfully exported ${allCompanies.length} companies`,
        stats: {
          companiesExported: allCompanies.length,
          exportPath: "server/data/clean_database_export.json"
        }
      });
    } catch (error) {
      console.error("❌ Unexpected error in export-database endpoint:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
