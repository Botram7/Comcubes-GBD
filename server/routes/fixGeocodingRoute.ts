import type { Express } from "express";
import { fixProductionGeocoding } from "../services/geocodingFixService";
import { diagnoseGeocodingData } from "../services/geocodingDiagnosticService";

/**
 * Admin endpoints for geocoding management
 * 
 * These routes allow triggering the geocoding fix and diagnostics via HTTP request.
 * Protected by ADMIN_SECRET environment variable.
 * 
 * Usage: 
 * - GET /api/admin/fix-geocoding?secret=YOUR_SECRET
 * - GET /api/admin/geocoding-diagnostics?secret=YOUR_SECRET
 */
export async function registerFixGeocodingRoute(app: Express) {
  // Diagnostic endpoint - check what's unmatched
  app.get("/api/admin/geocoding-diagnostics", async (req, res) => {
    try {
      // Check for admin secret
      const providedSecret = req.query.secret;
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

      console.log("🔍 Admin geocoding diagnostic triggered via API...");

      // Run diagnostic
      const result = await diagnoseGeocodingData();

      if (result.success) {
        console.log("✅ Diagnostic completed successfully");
        return res.json(result);
      } else {
        console.error("❌ Diagnostic failed:", result.error);
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error("❌ Unexpected error in geocoding-diagnostics endpoint:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Fix endpoint - apply the geocoding corrections
  app.post("/api/admin/fix-geocoding", async (req, res) => {
    try {
      // Check for admin secret (supports both query param and body)
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

      console.log("🔧 Admin geocoding fix triggered via API...");

      // Call the geocoding fix service
      const result = await fixProductionGeocoding();

      if (result.success && result.stats) {
        console.log("✅ Geocoding fix completed successfully");
        
        // Transform stats to match frontend expectations
        const totalCompanies = result.stats.rowsLoaded || 0;
        const matchedCompanies = result.stats.companiesMatched || 0;
        const unmatchedCompanies = result.stats.unmatchedCompanies || 0;
        const matchRate = totalCompanies > 0 
          ? `${((matchedCompanies / totalCompanies) * 100).toFixed(1)}%`
          : '0%';
        
        return res.json({
          success: true,
          message: result.message,
          results: {
            totalCompanies,
            matchedCompanies,
            unmatchedCompanies,
            matchRate
          }
        });
      } else {
        console.error("❌ Geocoding fix failed:", result.error);
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.message || 'Geocoding fix failed'
        });
      }
    } catch (error) {
      console.error("❌ Unexpected error in fix-geocoding endpoint:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
}
