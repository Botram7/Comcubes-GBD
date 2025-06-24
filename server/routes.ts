import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all sectors
  app.get("/api/sectors", async (req, res) => {
    try {
      const sectors = await storage.getSectors();
      res.json(sectors);
    } catch (error) {
      res.status(500).json({ error: "Failed to load sectors" });
    }
  });

  // Get industries by sector
  app.get("/api/sectors/:sectorName/industries", async (req, res) => {
    try {
      const { sectorName } = req.params;
      const industries = await storage.getIndustriesBySector(decodeURIComponent(sectorName));
      res.json(industries);
    } catch (error) {
      console.error("Error loading industries:", error);
      res.status(500).json({ error: "Failed to load industries" });
    }
  });

  // Get companies by industry
  app.get("/api/industries/:industryName/companies", async (req, res) => {
    try {
      const { industryName } = req.params;
      const companies = await storage.getCompaniesByIndustry(decodeURIComponent(industryName));
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to load companies" });
    }
  });

  // Get all industries (for pagination)
  app.get("/api/industries", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const allIndustries = await storage.getAllIndustries();
      const paginatedIndustries = allIndustries.slice(offset, offset + limit);
      
      res.json({
        industries: paginatedIndustries,
        total: allIndustries.length,
        page,
        totalPages: Math.ceil(allIndustries.length / limit)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load industries" });
    }
  });

  // Get all companies (for pagination)
  app.get("/api/companies", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;
      
      const allCompanies = await storage.getAllCompanies();
      const paginatedCompanies = allCompanies.slice(offset, offset + limit);
      
      res.json({
        companies: paginatedCompanies,
        total: allCompanies.length,
        page,
        totalPages: Math.ceil(allCompanies.length / limit)
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load companies" });
    }
  });

  // Search all entities
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json({ sectors: [], industries: [], companies: [] });
      }
      
      console.log(`Searching for: "${query}"`);
      const results = await storage.searchAll(query);
      console.log(`Search results: ${results.sectors.length} sectors, ${results.industries.length} industries, ${results.companies.length} companies`);
      res.json(results);
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
