import { csvParser } from './services/csvParser';
import { db } from './db';
import { sectors, industries, companies, contactMessages, companyListings, industryWaitlist, companyClaims, bannerAds, adAnalytics, adPerformanceSummary, emailLogs, type Sector, type Industry, type Company, type ContactMessage, type CompanyListing, type IndustryWaitlist, type CompanyClaim, type BannerAd, type AdAnalytics, type AdPerformanceSummary, type EmailLog, type InsertSector, type InsertIndustry, type InsertCompany, type InsertContactMessage, type InsertCompanyListing, type InsertIndustryWaitlist, type InsertCompanyClaim, type InsertBannerAd, type InsertAdAnalytics, type InsertAdPerformanceSummary, type InsertEmailLog } from '@shared/schema';
import { eq, ilike, or, and } from 'drizzle-orm';
import { generateCompanyDescription } from './services/companyDescriptionGenerator';

export interface IStorage {
  getSectors(): Promise<Sector[]>;
  getIndustriesBySector(sectorName: string): Promise<Industry[]>;
  getCompaniesByIndustry(industryName: string): Promise<Company[]>;
  searchAll(query: string): Promise<{
    sectors: Sector[];
    industries: Industry[];
    companies: Company[];
  }>;
  getAllIndustries(): Promise<Industry[]>;
  getAllCompanies(): Promise<Company[]>;
  getCompanyById(id: number): Promise<Company | undefined>;
  
  // Contact message operations
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Company listing operations
  createCompanyListing(listing: InsertCompanyListing): Promise<CompanyListing>;
  getCompanyListings(): Promise<CompanyListing[]>;
  updateCompanyListingPayment(id: number, paymentReference: string, paymentAmount: number): Promise<CompanyListing | undefined>;
  
  // Company creation
  createCompany(company: Omit<Company, 'id'>): Promise<Company>;
  
  // Slot availability and waitlist
  checkSlotAvailability(industryName: string): Promise<{ available: boolean; currentCount: number; maxSlots: number }>;
  addToWaitlist(waitlistEntry: InsertIndustryWaitlist): Promise<IndustryWaitlist>;
  getWaitlistByIndustry(industryName: string): Promise<IndustryWaitlist[]>;
  
  // Resume payment functionality
  getCompanyListingByEmail(email: string): Promise<CompanyListing[]>;
  
  // Admin dashboard methods
  getAllWaitlistEntries(): Promise<IndustryWaitlist[]>;
  getIndustryWaitlistStats(): Promise<any[]>;
  getAdminStats(): Promise<any>;
  getWaitlistEntryById(id: number): Promise<IndustryWaitlist | undefined>;
  
  // Company claim operations
  createCompanyClaim(claim: InsertCompanyClaim): Promise<CompanyClaim>;
  getCompanyClaim(id: number): Promise<CompanyClaim | undefined>;
  getCompanyClaims(status?: string): Promise<CompanyClaim[]>;
  getAllCompanyClaims(): Promise<CompanyClaim[]>;
  updateCompanyClaimStatus(id: number, status: string, adminNotes?: string): Promise<CompanyClaim | undefined>;
  getCompanyClaimStats(): Promise<any>;
  getPendingClaimsCount(): Promise<number>;
  updateCompanyOwnership(companyId: number, ownershipData: {
    verifiedOwner: boolean;
    ownerEmail: string;
    ownerName: string;
    verificationDate: Date;
  }): Promise<Company | undefined>;
  
  // Banner Ad operations
  getBannerAds(): Promise<BannerAd[]>;
  createBannerAd(bannerAd: InsertBannerAd): Promise<BannerAd>;
  updateBannerAd(id: number, bannerAd: Partial<InsertBannerAd>): Promise<BannerAd | undefined>;
  deleteBannerAd(id: number): Promise<boolean>;
  getActiveBannerAds(position?: string): Promise<BannerAd[]>;
  
