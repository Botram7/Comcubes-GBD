import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSearchService } from "./services/googleSearchService";
import { EmailService } from "./emailService";
import { registerSEORoutes } from "./seoRoutes";
import { paystackService } from "./paystackService";
import { insertContactMessageSchema, insertCompanyListingSchema, registerUserSchema, loginUserSchema } from "@shared/schema";
import { AuthService } from "./authService";
import { UserService } from "./userService";
import { authenticateToken, optionalAuth, sessionMiddleware } from "./middleware/auth";
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Add session middleware for anonymous user tracking
  app.use(sessionMiddleware);
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerUserSchema.parse(req.body);
      const result = await AuthService.register(validatedData);
      
      if (result.success) {
        res.status(201).json({
          message: result.message,
          user: result.user,
          token: result.token,
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      const result = await AuthService.login(email, password);
      
      if (result.success) {
        res.json({
          message: result.message,
          user: result.user,
          token: result.token,
        });
      } else {
        res.status(401).json({ message: result.message });
      }
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await AuthService.getUserById(req.user!.userId);
      if (user) {
        const stats = await UserService.getUserStats(user.id);
        res.json({ ...user, ...stats });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // User favorites routes
  app.post("/api/user/favorites", authenticateToken, async (req, res) => {
    try {
      const { entityType, entityId, entityName } = req.body;
      const favorite = await UserService.addFavorite(
        req.user!.userId,
        entityType,
        entityId,
        entityName
      );
      
      // Log activity
      await UserService.logActivity({
        userId: req.user!.userId,
        sessionId: req.session.sessionId,
        actionType: 'favorite_add',
        entityType,
        entityId,
        entityName,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      });
      
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete("/api/user/favorites/:entityType/:entityId", authenticateToken, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const removed = await UserService.removeFavorite(
        req.user!.userId,
        entityType,
        parseInt(entityId)
      );
      
      if (removed) {
        res.json({ message: "Favorite removed" });
      } else {
        res.status(404).json({ message: "Favorite not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  app.get("/api/user/favorites", authenticateToken, async (req, res) => {
    try {
      const entityType = req.query.type as string;
      const favorites = await UserService.getUserFavorites(req.user!.userId, entityType);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ message: "Failed to get favorites" });
    }
  });

  // Saved searches routes
  app.post("/api/user/saved-searches", authenticateToken, async (req, res) => {
    try {
      const { searchQuery, searchType, resultCount } = req.body;
      const savedSearch = await UserService.saveSearch(
        req.user!.userId,
        searchQuery,
        searchType,
        resultCount
      );
      res.status(201).json(savedSearch);
    } catch (error) {
      res.status(500).json({ message: "Failed to save search" });
    }
  });

  app.get("/api/user/saved-searches", authenticateToken, async (req, res) => {
    try {
      const savedSearches = await UserService.getUserSavedSearches(req.user!.userId);
      res.json(savedSearches);
    } catch (error) {
      res.status(500).json({ message: "Failed to get saved searches" });
    }
  });

  app.delete("/api/user/saved-searches/:searchId", authenticateToken, async (req, res) => {
    try {
      const { searchId } = req.params;
      const removed = await UserService.removeSavedSearch(
        req.user!.userId,
        parseInt(searchId)
      );
      
      if (removed) {
        res.json({ message: "Saved search removed" });
      } else {
        res.status(404).json({ message: "Saved search not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove saved search" });
    }
  });

  // Recently viewed routes (works for both authenticated and anonymous users)
  app.post("/api/user/recently-viewed", optionalAuth, async (req, res) => {
    try {
      const { entityType, entityId, entityName } = req.body;
      
      // Create session ID if not exists
      if (!req.session.sessionId) {
        req.session.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const recentItem = await UserService.addRecentlyViewed(
        req.user?.userId || null,
        req.session.sessionId,
        entityType,
        entityId,
        entityName
      );
      
      // Log activity if user is authenticated
      if (req.user?.userId) {
        await UserService.logActivity({
          userId: req.user.userId,
          actionType: 'page_view',
          entityType,
          entityId,
          entityName,
          metadata: JSON.stringify({
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          }),
        });
      }
      
      res.status(201).json(recentItem);
    } catch (error) {
      console.error('Recently viewed tracking error:', error);
      res.status(500).json({ message: "Failed to track recently viewed" });
    }
  });

  app.get("/api/user/recently-viewed", optionalAuth, async (req, res) => {
    try {
      // Create session ID if not exists
      if (!req.session.sessionId) {
        req.session.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      const recentItems = await UserService.getRecentlyViewed(
        req.user?.userId || null,
        req.session.sessionId
      );
      res.json(recentItems);
    } catch (error) {
      console.error('Recently viewed error:', error);
      res.status(500).json({ message: "Failed to get recently viewed" });
    }
  });

  // Check if item is favorited
  app.get("/api/user/is-favorite/:entityType/:entityId", authenticateToken, async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const isFavorited = await UserService.isFavorited(
        req.user!.userId,
        entityType,
        parseInt(entityId)
      );
      res.json(isFavorited);
    } catch (error) {
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Activity logging endpoint
  app.post("/api/user/activity", authenticateToken, async (req, res) => {
    try {
      const { actionType, entityType, entityId, entityName, metadata } = req.body;
      
      const activity = await UserService.logActivity({
        userId: req.user!.userId,
        actionType,
        entityType: entityType || null,
        entityId: entityId || null,
        entityName: entityName || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      });
      
      res.status(201).json(activity);
    } catch (error) {
      console.error('Activity logging error:', error);
      res.status(500).json({ message: "Failed to log activity" });
    }
  });
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

  // Register SEO routes (sitemap, robots.txt, etc.)
  registerSEORoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
