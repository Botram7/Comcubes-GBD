import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSearchService } from "./services/googleSearchService";

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

  // Search all entities (local database)
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

  // Global business search using Google Custom Search API
  app.get("/api/search/global", async (req, res) => {
    try {
      const query = req.query.q as string;
      const maxResults = parseInt(req.query.max as string) || 20;
      
      if (!query || query.length < 3) {
        return res.json({ 
          businesses: [], 
          source: 'google',
          attribution: 'Powered by Google Custom Search',
          total: 0
        });
      }
      
      console.log(`Global business search for: "${query}"`);
      
      // Search both local database and Google
      const [localResults, googleResults] = await Promise.all([
        storage.searchAll(query),
        googleSearchService.searchBusinesses(query, maxResults)
      ]);
      
      // Combine and format results
      const combinedResults = {
        local: {
          sectors: localResults.sectors,
          industries: localResults.industries,
          companies: localResults.companies
        },
        external: googleResults,
        attribution: 'Local data from COMCUBES database. External results powered by Google Custom Search.',
        totalLocal: localResults.companies.length,
        totalExternal: googleResults.length
      };
      
      console.log(`Global search results: ${localResults.companies.length} local companies, ${googleResults.length} external companies`);
      res.json(combinedResults);
    } catch (error) {
      console.error("Global search error:", error);
      res.status(500).json({ error: "Global search failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
