import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import { storage } from "./storage";
import { SitemapGenerator } from "./sitemapGenerator";
import { googleSearchService } from "./services/googleSearchService";
import { EmailService } from "./emailService";
import { paystackService } from "./paystackService";
import { insertContactMessageSchema, insertCompanyListingSchema } from "@shared/schema";
import { registerCompanyClaimRoutes } from "./routes/companyClaimRoutes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static assets from attached_assets directory
  app.use('/generated_images', express.static(path.resolve(import.meta.dirname, '..', 'attached_assets', 'generated_images')));
  
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
  // Advertising inquiry endpoint
  app.post('/api/advertise', async (req, res) => {
    try {
      const { companyName, email, phone, website, adType, budget, duration, message } = req.body;

      // Send email to admin for advertising inquiries
      const emailService = new EmailService();
      const success = await emailService.sendEmail({
        to: 'admin@comcubes.com',

        subject: `New Advertising Inquiry - ${adType}`,
        text: `
New advertising inquiry received:

Company: ${companyName}
Email: ${email}
Phone: ${phone}
Website: ${website || 'Not provided'}
Advertisement Type: ${adType}
Budget Range: ${budget}
Campaign Duration: ${duration}

Message:
${message}

Please contact this potential advertiser within 24 hours.
        `,
        html: `
          <h2>New Advertising Inquiry</h2>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Website:</strong> ${website || 'Not provided'}</p>
          <p><strong>Advertisement Type:</strong> ${adType}</p>
          <p><strong>Budget Range:</strong> ${budget}</p>
          <p><strong>Campaign Duration:</strong> ${duration}</p>
          <h3>Message:</h3>
          <p>${message}</p>
          <hr>
          <p><em>Please contact this potential advertiser within 24 hours.</em></p>
        `,
      });

      res.json({
        success: true,
        message: 'Advertising inquiry submitted successfully'
      });

    } catch (error) {
      console.error('Error sending advertising inquiry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit advertising inquiry'
      });
    }
  });

  // Get industries by sector endpoint
  app.get('/api/sectors/:sectorName/industries', async (req, res) => {
    try {
      const { sectorName } = req.params;
      const decodedSectorName = decodeURIComponent(sectorName);
      const industries = await storage.getIndustriesBySector(decodedSectorName);
      res.json(industries);
    } catch (error) {
      console.error('Error fetching industries by sector:', error);
      res.status(500).json({ error: 'Failed to fetch industries' });
    }
  });

  // Company listing endpoint
  app.post('/api/company-listing', async (req, res) => {
    try {
      const listingData = req.body;
      
      // In a real application, you would:
      // 1. Validate the data
      // 2. Store the listing request in the database
      // 3. Send confirmation emails
      // 4. Process payment if needed
      
      console.log('Company listing request received:', {
        companyName: listingData.companyName,
        email: listingData.email,
        plan: listingData.listingPlan
      });
      
      // Simulate successful submission
      res.json({ 
        success: true, 
        message: 'Company listing request submitted successfully',
        id: Math.random().toString(36).substr(2, 9)
      });
    } catch (error) {
      console.error('Error processing company listing:', error);
      res.status(500).json({ error: 'Failed to process listing request' });
    }
  });

  app.post('/api/contact', async (req, res) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      
      // Save to database
      const savedMessage = await storage.createContactMessage(contactData);
      
      // Route emails based on contact type
      const emailService = new EmailService('contact-cgbd@comcubes.com');
      
      // Company listing inquiries go to admin@comcubes.com
      // General website inquiries go to contact-cgbd@comcubes.com
      const targetEmail = contactData.contactType === 'Company Listing' 
        ? 'admin@comcubes.com' 
        : 'contact-cgbd@comcubes.com';
      
      await Promise.all([
        emailService.sendContactNotification(contactData, targetEmail),
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

  // Check slot availability for an industry
  app.get('/api/industries/:industryName/slot-availability', async (req, res) => {
    try {
      const { industryName } = req.params;
      const availability = await storage.checkSlotAvailability(decodeURIComponent(industryName));
      res.json(availability);
    } catch (error) {
      console.error('Error checking slot availability:', error);
      res.status(500).json({ error: 'Failed to check slot availability' });
    }
  });

  // Company listing submission with slot validation
  app.post('/api/company-listing', async (req, res) => {
    try {
      const listingData = insertCompanyListingSchema.parse(req.body);
      
      // Check slot availability first
      const availability = await storage.checkSlotAvailability(listingData.industryName);
      
      if (!availability.available) {
        // Add to waitlist instead
        const waitlistEntry = await storage.addToWaitlist({
          companyName: listingData.companyName,
          websiteUrl: listingData.websiteUrl,
          contactEmail: listingData.contactEmail,
          sectorName: listingData.sectorName,
          industryName: listingData.industryName,
          description: listingData.description,
          logoUrl: listingData.logoUrl
        });
        
        return res.json({
          success: false,
          isWaitlisted: true,
          message: `All slots for ${listingData.industryName} are currently occupied (${availability.currentCount}/${availability.maxSlots}). Your company has been added to our waitlist and we'll contact you when a slot becomes available.`,
          waitlistId: waitlistEntry.id
        });
      }
      
      // Save to database if slot is available
      const savedListing = await storage.createCompanyListing(listingData);
      
      res.json({ 
        success: true, 
        message: 'Company listing submitted successfully. Proceed to payment to secure your slot.',
        listingId: savedListing.id,
        availableSlots: availability.maxSlots - availability.currentCount - 1 // Subtract 1 for this submission
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

  // Admin endpoint for waitlist management
  app.get('/api/admin/waitlist', async (req, res) => {
    try {
      const waitlist = await storage.getAllWaitlistEntries();
      res.json(waitlist);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      res.status(500).json({ error: 'Failed to fetch waitlist entries' });
    }
  });

  // Admin endpoint for industry statistics
  app.get('/api/admin/industry-stats', async (req, res) => {
    try {
      const stats = await storage.getIndustryWaitlistStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching industry stats:', error);
      res.status(500).json({ error: 'Failed to fetch industry statistics' });
    }
  });

  // Admin endpoint for overall system statistics
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
  });

  // Admin company claims endpoints
  app.get('/api/admin/company-claims', async (req, res) => {
    try {
      const claims = await storage.getAllCompanyClaims();
      res.json(claims);
    } catch (error) {
      console.error('Error fetching company claims:', error);
      res.status(500).json({ error: 'Failed to fetch company claims' });
    }
  });

  app.post('/api/admin/company-claims/:id/approve', async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      await storage.updateCompanyClaimStatus(claimId, 'approved');
      
      // TODO: Send payment instructions email
      
      res.json({ message: 'Company claim approved successfully' });
    } catch (error) {
      console.error('Error approving company claim:', error);
      res.status(500).json({ error: 'Failed to approve company claim' });
    }
  });

  app.post('/api/admin/company-claims/:id/reject', async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      await storage.updateCompanyClaimStatus(claimId, 'rejected');
      
      // TODO: Send rejection notification email
      
      res.json({ message: 'Company claim rejected successfully' });
    } catch (error) {
      console.error('Error rejecting company claim:', error);
      res.status(500).json({ error: 'Failed to reject company claim' });
    }
  });

  // Admin endpoint to contact waitlist entry
  app.post('/api/admin/waitlist/:id/contact', async (req, res) => {
    try {
      const { id } = req.params;
      const waitlistEntry = await storage.getWaitlistEntryById(parseInt(id));
      
      if (!waitlistEntry) {
        return res.status(404).json({ error: 'Waitlist entry not found' });
      }

      // Send notification email
      const emailService = new EmailService();
      await emailService.sendWaitlistNotification(waitlistEntry);

      res.json({ success: true, message: 'Notification email sent successfully' });
    } catch (error) {
      console.error('Error contacting waitlist entry:', error);
      res.status(500).json({ error: 'Failed to send notification email' });
    }
  });

  // Resume payment - get pending listings by email
  app.get('/api/resume-payment/:email', async (req, res) => {
    try {
      const { email } = req.params;
      const decodedEmail = decodeURIComponent(email);
      
      const listings = await storage.getCompanyListingByEmail(decodedEmail);
      const pendingListings = listings.filter(l => l.paymentStatus === 'pending');
      
      res.json(pendingListings);
    } catch (error) {
      console.error('Error getting pending listings:', error);
      res.status(500).json({ error: 'Failed to get pending listings' });
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
  
  // Import SitemapGenerator
  const { SitemapGenerator } = await import('./sitemapGenerator');

  // SEO: Sitemap endpoint
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const sitemapGenerator = new SitemapGenerator();
      const sitemapXml = await sitemapGenerator.generateCompleteSitemap(storage);
      
      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      });
      res.send(sitemapXml);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // SEO: Generate Open Graph image dynamically
  app.get("/api/og-image", async (req, res) => {
    try {
      // Simple text-based OG image response
      const svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e40af"/>
              <stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="630" fill="url(#bg)"/>
          <text x="600" y="250" font-family="IBM Plex Serif, serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">COMCUBES</text>
          <text x="600" y="320" font-family="IBM Plex Serif, serif" font-size="32" text-anchor="middle" fill="white" opacity="0.9">Global Business Directory</text>
          <text x="600" y="380" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="white" opacity="0.8">Everything and Anything Business</text>
          <rect x="50" y="450" width="1100" height="2" fill="white" opacity="0.3"/>
          <text x="600" y="500" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="white" opacity="0.7">Discover Companies • Explore Industries • Navigate Sectors</text>
        </svg>
      `;
      
      res.set({
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=604800' // Cache for 1 week
      });
      res.send(svg);
    } catch (error) {
      console.error('Error generating OG image:', error);
      res.status(500).send('Error generating image');
    }
  });

  // Register company claim routes
  registerCompanyClaimRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
