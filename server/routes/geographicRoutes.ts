import type { Express } from "express";
import { storage } from "../storage";

export function registerGeographicRoutes(app: Express): void {
  
  // Get all continents
  app.get("/api/geography/continents", async (req, res) => {
    try {
      const continents = await storage.getContinents();
      res.json(continents);
    } catch (error) {
      console.error('Error fetching continents:', error);
      res.status(500).json({ error: "Failed to load continents" });
    }
  });

  // Get continent by slug with stats
  app.get("/api/geography/continents/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const continent = await storage.getContinentBySlug(slug);
      
      if (!continent) {
        return res.status(404).json({ error: "Continent not found" });
      }

      const stats = await storage.getContinentStats(continent.id);
      const regions = await storage.getRegionsByContinent(continent.id);
      const countries = await storage.getCountriesByContinent(continent.id);

      res.json({
        continent,
        regions,
        countries,
        stats
      });
    } catch (error) {
      console.error('Error fetching continent:', error);
      res.status(500).json({ error: "Failed to load continent" });
    }
  });

  // Get regions by continent
  app.get("/api/geography/continents/:continentSlug/regions", async (req, res) => {
    try {
      const { continentSlug } = req.params;
      const continent = await storage.getContinentBySlug(continentSlug);
      
      if (!continent) {
        return res.status(404).json({ error: "Continent not found" });
      }

      const regions = await storage.getRegionsByContinent(continent.id);
      res.json(regions);
    } catch (error) {
      console.error('Error fetching regions:', error);
      res.status(500).json({ error: "Failed to load regions" });
    }
  });

  // Get region by slug with stats
  app.get("/api/geography/regions/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const region = await storage.getRegionBySlug(slug);
      
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }

      const stats = await storage.getRegionStats(region.id);
      const countries = await storage.getCountriesByRegion(region.id);

      res.json({
        ...region,
        stats,
        countries
      });
    } catch (error) {
      console.error('Error fetching region:', error);
      res.status(500).json({ error: "Failed to load region" });
    }
  });

  // Get countries by region
  app.get("/api/geography/regions/:regionSlug/countries", async (req, res) => {
    try {
      const { regionSlug } = req.params;
      const region = await storage.getRegionBySlug(regionSlug);
      
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }

      const countries = await storage.getCountriesByRegion(region.id);
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries:', error);
      res.status(500).json({ error: "Failed to load countries" });
    }
  });

  // Get countries by continent
  app.get("/api/geography/continents/:continentSlug/countries", async (req, res) => {
    try {
      const { continentSlug } = req.params;
      const continent = await storage.getContinentBySlug(continentSlug);
      
      if (!continent) {
        return res.status(404).json({ error: "Continent not found" });
      }

      const countries = await storage.getCountriesByContinent(continent.id);
      res.json(countries);
    } catch (error) {
      console.error('Error fetching countries by continent:', error);
      res.status(500).json({ error: "Failed to load countries" });
    }
  });

  // Get country by slug with stats
  app.get("/api/geography/countries/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const country = await storage.getCountryBySlug(slug);
      
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const stats = await storage.getCountryStats(country.id);

      res.json({
        ...country,
        stats
      });
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({ error: "Failed to load country" });
    }
  });

  // Get companies by country with filters
  app.get("/api/geography/countries/:slug/companies", async (req, res) => {
    try {
      const { slug } = req.params;
      const { sector, industry, confidence } = req.query;
      
      const country = await storage.getCountryBySlug(slug);
      
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const filters: any = {};
      
      if (sector && typeof sector === 'string') {
        filters.sectorName = sector;
      }
      
      if (industry && typeof industry === 'string') {
        filters.industryName = industry;
      }
      
      if (confidence && typeof confidence === 'string') {
        filters.confidence = confidence.split(',').filter(Boolean);
      }

      const companies = await storage.getCompaniesByCountryWithFilters(country.id, filters);
      
      res.json({
        country,
        companies,
        total: companies.length
      });
    } catch (error) {
      console.error('Error fetching companies by country:', error);
      res.status(500).json({ error: "Failed to load companies" });
    }
  });

  // Get overall geographic stats
  app.get("/api/geography/stats", async (req, res) => {
    try {
      const stats = await storage.getGeographicStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching geographic stats:', error);
      res.status(500).json({ error: "Failed to load geographic stats" });
    }
  });

  // Combined search endpoint: search companies by multiple criteria
  app.get("/api/geography/search", async (req, res) => {
    try {
      const { 
        countrySlug, 
        sectorName, 
        industryName, 
        confidence,
        limit = '100',
        offset = '0'
      } = req.query;

      // If no country specified, return error
      if (!countrySlug || typeof countrySlug !== 'string') {
        return res.status(400).json({ 
          error: "Country slug is required for geographic search" 
        });
      }

      const country = await storage.getCountryBySlug(countrySlug);
      
      if (!country) {
        return res.status(404).json({ error: "Country not found" });
      }

      const filters: any = {};
      
      if (sectorName && typeof sectorName === 'string') {
        filters.sectorName = sectorName;
      }
      
      if (industryName && typeof industryName === 'string') {
        filters.industryName = industryName;
      }
      
      if (confidence && typeof confidence === 'string') {
        filters.confidence = confidence.split(',').filter(Boolean);
      }

      const allCompanies = await storage.getCompaniesByCountryWithFilters(country.id, filters);
      
      // Pagination
      const limitNum = parseInt(limit as string) || 100;
      const offsetNum = parseInt(offset as string) || 0;
      const paginatedCompanies = allCompanies.slice(offsetNum, offsetNum + limitNum);

      res.json({
        country,
        companies: paginatedCompanies,
        total: allCompanies.length,
        limit: limitNum,
        offset: offsetNum,
        hasMore: (offsetNum + limitNum) < allCompanies.length
      });
    } catch (error) {
      console.error('Error in geographic search:', error);
      res.status(500).json({ error: "Failed to search companies" });
    }
  });
}
