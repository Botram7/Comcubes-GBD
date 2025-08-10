import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSearchService } from "./services/googleSearchService";
import { EmailService } from "./emailService";
import { paystackService } from "./paystackService";
import { insertContactMessageSchema, insertCompanyListingSchema } from "@shared/schema";

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

  // Get specific company by ID
  app.get('/api/companies/:id', async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }

      const company = await storage.getCompanyById(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      res.json(company);
    } catch (error) {
      console.error('Error fetching company:', error);
      res.status(500).json({ error: 'Failed to fetch company' });
    }
  });

  // Get related companies (same industry)
  app.get('/api/companies/:id/related', async (req, res) => {
    try {
      const companyId = parseInt(req.params.id);
      if (isNaN(companyId)) {
        return res.status(400).json({ error: 'Invalid company ID' });
      }

      const company = await storage.getCompanyById(companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const relatedCompanies = await storage.getCompaniesByIndustry(company.industryName);
      // Filter out the current company and limit to 12 related companies
      const filtered = relatedCompanies.filter(c => c.id !== companyId).slice(0, 12);
      
      res.json(filtered);
    } catch (error) {
      console.error('Error fetching related companies:', error);
      res.status(500).json({ error: 'Failed to fetch related companies' });
    }
  });

  // Contact form submission
  app.post('/api/contact', async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      
      // Save to database
      const savedMessage = await storage.createContactMessage(contactData);
      
      // Send emails (using your admin email - you can set this as environment variable)
      const emailService = new EmailService();
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@comcubes.com'; // You'll need to set this
      
      await Promise.all([
        emailService.sendContactNotification(contactData, adminEmail),
        emailService.sendContactConfirmation(contactData)
      ]);
      
      res.json({ 
        success: true, 
        message: 'Contact message sent successfully',
        id: savedMessage.id 
      });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to send contact message' 
      });
    }
  });

  // Company listing submission (without payment)
  app.post('/api/company-listing', async (req, res) => {
    try {
      const listingData = insertCompanyListingSchema.parse(req.body);
      
      // Save to database
      const savedListing = await storage.createCompanyListing(listingData);
      
      res.json({ 
        success: true, 
        message: 'Company listing submitted successfully',
        listingId: savedListing.id 
      });
    } catch (error) {
      console.error('Company listing error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to submit company listing' 
      });
    }
  });

  // Initialize payment for company listing
  app.post('/api/payment/initialize', async (req, res) => {
    try {
      const { listingId, amount } = req.body;
      
      if (!listingId || !amount) {
        return res.status(400).json({ error: 'Listing ID and amount are required' });
      }

      // Generate payment reference
      const reference = paystackService.generateReference();
      const amountInKobo = paystackService.convertToKobo(amount);
      
      // Get listing details for email
      const listings = await storage.getCompanyListings();
      const listing = listings.find(l => l.id === listingId);
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const paymentData = await paystackService.initializePayment({
        email: listing.contactEmail,
        amount: amountInKobo,
        reference,
        metadata: {
          listingId,
          companyName: listing.companyName,
          purpose: 'COMCUBES Company Listing Fee'
        }
      });

      res.json({
        success: true,
        authorization_url: paymentData.authorization_url,
        access_code: paymentData.access_code,
        reference: paymentData.reference
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  });

  // Admin routes
  app.get('/api/admin/company-listings', async (req, res) => {
    try {
      const listings = await storage.getCompanyListings();
      res.json(listings);
    } catch (error) {
      console.error('Error fetching company listings:', error);
      res.status(500).json({ error: 'Failed to fetch company listings' });
    }
  });

  app.post('/api/admin/company-listings/:id/approve', async (req, res) => {
    try {
      const { id } = req.params;
      const listingId = parseInt(id);
      
      // Get the listing first
      const listings = await storage.getCompanyListings();
      const listing = listings.find(l => l.id === listingId);
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      if (listing.paymentStatus !== 'completed') {
        return res.status(400).json({ error: 'Cannot approve listing with incomplete payment' });
      }

      // Add company to the main companies table
      await storage.createCompany({
        name: listing.companyName,
        websiteUrl: listing.websiteUrl,
        industryName: listing.industryName,
        sectorName: listing.sectorName,
      });

      // Send approval email
      const emailService = new EmailService();
      await emailService.sendApprovalEmail(listing);

      res.json({ success: true, message: 'Company approved and added to directory' });
    } catch (error) {
      console.error('Error approving company listing:', error);
      res.status(500).json({ error: 'Failed to approve company listing' });
    }
  });

  app.post('/api/admin/company-listings/:id/reject', async (req, res) => {
    try {
      const { id } = req.params;
      const listingId = parseInt(id);
      
      // Get the listing first
      const listings = await storage.getCompanyListings();
      const listing = listings.find(l => l.id === listingId);
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Send rejection email
      const emailService = new EmailService();
      await emailService.sendRejectionEmail(listing);

      res.json({ success: true, message: 'Company listing rejected' });
    } catch (error) {
      console.error('Error rejecting company listing:', error);
      res.status(500).json({ error: 'Failed to reject company listing' });
    }
  });

  // Verify payment
  app.post('/api/payment/verify', async (req, res) => {
    try {
      const { reference } = req.body;
      
      if (!reference) {
        return res.status(400).json({ error: 'Payment reference is required' });
      }

      const verification = await paystackService.verifyPayment(reference);
      
      if (verification.status === 'success') {
        // Update listing with payment information
        const { listingId } = verification.metadata;
        const amount = paystackService.convertToNaira(verification.amount);
        
        await storage.updateCompanyListingPayment(listingId, reference, amount);
        
        // Send confirmation email and admin notification
        const listings = await storage.getCompanyListings();
        const listing = listings.find(l => l.id === listingId);
        
        if (listing) {
          // Send notifications
          const emailService = new EmailService();
          await Promise.all([
            emailService.sendListingConfirmation({
              companyName: listing.companyName,
              contactEmail: listing.contactEmail,
              paymentReference: reference
            }),
            emailService.sendAdminNotification(listing)
          ]);
        }
        
        if (listing) {
          const emailService = new EmailService();
          await emailService.sendListingConfirmation({
            companyName: listing.companyName,
            contactEmail: listing.contactEmail,
            paymentReference: reference
          });
        }
        
        res.json({ 
          success: true, 
          message: 'Payment verified successfully',
          amount: amount 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Payment verification failed' 
        });
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ error: 'Failed to verify payment' });
    }
  });

  // Add logo routes
  const logoRoutes = (await import('./routes/logo')).default;
  app.use('/api/logo', logoRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
