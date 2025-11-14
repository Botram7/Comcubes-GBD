import type { Express } from "express";
import { storage } from "../storage";
import { db } from "../db";
import { countries as countries_db, companyLocations, regions as regions_db, companies as companies_db, continents as continents_db } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

export function registerGeographicRoutes(app: Express): void {

  // Get all regions with continent and company/country counts
  app.get("/api/geography/regions", async (req, res) => {
    try {
      // Get all regions with their continent names
      const allRegions = await db
        .select({
          id: regions_db.id,
          name: regions_db.name,
          continentName: continents_db.name,
        })
        .from(regions_db)
        .innerJoin(continents_db, eq(regions_db.continentId, continents_db.id))
        .orderBy(continents_db.name, regions_db.name);

      // Get country counts per region
      const regionCountryCounts = await db
        .select({
          regionId: countries_db.regionId,
          count: sql<number>`count(*)`
        })
        .from(countries_db)
        .groupBy(countries_db.regionId);

      const countryCountMap = new Map(regionCountryCounts.map(r => [r.regionId, Number(r.count)]));

      // Get company counts per region
      const regionCompanyCounts = await db
        .select({
          regionId: countries_db.regionId,
          count: sql<number>`count(DISTINCT company_id)`
        })
        .from(companyLocations)
        .innerJoin(countries_db, eq(companyLocations.countryId, countries_db.id))
        .groupBy(countries_db.regionId);

      const companyCountMap = new Map(regionCompanyCounts.map(r => [r.regionId, Number(r.count)]));

      // Combine the data
      const regions = allRegions.map(region => ({
        id: region.id,
        name: region.name,
        continentName: region.continentName,
        countryCount: countryCountMap.get(region.id) || 0,
        companyCount: companyCountMap.get(region.id) || 0
      }));

      res.json({ regions });
    } catch (error) {
      console.error('Error fetching all regions:', error);
      res.status(500).json({ error: "Failed to load regions" });
    }
  });

  // Get all countries with region and company counts
  app.get("/api/geography/countries", async (req, res) => {
    try {
      // Get all countries with their region and continent names
      const allCountries = await db
        .select({
          id: countries_db.id,
          name: countries_db.name,
          regionName: regions_db.name,
          continentName: continents_db.name,
        })
        .from(countries_db)
        .innerJoin(regions_db, eq(countries_db.regionId, regions_db.id))
        .innerJoin(continents_db, eq(regions_db.continentId, continents_db.id))
        .orderBy(regions_db.name, countries_db.name);

      // Get company counts per country
      const countryCompanyCounts = await db
        .select({
          countryId: companyLocations.countryId,
          count: sql<number>`count(DISTINCT company_id)`
        })
        .from(companyLocations)
        .groupBy(companyLocations.countryId);

      const companyCountMap = new Map(countryCompanyCounts.map(c => [c.countryId, Number(c.count)]));

      // Combine the data
      const countries = allCountries.map(country => ({
        id: country.id,
        name: country.name,
        regionName: country.regionName,
        continentName: country.continentName,
        companyCount: companyCountMap.get(country.id) || 0
      }));

      res.json({ countries });
    } catch (error) {
      console.error('Error fetching all countries:', error);
      res.status(500).json({ error: "Failed to load countries" });
    }
  });

  // Get all companies with their location details (with filtering and pagination)
  app.get("/api/geography/companies", async (req, res) => {
    try {
      const { country, region, letter, page, limit } = req.query;
      
      // Start with base query
      let query = db
        .select({
          id: companies_db.id,
          name: companies_db.name,
          industryName: companies_db.industryName,
          sectorName: companies_db.sectorName,
          websiteUrl: companies_db.websiteUrl,
          countryName: countries_db.name,
          regionName: regions_db.name,
        })
        .from(companyLocations)
        .innerJoin(companies_db, eq(companyLocations.companyId, companies_db.id))
        .innerJoin(countries_db, eq(companyLocations.countryId, countries_db.id))
        .innerJoin(regions_db, eq(countries_db.regionId, regions_db.id));

      // Apply filters
      const allCompanies = await query.orderBy(countries_db.name, companies_db.name);
      
      // Filter by country name (case-insensitive)
      let filteredCompanies = allCompanies;
      
      if (country && typeof country === 'string') {
        filteredCompanies = filteredCompanies.filter(c => 
          c.countryName.toLowerCase() === country.toLowerCase()
        );
      }
      
      if (region && typeof region === 'string') {
        filteredCompanies = filteredCompanies.filter(c => 
          c.regionName.toLowerCase() === region.toLowerCase()
        );
      }
      
      if (letter && typeof letter === 'string') {
        const letterUpper = letter.toUpperCase();
        filteredCompanies = filteredCompanies.filter(c => 
          c.countryName.toUpperCase().startsWith(letterUpper)
        );
      }

      // Calculate pagination
      const pageNum = page ? parseInt(page as string, 10) : undefined;
      const limitNum = limit ? parseInt(limit as string, 10) : 20;
      
      if (pageNum) {
        const startIndex = (pageNum - 1) * limitNum;
        const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + limitNum);
        
        res.json({
          companies: paginatedCompanies,
          total: filteredCompanies.length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredCompanies.length / limitNum)
        });
      } else {
        // No pagination, return all
        res.json({ 
          companies: filteredCompanies,
          total: filteredCompanies.length 
        });
      }
    } catch (error) {
      console.error('Error fetching all companies with locations:', error);
      res.status(500).json({ error: "Failed to load companies" });
    }
  });
  
  // Get top countries by company count
  app.get("/api/geography/top-countries", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const topCountries = await storage.getTopCountriesByCompanyCount(limit);
      res.json(topCountries);
    } catch (error) {
      console.error('Error fetching top countries:', error);
      res.status(500).json({ error: "Failed to load top countries" });
    }
  });
  
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

      const [stats, regionsData, countries] = await Promise.all([
        storage.getContinentStats(continent.id),
        storage.getRegionsByContinent(continent.id),
        storage.getCountriesByContinent(continent.id)
      ]);

      // Get company counts for all regions in a single query
      const regionCompanyCounts = await db
        .select({
          regionId: countries_db.regionId,
          count: sql<number>`count(*)`
        })
        .from(companyLocations)
        .innerJoin(countries_db, eq(companyLocations.countryId, countries_db.id))
        .where(eq(countries_db.continentId, continent.id))
        .groupBy(countries_db.regionId);

      const regionCountMap = new Map(regionCompanyCounts.map(r => [r.regionId, Number(r.count)]));

      // Get country counts for regions
      const regionCountryCounts = await db
        .select({
          regionId: countries_db.regionId,
          count: sql<number>`count(*)`
        })
        .from(countries_db)
        .where(eq(countries_db.continentId, continent.id))
        .groupBy(countries_db.regionId);

      const regionCountryCountMap = new Map(regionCountryCounts.map(r => [r.regionId, Number(r.count)]));

      // Enhance regions with counts from the maps
      const regions = regionsData.map(region => ({
        ...region,
        countryCount: regionCountryCountMap.get(region.id) || 0,
        companyCount: regionCountMap.get(region.id) || 0
      }));

      // Get company counts for all countries in a single query
      const countryCompanyCounts = await db
        .select({
          countryId: companyLocations.countryId,
          count: sql<number>`count(*)`
        })
        .from(companyLocations)
        .innerJoin(countries_db, eq(companyLocations.countryId, countries_db.id))
        .where(eq(countries_db.continentId, continent.id))
        .groupBy(companyLocations.countryId);

      const countryCountMap = new Map(countryCompanyCounts.map(c => [c.countryId, Number(c.count)]));

      // Enhance countries with company counts from the map
      const countriesWithCounts = countries.map(country => ({
        ...country,
        companyCount: countryCountMap.get(country.id) || 0
      }));

      res.json({
        continent,
        regions,
        countries: countriesWithCounts,
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

      const [stats, countriesData] = await Promise.all([
        storage.getRegionStats(region.id),
        storage.getCountriesByRegion(region.id)
      ]);

      // Get company counts for all countries in a single query
      const countryCompanyCounts = await db
        .select({
          countryId: companyLocations.countryId,
          count: sql<number>`count(*)`
        })
        .from(companyLocations)
        .innerJoin(countries_db, eq(companyLocations.countryId, countries_db.id))
        .where(eq(countries_db.regionId, region.id))
        .groupBy(companyLocations.countryId);

      const countryCountMap = new Map(countryCompanyCounts.map(c => [c.countryId, Number(c.count)]));

      // Enhance countries with company counts from the map
      const countries = countriesData.map(country => ({
        ...country,
        companyCount: countryCountMap.get(country.id) || 0
      }));

      res.json({
        region,
        stats,
        countries
      });
    } catch (error) {
      console.error('Error fetching region:', error);
      res.status(500).json({ error: "Failed to load region" });
    }
  });

  // Get companies by region with filters
  app.get("/api/geography/regions/:slug/companies", async (req, res) => {
    try {
      const { slug } = req.params;
      const { country, sector, industry, confidence } = req.query;
      
      const region = await storage.getRegionBySlug(slug);
      
      if (!region) {
        return res.status(404).json({ error: "Region not found" });
      }

      const filters: any = {};
      
      if (country && typeof country === 'string') {
        const countryData = await storage.getCountryBySlug(country);
        if (countryData) {
          filters.countryId = countryData.id;
        }
      }
      
      if (sector && typeof sector === 'string') {
        filters.sectorName = sector;
      }
      
      if (industry && typeof industry === 'string') {
        filters.industryName = industry;
      }
      
      if (confidence && typeof confidence === 'string') {
        filters.confidence = confidence.split(',').filter(Boolean);
      }

      const companies = await storage.getCompaniesByRegionWithFilters(region.id, filters);
      
      res.json({
        region,
        companies,
        total: companies.length
      });
    } catch (error) {
      console.error('Error fetching companies by region:', error);
      res.status(500).json({ error: "Failed to load companies" });
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
      const { sector, industry, confidence, page } = req.query;
      
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

      const allCompanies = await storage.getCompaniesByCountryWithFilters(country.id, filters);
      
      // If no page is specified, return all companies
      if (!page) {
        return res.json({
          country,
          companies: allCompanies,
          total: allCompanies.length
        });
      }

      // With pagination
      const pageNum = parseInt(page as string, 10) || 1;
      const perPage = 20;
      const startIndex = (pageNum - 1) * perPage;
      const companies = allCompanies.slice(startIndex, startIndex + perPage);
      
      res.json({
        country,
        companies,
        total: allCompanies.length,
        page: pageNum,
        perPage,
        totalPages: Math.ceil(allCompanies.length / perPage)
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
