import type { Express } from "express";
import { fixProductionGeocoding } from "../services/geocodingFixService";

/**
 * Admin endpoint to fix production geocoding data
 * 
 * This route allows triggering the geocoding fix via HTTP request.
 * Protected by ADMIN_SECRET environment variable.
 * 
 * Usage: GET /api/admin/fix-geocoding?secret=YOUR_SECRET
 */
export async function registerFixGeocodingRoute(app: Express) {
  app.get("/api/admin/fix-geocoding", async (req, res) => {
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

      console.log("🔧 Admin geocoding fix triggered via API...");

      // Call the geocoding fix service
      const result = await fixProductionGeocoding();

      if (result.success) {
        console.log("✅ Geocoding fix completed successfully");
        return res.json({
          success: true,
          message: result.message,
          stats: result.stats
        });
      } else {
        console.error("❌ Geocoding fix failed:", result.error);
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.message
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
