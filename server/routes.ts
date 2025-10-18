import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { SitemapGenerator } from "./sitemapGenerator";
import { googleSearchService } from "./services/googleSearchService";
import { EmailService } from "./emailService";
import { paystackService } from "./paystackService";
import { insertContactMessageSchema, insertCompanyListingSchema } from "@shared/schema";
import { registerCompanyClaimRoutes } from "./routes/companyClaimRoutes";
import { registerGeographicRoutes } from "./routes/geographicRoutes";
import { registerFixGeocodingRoute } from "./routes/fixGeocodingRoute";
import multer from 'multer';
import { requireAdminAuth } from "./adminAuth";
import { objectStorageService } from "./objectStorageService";

export async function registerRoutes(app: Express): Promise<Server> {
  // SEO: Redirect middleware for canonical domain enforcement
  app.use((req, res, next) => {
    const host = req.get('Host') || '';
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const path = req.path;
    
    // Handle /home redirects first (before other redirects)
    if (path === '/home' || path === '/home/') {
      const targetHost = host.startsWith('www.') ? host.slice(4) : host;
      const targetProtocol = protocol === 'http' && process.env.NODE_ENV === 'production' ? 'https' : protocol;
      return res.redirect(301, `${targetProtocol}://${targetHost}/`);
    }
    
    // Check if we need to redirect to HTTPS
    if (protocol === 'http' && process.env.NODE_ENV === 'production') {
      const targetHost = host.startsWith('www.') ? host.slice(4) : host;
      return res.redirect(301, `https://${targetHost}${req.originalUrl}`);
    }
    
    // Check if we need to redirect from www to non-www
    if (host.startsWith('www.')) {
      const nonWwwHost = host.slice(4); // Remove 'www.'
      return res.redirect(301, `${protocol}://${nonWwwHost}${req.originalUrl}`);
    }
    
    // Continue to next middleware
    next();
  });
  
  // Serve generated images from Object Storage
  app.get('/generated_images/:filename', async (req, res) => {
    const { filename } = req.params;
    await objectStorageService.streamFile(filename, res);
  });
  
  // Serve uploaded files (logos, etc.)
  app.use('/uploads', express.static(path.resolve(import.meta.dirname, 'uploads')));
  
  // Serve banner images from Object Storage (like generated images)
  app.get('/banner-images/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage({
        credentials: {
          type: 'external_account',
          audience: 'replit',
          subject_token_type: 'access_token',
          token_url: 'http://127.0.0.1:1106/token',
          credential_source: {
            url: 'http://127.0.0.1:1106/credential',
            format: {
              type: 'json',
              subject_token_field_name: 'access_token'
            }
          },
          universe_domain: 'googleapis.com'
        },
        projectId: ''
      });
      const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketName) {
        return res.status(500).send('Object storage not configured');
      }
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`public/banner-images/${filename}`);
      const [exists] = await file.exists();
      
      if (!exists) {
        return res.status(404).send('Banner image not found');
      }

      const [metadata] = await file.getMetadata();
      
      res.set({
        'Content-Type': metadata.contentType || 'image/jpeg',
        'Content-Length': metadata.size,
        'Cache-Control': 'public, max-age=86400' // 24 hours cache
      });

      const stream = file.createReadStream();
      stream.on('error', (err) => {
        console.error('Banner stream error:', err);
        if (!res.headersSent) {
          res.status(500).send('Error streaming banner image');
        }
      });

      stream.pipe(res);
    } catch (error) {
      console.error('Error serving banner image:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
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

  // URL reachability checker - SECURE VERSION
  app.get("/api/url-check", async (req, res) => {
    try {
      const url = req.query.u as string;
      
      if (!url) {
        return res.json({ ok: false, reason: 'No URL provided' });
      }

      // Basic URL validation
      let targetUrl: URL;
      try {
        targetUrl = new URL(url);
      } catch (error) {
        return res.json({ ok: false, reason: 'Invalid URL format' });
      }

      // Security: Only allow http/https protocols
      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return res.json({ ok: false, reason: 'Only http and https URLs are allowed' });
      }

      // Helper function to check if IP is private/local/reserved
      const isPrivateOrReservedIP = (ip: string): boolean => {
        // IPv4 checks
        if (ip.includes('.')) {
          // Localhost
          if (ip === '127.0.0.1' || ip.startsWith('127.')) return true;
          
          // Private ranges (RFC1918)
          if (ip.startsWith('10.')) return true;
          if (ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) return true;
          if (ip.startsWith('192.168.')) return true;
          
          // Link-local (RFC3927)
          if (ip.startsWith('169.254.')) return true;
          
          // Multicast (Class D)
          if (ip.match(/^22[4-9]\.|^23[0-9]\./)) return true;
          
          // Reserved ranges
          if (ip.startsWith('0.')) return true; // This network
          if (ip === '255.255.255.255') return true; // Broadcast
          if (ip.match(/^24[0-9]\./)) return true; // Class E reserved
          
          return false;
        }
        
        // IPv6 checks  
        if (ip.includes(':')) {
          const ipLower = ip.toLowerCase();
          
          // Localhost
          if (ipLower === '::1') return true;
          
          // Link-local
          if (ipLower.startsWith('fe80:')) return true;
          if (ipLower.startsWith('fe90:')) return true;
          if (ipLower.startsWith('fea0:')) return true;
          if (ipLower.startsWith('feb0:')) return true;
          
          // Unique local (RFC4193)
          if (ipLower.startsWith('fc00:')) return true;
          if (ipLower.startsWith('fd00:')) return true;
          
          // Multicast
          if (ipLower.startsWith('ff00:')) return true;
          
          // IPv4-mapped IPv6
          if (ipLower.startsWith('::ffff:')) {
            const ipv4Part = ip.split('::ffff:')[1];
            if (ipv4Part) return isPrivateOrReservedIP(ipv4Part);
          }
          
          return false;
        }
        
        return true; // Unknown format, be safe
      };

      // Helper function to resolve hostname and validate all IPs
      const validateHostname = async (hostname: string): Promise<{ valid: boolean; reason?: string }> => {
        // Direct IP address check
        if (isPrivateOrReservedIP(hostname)) {
          return { valid: false, reason: 'Private/local addresses are not allowed' };
        }
        
        // Blocked hostnames
        const blockedHosts = ['localhost', 'broadcasthost'];
        if (blockedHosts.includes(hostname.toLowerCase())) {
          return { valid: false, reason: 'Blocked hostname' };
        }
        
        // DNS resolution with timeout
        const dns = await import('dns');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second DNS timeout
        
        try {
          // Resolve both IPv4 and IPv6
          const resolvePromises = [];
          
          // IPv4 resolution
          resolvePromises.push(
            dns.promises.resolve4(hostname).catch(() => [])
          );
          
          // IPv6 resolution  
          resolvePromises.push(
            dns.promises.resolve6(hostname).catch(() => [])
          );
          
          const [ipv4Addresses, ipv6Addresses] = await Promise.all(resolvePromises);
          const allIPs = [...ipv4Addresses, ...ipv6Addresses];
          
          clearTimeout(timeoutId);
          
          if (allIPs.length === 0) {
            return { valid: false, reason: 'Cannot resolve hostname' };
          }
          
          // Check all resolved IPs
          for (const ip of allIPs) {
            if (isPrivateOrReservedIP(ip)) {
              return { valid: false, reason: `Resolved to private/local address: ${ip}` };
            }
          }
          
          return { valid: true };
          
        } catch (error) {
          clearTimeout(timeoutId);
          if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
            return { valid: false, reason: 'DNS resolution timed out' };
          }
          return { valid: false, reason: 'DNS resolution failed' };
        }
      };

      // Helper function to safely fetch with redirect validation
      const safeFetch = async (url: string, maxRedirects = 3): Promise<{
        ok: boolean;
        status?: number;
        finalUrl?: string;
        reason?: string;
      }> => {
        let currentUrl = url;
        let redirectCount = 0;
        const maxDownloadSize = 1024 * 1024; // 1MB limit
        
        while (redirectCount <= maxRedirects) {
          const parsedUrl = new URL(currentUrl);
          
          // Validate current URL's hostname
          const validation = await validateHostname(parsedUrl.hostname);
          if (!validation.valid) {
            return { ok: false, reason: validation.reason };
          }
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          try {
            // First try HEAD request
            let response;
            try {
              response = await fetch(currentUrl, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'manual', // Handle redirects manually
                headers: {
                  'User-Agent': 'COMCUBES-URL-Checker/1.0'
                }
              });
            } catch (headError) {
              // If HEAD fails, try GET with size limit
              response = await fetch(currentUrl, {
                method: 'GET',
                signal: controller.signal,
                redirect: 'manual',
                headers: {
                  'User-Agent': 'COMCUBES-URL-Checker/1.0'
                }
              });
              
              // Check response size for GET requests
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength) > maxDownloadSize) {
                clearTimeout(timeoutId);
                return { ok: false, reason: 'Response too large' };
              }
              
              // If no content-length header, consume response with size limit
              if (!contentLength && response.body) {
                const reader = response.body.getReader();
                let totalSize = 0;
                try {
                  while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    totalSize += value.length;
                    if (totalSize > maxDownloadSize) {
                      reader.releaseLock();
                      clearTimeout(timeoutId);
                      return { ok: false, reason: 'Response too large' };
                    }
                  }
                } finally {
                  reader.releaseLock();
                }
              }
            }
            
            clearTimeout(timeoutId);
            
            // Handle redirects
            if (response.status >= 300 && response.status < 400) {
              const location = response.headers.get('location');
              if (!location) {
                return { ok: false, reason: 'Redirect without location header' };
              }
              
              if (redirectCount >= maxRedirects) {
                return { ok: false, reason: 'Too many redirects' };
              }
              
              // Resolve relative redirects
              try {
                currentUrl = new URL(location, currentUrl).toString();
              } catch (error) {
                return { ok: false, reason: 'Invalid redirect URL' };
              }
              
              redirectCount++;
              continue;
            }
            
            // Success response
            if (response.ok || (response.status >= 200 && response.status < 400)) {
              return {
                ok: true,
                status: response.status,
                finalUrl: currentUrl
              };
            } else {
              return {
                ok: false,
                status: response.status,
                reason: `Server returned status ${response.status}`
              };
            }
            
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            
            if (fetchError.name === 'AbortError') {
              return { ok: false, reason: 'Request timed out' };
            }
            
            return { ok: false, reason: 'Unable to reach website' };
          }
        }
        
        return { ok: false, reason: 'Redirect loop detected' };
      };

      // Perform the safe fetch
      const result = await safeFetch(targetUrl.toString());
      res.json(result);

    } catch (error) {
      console.error("URL check error:", error);
      res.status(500).json({ ok: false, reason: 'Server error during URL check' });
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

  // Company listing endpoint - removed duplicate, using the one with slot validation below

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
      const amountInCents = amount; // Frontend now sends cents directly
      
      // Get listing details for email
      const listings = await storage.getCompanyListings();
      const listing = listings.find(l => l.id === listingId);
      
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const paymentData = await paystackService.initializePayment({
        email: listing.contactEmail,
        amount: amountInCents,
        currency: 'USD', // Specify USD currency for international business
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
  app.get('/api/admin/company-listings', requireAdminAuth, async (req, res) => {
    try {
      const listings = await storage.getCompanyListings();
      res.json(listings);
    } catch (error) {
      console.error('Error fetching company listings:', error);
      res.status(500).json({ error: 'Failed to fetch company listings' });
    }
  });

  app.post('/api/admin/company-listings/:id/approve', requireAdminAuth, async (req, res) => {
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
        employeeCount: null,
        revenueEstimate: null,
        foundedYear: null,
        companySize: null,
        specializationTags: null,
        verificationStatus: 'unverified'
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

  app.post('/api/admin/company-listings/:id/reject', requireAdminAuth, async (req, res) => {
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

  // Banner Ad Management Endpoints
  app.get("/api/admin/banner-ads", requireAdminAuth, async (req, res) => {
    try {
      const bannerAds = await storage.getBannerAds();
      res.json(bannerAds);
    } catch (error) {
      console.error("Error fetching banner ads:", error);
      res.status(500).json({ error: "Failed to fetch banner ads" });
    }
  });

  app.post("/api/admin/banner-ads", requireAdminAuth, async (req, res) => {
    try {
      const { position, images, imageUrls, clickUrl, rotationInterval, isActive } = req.body;
      const bannerAd = await storage.createBannerAd({
        position,
        images: images || [],
        imageUrls: imageUrls || [],
        clickUrl,
        rotationInterval: rotationInterval !== undefined ? rotationInterval : 7000,
        isActive: isActive !== false
      });
      res.json(bannerAd);
    } catch (error) {
      console.error("Error creating banner ad:", error);
      res.status(500).json({ error: "Failed to create banner ad" });
    }
  });

  app.put("/api/admin/banner-ads/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { position, images, imageUrls, clickUrl, rotationInterval, isActive } = req.body;
      const bannerAd = await storage.updateBannerAd(parseInt(id), {
        position,
        images: images || [],
        imageUrls: imageUrls || [],
        clickUrl,
        rotationInterval: rotationInterval !== undefined ? rotationInterval : 7000,
        isActive,
        updatedAt: new Date()
      });
      if (!bannerAd) {
        return res.status(404).json({ error: "Banner ad not found" });
      }
      res.json(bannerAd);
    } catch (error) {
      console.error("Error updating banner ad:", error);
      res.status(500).json({ error: "Failed to update banner ad" });
    }
  });

  app.delete("/api/admin/banner-ads/:id", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBannerAd(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Banner ad not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting banner ad:", error);
      res.status(500).json({ error: "Failed to delete banner ad" });
    }
  });

  // Get active banner ads for the website
  app.get("/api/banner-ads", async (req, res) => {
    try {
      const position = req.query.position as string;
      const bannerAds = await storage.getActiveBannerAds(position);
      res.json(bannerAds);
    } catch (error) {
      console.error("Error fetching active banner ads:", error);
      res.status(500).json({ error: "Failed to fetch banner ads" });
    }
  });

  // Initialize default banner ads (one-time setup)
  app.post("/api/admin/banner-ads/initialize", requireAdminAuth, async (req, res) => {
    try {
      // Check if banner ads already exist
      const existingBanners = await storage.getBannerAds();
      if (existingBanners.length > 0) {
        return res.json({ message: "Banner ads already initialized" });
      }

      // Create default left banner
      await storage.createBannerAd({
        position: 'left',
        images: [
          'https://via.placeholder.com/160x600/FF6B6B/FFFFFF?text=Your+Ad+1',
          'https://via.placeholder.com/160x600/4ECDC4/FFFFFF?text=Your+Ad+2',
          'https://via.placeholder.com/160x600/45B7D1/FFFFFF?text=Your+Ad+3',
          'https://via.placeholder.com/160x600/96CEB4/FFFFFF?text=Your+Ad+4',
          'https://via.placeholder.com/160x600/FECA57/000000?text=Your+Ad+5'
        ],
        clickUrl: 'https://www.your-advertiser-website.com',
        isActive: true
      });

      // Create default right banner
      await storage.createBannerAd({
        position: 'right',
        images: [
          'https://via.placeholder.com/160x600/8B5CF6/FFFFFF?text=Promo+A',
          'https://via.placeholder.com/160x600/F59E0B/FFFFFF?text=Promo+B',
          'https://via.placeholder.com/160x600/10B981/FFFFFF?text=Promo+C'
        ],
        clickUrl: 'https://www.your-business-partner.com',
        isActive: true
      });

      res.json({ success: true, message: "Default banner ads initialized" });
    } catch (error) {
      console.error("Error initializing banner ads:", error);
      res.status(500).json({ error: "Failed to initialize banner ads" });
    }
  });

  // Set up multer for file uploads (Object Storage)
  const uploadBanner = multer({ 
    storage: multer.memoryStorage(), // Use memory storage for Object Storage upload
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Direct file upload endpoint for banner images (Object Storage + Admin Auth)
  app.post("/api/objects/upload", requireAdminAuth, uploadBanner.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file uploaded" });
      }
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const ext = path.extname(req.file.originalname);
      const filename = `banner-${timestamp}-${randomId}${ext}`;
      
      // Upload to Object Storage
      const { Storage } = await import('@google-cloud/storage');
      const storage = new Storage({
        credentials: {
          type: 'external_account',
          audience: 'replit',
          subject_token_type: 'access_token',
          token_url: 'http://127.0.0.1:1106/token',
          credential_source: {
            url: 'http://127.0.0.1:1106/credential',
            format: {
              type: 'json',
              subject_token_field_name: 'access_token'
            }
          },
          universe_domain: 'googleapis.com'
        },
        projectId: ''
      });
      
      const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketName) {
        return res.status(500).json({ error: 'Object storage not configured' });
      }
      
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`public/banner-images/${filename}`);
      
      await file.save(req.file.buffer, {
        metadata: {
          contentType: req.file.mimetype,
          cacheControl: 'public, max-age=86400'
        }
      });
      
      const imageUrl = `/banner-images/${filename}`;
      console.log('Banner image uploaded successfully to Object Storage:', imageUrl);
      
      res.json({ 
        success: true,
        imageUrl: imageUrl,
        filename: filename
      });
    } catch (error) {
      console.error("Error uploading banner image to Object Storage:", error);
      res.status(500).json({ error: "Failed to upload banner image" });
    }
  });

  // Banner image upload endpoint for object storage integration
  app.put("/api/banner-images", async (req, res) => {
    try {
      const { bannerImageURL } = req.body;
      if (!bannerImageURL) {
        return res.status(400).json({ error: "bannerImageURL is required" });
      }

      // For banner images, we'll make them public by default
      // This endpoint is used to set ACL policies for uploaded images
      res.status(200).json({
        message: "Banner image processed successfully",
        url: bannerImageURL
      });
    } catch (error) {
      console.error("Error processing banner image:", error);
      res.status(500).json({ error: "Failed to process banner image" });
    }
  });

  // Admin endpoint for waitlist management
  app.get('/api/admin/waitlist', requireAdminAuth, async (req, res) => {
    try {
      const waitlist = await storage.getAllWaitlistEntries();
      res.json(waitlist);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      res.status(500).json({ error: 'Failed to fetch waitlist entries' });
    }
  });

  // Admin endpoint for industry statistics
  app.get('/api/admin/industry-stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getIndustryWaitlistStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching industry stats:', error);
      res.status(500).json({ error: 'Failed to fetch industry statistics' });
    }
  });

  // Admin endpoint for overall system statistics
  app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
  });

  // Ad Analytics endpoints
  app.post('/api/analytics/track', async (req, res) => {
    try {
      const { bannerId, eventType, imageUrl, referrerPage } = req.body;
      
      if (!bannerId || !eventType) {
        return res.status(400).json({ error: 'bannerId and eventType are required' });
      }

      // Get client info
      const userAgent = req.get('User-Agent') || 'unknown';
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

      const analytics = await storage.recordAdEvent({
        bannerId: parseInt(bannerId),
        eventType,
        imageUrl,
        userAgent,
        ipAddress,
        referrerPage
      });

      res.json({ success: true, id: analytics.id });
    } catch (error) {
      console.error('Error tracking ad event:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  });

  // Get ad performance statistics
  app.get('/api/admin/ad-performance', requireAdminAuth, async (req, res) => {
    try {
      const { bannerId } = req.query;
      const bannerIdNum = bannerId ? parseInt(bannerId as string) : undefined;
      
      const stats = await storage.getAdPerformanceStats(bannerIdNum);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching ad performance:', error);
      res.status(500).json({ error: 'Failed to fetch ad performance' });
    }
  });

  // Get detailed ad analytics
  app.get('/api/admin/ad-analytics', requireAdminAuth, async (req, res) => {
    try {
      const { bannerId, eventType, startDate, endDate } = req.query;
      const bannerIdNum = bannerId ? parseInt(bannerId as string) : undefined;
      
      const analytics = await storage.getAdAnalytics(
        bannerIdNum, 
        eventType as string, 
        startDate as string, 
        endDate as string
      );
      
      res.json(analytics);
    } catch (error) {
      console.error('Error fetching ad analytics:', error);
      res.status(500).json({ error: 'Failed to fetch ad analytics' });
    }
  });

  // Admin company claims endpoints
  app.get('/api/admin/company-claims', requireAdminAuth, async (req, res) => {
    try {
      const claims = await storage.getAllCompanyClaims();
      res.json(claims);
    } catch (error) {
      console.error('Error fetching company claims:', error);
      res.status(500).json({ error: 'Failed to fetch company claims' });
    }
  });

  app.post('/api/admin/company-claims/:id/approve', requireAdminAuth, async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      
      // Get the claim details first
      const allClaims = await storage.getAllCompanyClaims();
      const claim = allClaims.find(c => c.id === claimId);
      
      if (!claim) {
        return res.status(404).json({ error: 'Company claim not found' });
      }
      
      // Update the claim status
      await storage.updateCompanyClaimStatus(claimId, 'approved');
      
      // Update the company with the new owner information
      if (claim.companyId) {
        await storage.updateCompanyOwnership(claim.companyId, {
          verifiedOwner: true,
          ownerEmail: claim.contactEmail,
          ownerName: claim.contactName,
          verificationDate: new Date()
        });
      }
      
      // Send payment instructions email
      const emailService = new EmailService();
      await emailService.sendClaimApprovalEmail(claim);
      
      res.json({ message: 'Company claim approved successfully and company ownership updated' });
    } catch (error) {
      console.error('Error approving company claim:', error);
      res.status(500).json({ error: 'Failed to approve company claim' });
    }
  });

  app.post('/api/admin/company-claims/:id/reject', requireAdminAuth, async (req, res) => {
    try {
      const claimId = parseInt(req.params.id);
      
      // Get the claim details first
      const allClaims = await storage.getAllCompanyClaims();
      const claim = allClaims.find(c => c.id === claimId);
      
      if (!claim) {
        return res.status(404).json({ error: 'Company claim not found' });
      }
      
      await storage.updateCompanyClaimStatus(claimId, 'rejected');
      
      // Send rejection notification email
      const emailService = new EmailService();
      await emailService.sendClaimRejectionEmail(claim);
      
      res.json({ message: 'Company claim rejected successfully' });
    } catch (error) {
      console.error('Error rejecting company claim:', error);
      res.status(500).json({ error: 'Failed to reject company claim' });
    }
  });

  // Admin endpoint to contact waitlist entry
  app.post('/api/admin/waitlist/:id/contact', requireAdminAuth, async (req, res) => {
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
        const { listingId, fallbackPayment, originalAmount } = verification.metadata;
        
        // Handle both USD and NGN fallback payments
        let amount: number;
        if (fallbackPayment && originalAmount) {
          // This was a fallback payment, use the original USD amount
          amount = paystackService.convertToUSD(originalAmount);
          console.log(`Payment verified with NGN fallback, using original USD amount: $${amount}`);
        } else {
          // Regular USD payment
          amount = paystackService.convertToUSD(verification.amount);
        }
        
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

  // SEO: RSS Feed endpoint - handle both /feed and /feed/
  app.get(["/feed", "/feed/"], async (req, res) => {
    try {
      const now = new Date();
      const pubDate = now.toUTCString();
      
      // Get dynamic content from database
      const sectors = await storage.getSectors();
      const industries = await storage.getAllIndustries();
      const companies = await storage.getAllCompanies();
      
      // Get recent/featured content for RSS items
      const featuredSectors = sectors.slice(0, 5); // First 5 sectors
      const featuredIndustries = industries.slice(0, 3); // First 3 industries
      const featuredCompanies = companies.slice(0, 2); // First 2 companies
      
      let rssItems = '';
      
      // Add welcome item
      rssItems += `
    <item>
      <title>COMCUBES Global Business Directory - ${sectors.length} Sectors, ${industries.length} Industries, ${companies.length} Companies</title>
      <link>https://comcubes.com</link>
      <description>Discover our comprehensive global business directory featuring ${sectors.length} business sectors, ${industries.length} specialized industries, and ${companies.length} leading companies worldwide. Navigate business opportunities across all major sectors.</description>
      <pubDate>${pubDate}</pubDate>
      <guid>https://comcubes.com#directory-${now.getTime()}</guid>
    </item>`;
      
      // Add sector items
      featuredSectors.forEach((sector: any) => {
        rssItems += `
    <item>
      <title>Business Sector: ${sector.name}</title>
      <link>https://comcubes.com/sector/${encodeURIComponent(sector.name)}</link>
      <description>Explore companies and industries in the ${sector.name} sector. Discover leading businesses, industry trends, and professional opportunities in this specialized business area.</description>
      <pubDate>${pubDate}</pubDate>
      <guid>https://comcubes.com/sector/${encodeURIComponent(sector.name)}#rss</guid>
    </item>`;
      });
      
      // Add industry items
      featuredIndustries.forEach((industry: any) => {
        rssItems += `
    <item>
      <title>Industry Focus: ${industry.name}</title>
      <link>https://comcubes.com/industry/${encodeURIComponent(industry.name)}</link>
      <description>Companies and opportunities in ${industry.name} industry within ${industry.sectorName} sector. Connect with industry leaders and explore business partnerships.</description>
      <pubDate>${pubDate}</pubDate>
      <guid>https://comcubes.com/industry/${encodeURIComponent(industry.name)}#rss</guid>
    </item>`;
      });
      
      // Add company items
      featuredCompanies.forEach((company: any) => {
        rssItems += `
    <item>
      <title>Featured Company: ${company.name}</title>
      <link>${company.websiteUrl}</link>
      <description>${company.name} in ${company.industryName} industry, ${company.sectorName} sector. ${company.description || 'Leading company providing innovative solutions and business services.'}</description>
      <pubDate>${pubDate}</pubDate>
      <guid>https://comcubes.com/company/${company.id}#rss</guid>
    </item>`;
      });
      
      const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>COMCUBES - Global Business Directory</title>
    <link>https://comcubes.com</link>
    <description>Stay updated with the latest business directory updates, new sectors, industries, and company listings from COMCUBES - your comprehensive global business resource featuring ${sectors.length} sectors, ${industries.length} industries, and ${companies.length} companies worldwide.</description>
    <language>en-us</language>
    <pubDate>${pubDate}</pubDate>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <generator>COMCUBES RSS Generator</generator>
    <atom:link href="https://comcubes.com/feed/" rel="self" type="application/rss+xml"/>
    <webMaster>contact-cgbd@comcubes.com (COMCUBES)</webMaster>
    <managingEditor>admin@comcubes.com (COMCUBES Editorial)</managingEditor>
    <category>Business</category>
    <category>Directory</category>
    <category>Companies</category>
    <ttl>60</ttl>${rssItems}
    
  </channel>
</rss>`;
      
      res.set({
        'Content-Type': 'application/rss+xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      });
      res.send(rssXml);
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      res.status(500).send('Error generating RSS feed');
    }
  });

  // SEO: Robots.txt endpoint
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

# Important pages for crawling
Allow: /sectors
Allow: /industries
Allow: /companies
Allow: /search

# SEO and legal pages
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /disclaimer
Allow: /affiliate-disclosure
Allow: /contact

# Disallow admin and dynamic endpoints
Disallow: /admin
Disallow: /api/
Disallow: /resume-payment
Disallow: /list-company
Disallow: /claim-company

# Sitemap location
Sitemap: https://comcubes.com/sitemap.xml

# Crawl delay to be respectful
Crawl-delay: 1`;
    
    res.set({
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
    });
    res.send(robotsTxt);
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

  // Register geographic routes
  registerGeographicRoutes(app);

  // Register geocoding fix route (admin only)
  registerFixGeocodingRoute(app);

  // Register database sync route (admin only)
  const { registerDatabaseSyncRoute } = await import('./routes/databaseSyncRoute');
  registerDatabaseSyncRoute(app);

  const httpServer = createServer(app);
  return httpServer;
}