  // Email Log operations
  logEmail(email: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(type?: string, relatedId?: number): Promise<EmailLog[]>;
  
  // Ad Analytics operations
  recordAdEvent(analytics: InsertAdAnalytics): Promise<AdAnalytics>;
  getAdAnalytics(bannerId?: number, eventType?: string, startDate?: string, endDate?: string): Promise<AdAnalytics[]>;
  getAdPerformanceSummary(bannerId?: number, dateRange?: { start: string; end: string }): Promise<AdPerformanceSummary[]>;
  updateDailyAdPerformance(bannerId: number, date: string, imageUrl?: string): Promise<void>;
  getAdPerformanceStats(bannerId?: number): Promise<{
    totalImpressions: number;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
    topPerformingImages: { imageUrl: string; clicks: number; impressions: number }[];
    dailyStats: { date: string; clicks: number; views: number; impressions: number }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Checking database connection...');
      
      // Test database connection first
      await db.select().from(sectors).limit(1);
      console.log('Database connection successful');
      
      // Check if data already exists
      const existingSectors = await db.select().from(sectors).limit(1);
      
      if (existingSectors.length === 0) {
        console.log('Loading data from CSV files into database...');
        
        // Load data from CSV files
        const csvSectors = await csvParser.loadSectors();
        const csvIndustries = await csvParser.loadIndustries();
        const csvCompanies = await csvParser.loadCompanies();
        
        console.log(`Loaded ${csvSectors.length} sectors, ${csvIndustries.length} industries, ${csvCompanies.length} companies from CSV`);
        
        // Insert sectors
        if (csvSectors.length > 0) {
          const sectorInserts: InsertSector[] = csvSectors.map(sector => ({ name: sector.name }));
          await db.insert(sectors).values(sectorInserts);
          console.log(`Inserted ${sectorInserts.length} sectors`);
        }
        
        // Insert industries
        if (csvIndustries.length > 0) {
          const industryInserts: InsertIndustry[] = csvIndustries.map(industry => ({
            name: industry.name,
            sectorName: industry.sectorName
          }));
          await db.insert(industries).values(industryInserts);
          console.log(`Inserted ${industryInserts.length} industries`);
        }
        
        // Insert companies in batches (to handle large dataset)
        if (csvCompanies.length > 0) {
          const batchSize = 500; // Smaller batch size for better reliability
          let totalInserted = 0;
          
          for (let i = 0; i < csvCompanies.length; i += batchSize) {
            const batch = csvCompanies.slice(i, i + batchSize);
            const companyInserts: InsertCompany[] = batch.map(company => ({
              name: company.name,
              websiteUrl: company.websiteUrl,
              industryName: company.industryName,
              sectorName: company.sectorName
            }));
            
            await db.insert(companies).values(companyInserts);
            totalInserted += companyInserts.length;
            console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}, total: ${totalInserted}/${csvCompanies.length} companies`);
          }
        }
        
        // Initialize default banner ads if none exist
        const existingBanners = await this.getBannerAds();
        if (existingBanners.length === 0) {
          console.log('Initializing default banner ads...');
          
          // Create default left banner
          await this.createBannerAd({
            position: 'left',
            images: [
              '/banner-images/banner-1756772869185-e7zf3gbm5oh.jpg',
              '/banner-images/banner-1756772896318-fdn74xfwtbp.jpg',
              '/banner-images/banner-1756772918354-nhg6ydt1x5.jpg'
            ],
            imageUrls: [
              'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/',
              'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/',
              'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/'
            ],
            clickUrl: 'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/',
            rotationInterval: 10000,
            isActive: true
          });

          // Create default right banner
          await this.createBannerAd({
            position: 'right',
            images: ['/banner-images/banner-1756772583342-9ixfpj72x7t.jpg'],
            imageUrls: ['https://rzekl.com/g/1e8d114494305e38d9b416525dc3e8/'],
            clickUrl: 'https://rzekl.com/g/1e8d114494305e38d9b416525dc3e8/',
            rotationInterval: 7000,
            isActive: true
          });
          
          console.log('Default banner ads initialized');
        }
        
        console.log(`Database initialized successfully with ${csvSectors.length} sectors, ${csvIndustries.length} industries, ${csvCompanies.length} companies`);
      } else {
        console.log('Database already contains data, skipping initialization');
        
        // Check and initialize banner ads even if main data exists
        const existingBanners = await this.getBannerAds();
        if (existingBanners.length === 0) {
          console.log('Initializing missing banner ads...');
          
          await this.createBannerAd({
            position: 'left',
            images: [
              '/banner-images/banner-1756772869185-e7zf3gbm5oh.jpg',
              '/banner-images/banner-1756772896318-fdn74xfwtbp.jpg',
              '/banner-images/banner-1756772918354-nhg6ydt1x5.jpg'
            ],
            imageUrls: [
              'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/',
              'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/',
              'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/'
            ],
            clickUrl: 'https://rzekl.com/g/pzwp2neyhy305e38d9b46a95c12d58/',
            rotationInterval: 10000,
            isActive: true
          });

          await this.createBannerAd({
            position: 'right',
            images: ['/banner-images/banner-1756772583342-9ixfpj72x7t.jpg'],
            imageUrls: ['https://rzekl.com/g/1e8d114494305e38d9b46a95c12d58/'],
            clickUrl: 'https://rzekl.com/g/1e8d114494305e38d9b46a95c12d58/',
            rotationInterval: 7000,
            isActive: true
          });
          
          console.log('Banner ads initialized');
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing database:', error);
      // Don't throw error - allow app to continue with empty data
      this.initialized = true;
    }
  }

  async getSectors(): Promise<Sector[]> {
    try {
      await this.initialize();
      return await db.select().from(sectors).orderBy(sectors.name);
    } catch (error) {
      console.error('Error getting sectors:', error);
      return [];
    }
  }

  async getIndustriesBySector(sectorName: string): Promise<Industry[]> {
    try {
      await this.initialize();
      return await db.select().from(industries)
        .where(eq(industries.sectorName, sectorName))
        .orderBy(industries.name);
    } catch (error) {
      console.error('Error getting industries by sector:', error);
      return [];
    }
  }

  async getCompaniesByIndustry(industryName: string): Promise<Company[]> {
    try {
      await this.initialize();
      return await db.select().from(companies)
        .where(eq(companies.industryName, industryName))
        .orderBy(companies.name);
    } catch (error) {
      console.error('Error getting companies by industry:', error);
      return [];
    }
  }

  async getAllIndustries(): Promise<Industry[]> {
    try {
      await this.initialize();
      return await db.select().from(industries).orderBy(industries.name);
    } catch (error) {
      console.error('Error getting all industries:', error);
      return [];
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    try {
      await this.initialize();
      // Order by name for alphabetical sorting like sectors and industries
      return await db.select().from(companies).orderBy(companies.name);
    } catch (error) {
      console.error('Error getting all companies:', error);
      return [];
    }
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    try {
      await this.initialize();
      const [company] = await db.select().from(companies)
        .where(eq(companies.id, id))
        .limit(1);
      return company || undefined;
    } catch (error) {
      console.error('Error getting company by ID:', error);
      return undefined;
    }
  }

  async searchAll(query: string): Promise<{
    sectors: Sector[];
    industries: Industry[];
    companies: Company[];
  }> {
    try {
      await this.initialize();
      const searchPattern = `%${query}%`;

      const [sectorResults, industryResults, companyResults] = await Promise.all([
        db.select().from(sectors)
          .where(ilike(sectors.name, searchPattern))
          .orderBy(sectors.name),
        
        db.select().from(industries)
          .where(or(
            ilike(industries.name, searchPattern),
            ilike(industries.sectorName, searchPattern)
          ))
          .orderBy(industries.name),
        
        db.select().from(companies)
          .where(or(
            ilike(companies.name, searchPattern),
            ilike(companies.industryName, searchPattern),
            ilike(companies.sectorName, searchPattern)
          ))
          .orderBy(companies.name)
      ]);

      return {
        sectors: sectorResults,
        industries: industryResults,
        companies: companyResults
      };
    } catch (error) {
      console.error('Error searching all:', error);
      return {
        sectors: [],
        industries: [],
        companies: []
      };
    }
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    try {
      await this.initialize();
      const [created] = await db.insert(contactMessages).values(message).returning();
      return created;
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw new Error('Failed to create contact message');
    }
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    try {
      await this.initialize();
      return await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  }

  async createCompanyListing(listing: InsertCompanyListing): Promise<CompanyListing> {
    try {
      await this.initialize();
      const [created] = await db.insert(companyListings).values(listing).returning();
      return created;
    } catch (error) {
      console.error('Error creating company listing:', error);
      throw new Error('Failed to create company listing');
    }
  }

  async getCompanyListings(): Promise<CompanyListing[]> {
    try {
      await this.initialize();
      return await db.select().from(companyListings).orderBy(companyListings.submittedAt);
    } catch (error) {
      console.error('Error getting company listings:', error);
      return [];
    }
  }

  async updateCompanyListingPayment(id: number, paymentReference: string, paymentAmount: number): Promise<CompanyListing | undefined> {
    try {
      await this.initialize();
      const [updated] = await db.update(companyListings)
        .set({ 
          paymentReference, 
          paymentAmount: paymentAmount.toString(),
          paymentStatus: 'completed' 
        })
        .where(eq(companyListings.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating company listing payment:', error);
      throw new Error('Failed to update payment information');
    }
  }

  async createCompany(company: Omit<Company, 'id'>): Promise<Company> {
    try {
      await this.initialize();
      const [created] = await db.insert(companies).values(company).returning();
      return created;
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  }

  async checkSlotAvailability(industryName: string): Promise<{ available: boolean; currentCount: number; maxSlots: number }> {
    try {
      await this.initialize();
      const companiesInIndustry = await db.select().from(companies)
        .where(eq(companies.industryName, industryName));
      
      const maxSlots = 20; // Each industry grid shows 20 companies (5x4 grid)
      const currentCount = companiesInIndustry.length;
      
      return {
        available: currentCount < maxSlots,
        currentCount,
        maxSlots
      };
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return { available: false, currentCount: 0, maxSlots: 20 };
    }
  }

  async addToWaitlist(waitlistEntry: InsertIndustryWaitlist): Promise<IndustryWaitlist> {
    try {
      await this.initialize();
      const [created] = await db.insert(industryWaitlist).values(waitlistEntry).returning();
      return created;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      throw new Error('Failed to add to waitlist');
    }
  }

  async getWaitlistByIndustry(industryName: string): Promise<IndustryWaitlist[]> {
    try {
      await this.initialize();
      return await db.select().from(industryWaitlist)
        .where(eq(industryWaitlist.industryName, industryName))
        .orderBy(industryWaitlist.submittedAt);
    } catch (error) {
      console.error('Error getting waitlist:', error);
      return [];
    }
  }

  async getCompanyListingByEmail(email: string): Promise<CompanyListing[]> {
    try {
      await this.initialize();
      return await db.select().from(companyListings)
        .where(eq(companyListings.contactEmail, email))
        .orderBy(companyListings.submittedAt);
    } catch (error) {
      console.error('Error getting company listings by email:', error);
      return [];
    }
  }

  async getAllWaitlistEntries(): Promise<IndustryWaitlist[]> {
    try {
      await this.initialize();
      return await db.select().from(industryWaitlist)
        .orderBy(industryWaitlist.submittedAt);
    } catch (error) {
      console.error('Error getting all waitlist entries:', error);
      return [];
    }
  }

  async getIndustryWaitlistStats(): Promise<any[]> {
    try {
      await this.initialize();
      // Get all unique industry names from waitlist
      const waitlistIndustries = await db.selectDistinct({ industryName: industryWaitlist.industryName })
        .from(industryWaitlist);
      
      const stats = [];
      
      for (const industry of waitlistIndustries) {
        const waitlistCount = await db.select()
          .from(industryWaitlist)
          .where(eq(industryWaitlist.industryName, industry.industryName));
          
        const currentCompanies = await db.select()
          .from(companies)
          .where(eq(companies.industryName, industry.industryName));
        
        stats.push({
          industryName: industry.industryName,
          waitlistCount: waitlistCount.length,
          currentSlots: currentCompanies.length
        });
      }
      
      return stats.sort((a, b) => b.waitlistCount - a.waitlistCount);
    } catch (error) {
      console.error('Error getting industry waitlist stats:', error);
      return [];
    }
  }

  async getAdminStats(): Promise<any> {
    try {
      await this.initialize();
      
      const totalCompanies = await db.select().from(companies);
      const allListings = await db.select().from(companyListings);
      const allWaitlist = await db.select().from(industryWaitlist);
      
      const pendingListings = allListings.filter(l => l.paymentStatus === 'pending');
      const completedPayments = allListings.filter(l => l.paymentStatus === 'completed');
      
      // Count industries at capacity (20 companies) using proper Drizzle syntax
      const companiesGroupedByIndustry = await db.select({
        industryName: companies.industryName,
        count: companies.id
      })
      .from(companies)
      .orderBy(companies.industryName);
      
      // Group by industry name and count
      const industryMap = new Map();
      companiesGroupedByIndustry.forEach(company => {
        const count = industryMap.get(company.industryName) || 0;
        industryMap.set(company.industryName, count + 1);
      });
      
      // Count industries with 20 or more companies
      const industriesAtCapacity = Array.from(industryMap.values()).filter(count => count >= 20).length;

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentSubmissions = allListings.filter(
        l => new Date(l.submittedAt) >= sevenDaysAgo
      ).length;

      const pendingClaims = await this.getPendingClaimsCount();

      return {
        totalCompanies: totalCompanies.length,
        pendingListings: pendingListings.length,
        totalWaitlistEntries: allWaitlist.length,
        industriesAtCapacity: industriesAtCapacity,
        recentSubmissions,
        completedPayments: completedPayments.length,
        pendingClaims
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalCompanies: 0,
        pendingListings: 0,
        totalWaitlistEntries: 0,
        industriesAtCapacity: 0,
        recentSubmissions: 0,
        completedPayments: 0,
        pendingClaims: 0
      };
    }
  }

  async getWaitlistEntryById(id: number): Promise<IndustryWaitlist | undefined> {
    try {
      await this.initialize();
      const [entry] = await db.select().from(industryWaitlist)
        .where(eq(industryWaitlist.id, id))
        .limit(1);
      return entry || undefined;
    } catch (error) {
      console.error('Error getting waitlist entry by ID:', error);
      return undefined;
    }
  }

  // Company claim operations
  async createCompanyClaim(claim: InsertCompanyClaim): Promise<CompanyClaim> {
    await this.initialize();
    const [newClaim] = await db.insert(companyClaims).values(claim).returning();
    return newClaim;
  }

  async getCompanyClaim(id: number): Promise<CompanyClaim | undefined> {
    await this.initialize();
    const [claim] = await db.select().from(companyClaims).where(eq(companyClaims.id, id));
    return claim;
  }

  async getCompanyClaims(status?: string): Promise<CompanyClaim[]> {
    await this.initialize();
    if (status) {
      return db.select().from(companyClaims).where(eq(companyClaims.status, status));
    }
    return db.select().from(companyClaims);
  }

  async getAllCompanyClaims(): Promise<CompanyClaim[]> {
    await this.initialize();
    return db.select().from(companyClaims);
  }

  async getPendingClaimsCount(): Promise<number> {
    await this.initialize();
    const pendingClaims = await db.select().from(companyClaims).where(eq(companyClaims.status, 'pending'));
    return pendingClaims.length;
  }

  async updateCompanyClaimStatus(id: number, status: string, adminNotes?: string): Promise<CompanyClaim | undefined> {
    await this.initialize();
    const updateData: any = { status };
    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }
    if (status === 'approved' || status === 'completed') {
      updateData.processedAt = new Date();
    }
    
    const [updatedClaim] = await db.update(companyClaims)
      .set(updateData)
      .where(eq(companyClaims.id, id))
      .returning();
    return updatedClaim;
  }

  async updateCompanyClaimEmailVerification(claimId: number, emailVerified: boolean): Promise<CompanyClaim | undefined> {
    await this.initialize();
    const [claim] = await db
      .update(companyClaims)
      .set({ 
        emailVerified,
        processedAt: emailVerified ? new Date() : null 
      })
      .where(eq(companyClaims.id, claimId))
      .returning();
    return claim;
  }

  async updateCompanyClaimVerificationCode(claimId: number, verificationCode: string, verificationExpiresAt: Date): Promise<CompanyClaim | undefined> {
    await this.initialize();
    const [claim] = await db
      .update(companyClaims)
      .set({ 
        verificationCode,
        verificationSentAt: new Date(),
        verificationExpiresAt 
      })
      .where(eq(companyClaims.id, claimId))
      .returning();
    return claim;
  }

  async getCompanyClaimStats(): Promise<any> {
    await this.initialize();
    // Get basic claim statistics
    const allClaims = await db.select().from(companyClaims);
    
    const stats = {
      total: allClaims.length,
      pending: allClaims.filter(claim => claim.status === 'pending').length,
      approved: allClaims.filter(claim => claim.status === 'approved').length,
      rejected: allClaims.filter(claim => claim.status === 'rejected').length,
      completed: allClaims.filter(claim => claim.status === 'completed').length,
      recent: allClaims.filter(claim => {
        const submittedDate = new Date(claim.submittedAt);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return submittedDate >= sevenDaysAgo;
      }).length
    };

    return stats;
  }

  async updateCompanyOwnership(companyId: number, ownershipData: {
    verifiedOwner: boolean;
    ownerEmail: string;
    ownerName: string;
    verificationDate: Date;
  }): Promise<Company | undefined> {
    await this.initialize();
    
    // Note: This is a conceptual implementation
    // The current companies table doesn't have ownership fields
    // In a real implementation, you'd add these fields to the companies table schema
    
    console.log(`Would update company ${companyId} with ownership data:`, ownershipData);
    
    // For now, just return the existing company
    const [company] = await db.select().from(companies).where(eq(companies.id, companyId));
    return company;
  }

  // Banner Ad operations
  async getBannerAds(): Promise<BannerAd[]> {
    await this.initialize();
    return await db.select().from(bannerAds);
  }

  async createBannerAd(bannerAd: InsertBannerAd): Promise<BannerAd> {
    await this.initialize();
    const [newBannerAd] = await db.insert(bannerAds).values(bannerAd).returning();
    return newBannerAd;
  }

  async updateBannerAd(id: number, bannerAdData: Partial<InsertBannerAd>): Promise<BannerAd | undefined> {
    await this.initialize();
    const [updatedBannerAd] = await db
      .update(bannerAds)
      .set({ ...bannerAdData, updatedAt: new Date() })
      .where(eq(bannerAds.id, id))
      .returning();
    return updatedBannerAd;
  }

  async deleteBannerAd(id: number): Promise<boolean> {
    await this.initialize();
    const result = await db.delete(bannerAds).where(eq(bannerAds.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveBannerAds(position?: string): Promise<BannerAd[]> {
    await this.initialize();
    if (position) {
      return await db.select().from(bannerAds)
        .where(and(eq(bannerAds.isActive, true), eq(bannerAds.position, position)));
    } else {
      return await db.select().from(bannerAds)
        .where(eq(bannerAds.isActive, true));
    }
  }

  // Email Log operations
  async logEmail(email: InsertEmailLog): Promise<EmailLog> {
    await this.initialize();
    const [newEmailLog] = await db.insert(emailLogs).values(email).returning();
    return newEmailLog;
  }

  async getEmailLogs(type?: string, relatedId?: number): Promise<EmailLog[]> {
    await this.initialize();
    if (type && relatedId) {
      return await db.select().from(emailLogs)
        .where(and(eq(emailLogs.emailType, type), eq(emailLogs.relatedId, relatedId)));
    } else if (type) {
      return await db.select().from(emailLogs)
        .where(eq(emailLogs.emailType, type));
    } else if (relatedId) {
      return await db.select().from(emailLogs)
        .where(eq(emailLogs.relatedId, relatedId));
    } else {
      return await db.select().from(emailLogs);
    }
  }

  // Ad Analytics operations
  async recordAdEvent(analytics: InsertAdAnalytics): Promise<AdAnalytics> {
    await this.initialize();
    const [result] = await db.insert(adAnalytics).values(analytics).returning();
    
    // Update daily performance summary
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await this.updateDailyAdPerformance(analytics.bannerId, today, analytics.imageUrl || undefined);
    
    return result;
  }

  async getAdAnalytics(bannerId?: number, eventType?: string, startDate?: string, endDate?: string): Promise<AdAnalytics[]> {
    await this.initialize();
    
    const conditions = [];
    if (bannerId) conditions.push(eq(adAnalytics.bannerId, bannerId));
    if (eventType) conditions.push(eq(adAnalytics.eventType, eventType));
    
    if (conditions.length > 0) {
      return await db.select().from(adAnalytics)
        .where(and(...conditions))
        .orderBy(adAnalytics.timestamp);
    }
    
    return await db.select().from(adAnalytics).orderBy(adAnalytics.timestamp);
  }

  async getAdPerformanceSummary(bannerId?: number, dateRange?: { start: string; end: string }): Promise<AdPerformanceSummary[]> {
    await this.initialize();
    
    if (bannerId) {
      return await db.select().from(adPerformanceSummary)
        .where(eq(adPerformanceSummary.bannerId, bannerId))
        .orderBy(adPerformanceSummary.date);
    }
    
    return await db.select().from(adPerformanceSummary).orderBy(adPerformanceSummary.date);
  }

  async updateDailyAdPerformance(bannerId: number, date: string, imageUrl?: string): Promise<void> {
    await this.initialize();
    
    // Check if summary exists for this banner and date
    const [existingSummary] = await db.select()
      .from(adPerformanceSummary)
      .where(and(
        eq(adPerformanceSummary.bannerId, bannerId),
        eq(adPerformanceSummary.date, date)
      ))
      .limit(1);
    
    if (existingSummary) {
      // Update existing summary - increment the appropriate counter
      const updateData: any = { updatedAt: new Date() };
      updateData.impressions = existingSummary.impressions + 1;
      
      await db.update(adPerformanceSummary)
        .set(updateData)
        .where(eq(adPerformanceSummary.id, existingSummary.id));
    } else {
      // Create new summary
      await db.insert(adPerformanceSummary).values({
        bannerId,
        date,
        imageUrl: imageUrl || null,
        impressions: 1,
        views: 0,
        clicks: 0,
        clickThroughRate: '0.00'
      });
    }
  }

  async getAdPerformanceStats(bannerId?: number): Promise<{
    totalImpressions: number;
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
    topPerformingImages: { imageUrl: string; clicks: number; impressions: number }[];
    dailyStats: { date: string; clicks: number; views: number; impressions: number }[];
  }> {
    await this.initialize();
    
    // Get all performance summaries
    const summaries = bannerId 
      ? await db.select().from(adPerformanceSummary).where(eq(adPerformanceSummary.bannerId, bannerId))
      : await db.select().from(adPerformanceSummary);
    
    // Calculate totals
    const totalImpressions = summaries.reduce((sum, s) => sum + s.impressions, 0);
    const totalViews = summaries.reduce((sum, s) => sum + s.views, 0);
    const totalClicks = summaries.reduce((sum, s) => sum + s.clicks, 0);
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
    
    // Top performing images
    const imageStats = new Map<string, { clicks: number; impressions: number }>();
    summaries.forEach(summary => {
      if (summary.imageUrl) {
        const existing = imageStats.get(summary.imageUrl) || { clicks: 0, impressions: 0 };
        imageStats.set(summary.imageUrl, {
          clicks: existing.clicks + summary.clicks,
          impressions: existing.impressions + summary.impressions
        });
      }
    });
    
    const topPerformingImages = Array.from(imageStats.entries())
      .map(([imageUrl, stats]) => ({ imageUrl, ...stats }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);
    
    // Daily stats (last 30 days)
    const dailyStatsMap = new Map<string, { clicks: number; views: number; impressions: number }>();
    summaries.forEach(summary => {
      const existing = dailyStatsMap.get(summary.date) || { clicks: 0, views: 0, impressions: 0 };
      dailyStatsMap.set(summary.date, {
        clicks: existing.clicks + summary.clicks,
        views: existing.views + summary.views,
        impressions: existing.impressions + summary.impressions
      });
    });
    
    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
    
    return {
      totalImpressions,
      totalViews,
      totalClicks,
      clickThroughRate,
      topPerformingImages,
      dailyStats
    };
  }
}

export const storage = new DatabaseStorage();
