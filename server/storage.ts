import { csvParser } from './services/csvParser';
import { db } from './db';
import { sectors, industries, companies, contactMessages, companyListings, industryWaitlist, companyClaims, bannerAds, adAnalytics, adPerformanceSummary, emailLogs, continents, regions, countries, companyLocations, type Sector, type Industry, type Company, type ContactMessage, type CompanyListing, type IndustryWaitlist, type CompanyClaim, type BannerAd, type AdAnalytics, type AdPerformanceSummary, type EmailLog, type Continent, type Region, type Country, type CompanyLocation, type InsertSector, type InsertIndustry, type InsertCompany, type InsertContactMessage, type InsertCompanyListing, type InsertIndustryWaitlist, type InsertCompanyClaim, type InsertBannerAd, type InsertAdAnalytics, type InsertAdPerformanceSummary, type InsertEmailLog } from '@shared/schema';
import { eq, ilike, or, and, sql } from 'drizzle-orm';
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

  // Geographic operations
  getContinents(): Promise<Continent[]>;
  getContinentBySlug(slug: string): Promise<Continent | undefined>;
  getRegionsByContinent(continentId: number): Promise<Region[]>;
  getRegionBySlug(slug: string): Promise<Region | undefined>;
  getCountriesByRegion(regionId: number): Promise<Country[]>;
  getCountriesByContinent(continentId: number): Promise<Country[]>;
  getCountryBySlug(slug: string): Promise<Country | undefined>;
  getCompaniesByCountry(countryId: number, confidenceFilter?: string[]): Promise<Array<Company & { location: CompanyLocation }>>;
  getCompaniesByCountryWithFilters(countryId: number, filters?: { sectorName?: string; industryName?: string; confidence?: string[] }): Promise<Array<Company & { location: CompanyLocation }>>;
  getCompaniesByRegionWithFilters(regionId: number, filters?: { countryId?: number; sectorName?: string; industryName?: string; confidence?: string[] }): Promise<Array<Company & { location: CompanyLocation }>>;
  getGeographicStats(): Promise<{
    totalContinents: number;
    totalRegions: number;
    totalCountries: number;
    totalGeocodedCompanies: number;
    confidenceDistribution: Array<{ confidence: string; count: number }>;
  }>;
  getRegionStats(regionId: number): Promise<{
    totalCountries: number;
    totalCompanies: number;
    topCountries: Array<{ countryName: string; companyCount: number }>;
  }>;
  getCountryStats(countryId: number): Promise<{
    totalCompanies: number;
    sectorBreakdown: Array<{ sectorName: string; count: number }>;
    industryBreakdown: Array<{ industryName: string; count: number }>;
  }>;
  getContinentStats(continentId: number): Promise<{
    totalCountries: number;
    totalCompanies: number;
    topCountries: Array<{ countryName: string; companyCount: number }>;
  }>;
  getTopCountriesByCompanyCount(limit: number): Promise<Array<Country & { companyCount: number }>>;
}

export class DatabaseStorage implements IStorage {

  async getSectors(): Promise<Sector[]> {
    try {

      return await db.select().from(sectors).orderBy(sectors.name);
    } catch (error) {
      console.error('Error getting sectors:', error);
      return [];
    }
  }

  async getIndustriesBySector(sectorName: string): Promise<Industry[]> {
    try {

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

      return await db.select().from(industries).orderBy(industries.name);
    } catch (error) {
      console.error('Error getting all industries:', error);
      return [];
    }
  }

  async getAllCompanies(): Promise<Company[]> {
    try {

      // Order by name for alphabetical sorting like sectors and industries
      return await db.select().from(companies).orderBy(companies.name);
    } catch (error) {
      console.error('Error getting all companies:', error);
      return [];
    }
  }

  async getCompanyById(id: number): Promise<Company | undefined> {
    try {

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

      const [created] = await db.insert(contactMessages).values(message).returning();
      return created;
    } catch (error) {
      console.error('Error creating contact message:', error);
      throw new Error('Failed to create contact message');
    }
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    try {

      return await db.select().from(contactMessages).orderBy(contactMessages.createdAt);
    } catch (error) {
      console.error('Error getting contact messages:', error);
      return [];
    }
  }

  async createCompanyListing(listing: InsertCompanyListing): Promise<CompanyListing> {
    try {

      const [created] = await db.insert(companyListings).values(listing).returning();
      return created;
    } catch (error) {
      console.error('Error creating company listing:', error);
      throw new Error('Failed to create company listing');
    }
  }

  async getCompanyListings(): Promise<CompanyListing[]> {
    try {

      return await db.select().from(companyListings).orderBy(companyListings.submittedAt);
    } catch (error) {
      console.error('Error getting company listings:', error);
      return [];
    }
  }

  async updateCompanyListingPayment(id: number, paymentReference: string, paymentAmount: number): Promise<CompanyListing | undefined> {
    try {

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

      const [created] = await db.insert(companies).values(company).returning();
      return created;
    } catch (error) {
      console.error('Error creating company:', error);
      throw new Error('Failed to create company');
    }
  }

  async checkSlotAvailability(industryName: string): Promise<{ available: boolean; currentCount: number; maxSlots: number }> {
    try {

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

      const [created] = await db.insert(industryWaitlist).values(waitlistEntry).returning();
      return created;
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      throw new Error('Failed to add to waitlist');
    }
  }

  async getWaitlistByIndustry(industryName: string): Promise<IndustryWaitlist[]> {
    try {

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

      return await db.select().from(industryWaitlist)
        .orderBy(industryWaitlist.submittedAt);
    } catch (error) {
      console.error('Error getting all waitlist entries:', error);
      return [];
    }
  }

  async getIndustryWaitlistStats(): Promise<any[]> {
    try {

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

    const [newClaim] = await db.insert(companyClaims).values(claim).returning();
    return newClaim;
  }

  async getCompanyClaim(id: number): Promise<CompanyClaim | undefined> {

    const [claim] = await db.select().from(companyClaims).where(eq(companyClaims.id, id));
    return claim;
  }

  async getCompanyClaims(status?: string): Promise<CompanyClaim[]> {

    if (status) {
      return db.select().from(companyClaims).where(eq(companyClaims.status, status));
    }
    return db.select().from(companyClaims);
  }

  async getAllCompanyClaims(): Promise<CompanyClaim[]> {

    return db.select().from(companyClaims);
  }

  async getPendingClaimsCount(): Promise<number> {

    const pendingClaims = await db.select().from(companyClaims).where(eq(companyClaims.status, 'pending'));
    return pendingClaims.length;
  }

  async updateCompanyClaimStatus(id: number, status: string, adminNotes?: string): Promise<CompanyClaim | undefined> {

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

    return await db.select().from(bannerAds);
  }

  async createBannerAd(bannerAd: InsertBannerAd): Promise<BannerAd> {

    const [newBannerAd] = await db.insert(bannerAds).values(bannerAd).returning();
    return newBannerAd;
  }

  async updateBannerAd(id: number, bannerAdData: Partial<InsertBannerAd>): Promise<BannerAd | undefined> {

    const [updatedBannerAd] = await db
      .update(bannerAds)
      .set({ ...bannerAdData, updatedAt: new Date() })
      .where(eq(bannerAds.id, id))
      .returning();
    return updatedBannerAd;
  }

  async deleteBannerAd(id: number): Promise<boolean> {

    const result = await db.delete(bannerAds).where(eq(bannerAds.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getActiveBannerAds(position?: string): Promise<BannerAd[]> {

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

    const [newEmailLog] = await db.insert(emailLogs).values(email).returning();
    return newEmailLog;
  }

  async getEmailLogs(type?: string, relatedId?: number): Promise<EmailLog[]> {

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

    const [result] = await db.insert(adAnalytics).values(analytics).returning();
    
    // Update daily performance summary
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    await this.updateDailyAdPerformance(analytics.bannerId, today, analytics.imageUrl || undefined);
    
    return result;
  }

  async getAdAnalytics(bannerId?: number, eventType?: string, startDate?: string, endDate?: string): Promise<AdAnalytics[]> {

    
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

    
    if (bannerId) {
      return await db.select().from(adPerformanceSummary)
        .where(eq(adPerformanceSummary.bannerId, bannerId))
        .orderBy(adPerformanceSummary.date);
    }
    
    return await db.select().from(adPerformanceSummary).orderBy(adPerformanceSummary.date);
  }

  async updateDailyAdPerformance(bannerId: number, date: string, imageUrl?: string): Promise<void> {

    
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

  // Geographic operations
  async getContinents(): Promise<Continent[]> {
    try {
      return await db.select().from(continents).orderBy(continents.name);
    } catch (error) {
      console.error('Error getting continents:', error);
      return [];
    }
  }

  async getContinentBySlug(slug: string): Promise<Continent | undefined> {
    try {
      const [continent] = await db.select().from(continents)
        .where(eq(continents.slug, slug))
        .limit(1);
      return continent || undefined;
    } catch (error) {
      console.error('Error getting continent by slug:', error);
      return undefined;
    }
  }

  async getRegionsByContinent(continentId: number): Promise<Region[]> {
    try {
      return await db.select().from(regions)
        .where(eq(regions.continentId, continentId))
        .orderBy(regions.name);
    } catch (error) {
      console.error('Error getting regions by continent:', error);
      return [];
    }
  }

  async getRegionBySlug(slug: string): Promise<Region | undefined> {
    try {
      const [region] = await db.select().from(regions)
        .where(eq(regions.slug, slug))
        .limit(1);
      return region || undefined;
    } catch (error) {
      console.error('Error getting region by slug:', error);
      return undefined;
    }
  }

  async getCountriesByRegion(regionId: number): Promise<Country[]> {
    try {
      return await db.select().from(countries)
        .where(eq(countries.regionId, regionId))
        .orderBy(countries.name);
    } catch (error) {
      console.error('Error getting countries by region:', error);
      return [];
    }
  }

  async getCountriesByContinent(continentId: number): Promise<Country[]> {
    try {
      return await db.select().from(countries)
        .where(eq(countries.continentId, continentId))
        .orderBy(countries.name);
    } catch (error) {
      console.error('Error getting countries by continent:', error);
      return [];
    }
  }

  async getCountryBySlug(slug: string): Promise<any | undefined> {
    try {
      const [result] = await db
        .select({
          id: countries.id,
          name: countries.name,
          slug: countries.slug,
          iso2: countries.iso2,
          iso3: countries.iso3,
          phoneCode: countries.phoneCode,
          capital: countries.capital,
          currency: countries.currency,
          regionId: countries.regionId,
          continentId: countries.continentId,
          flagEmoji: countries.flagEmoji,
          regionName: regions.name,
          regionSlug: regions.slug,
          continentName: continents.name,
          continentSlug: continents.slug
        })
        .from(countries)
        .innerJoin(regions, eq(countries.regionId, regions.id))
        .innerJoin(continents, eq(countries.continentId, continents.id))
        .where(eq(countries.slug, slug))
        .limit(1);
      return result || undefined;
    } catch (error) {
      console.error('Error getting country by slug:', error);
      return undefined;
    }
  }

  async getCompaniesByCountry(
    countryId: number, 
    confidenceFilter?: string[]
  ): Promise<Array<Company & { location: CompanyLocation }>> {
    try {
      const conditions = [eq(companyLocations.countryId, countryId)];
      
      // Filter by confidence if specified (e.g., ['high', 'medium'] to exclude 'low')
      if (confidenceFilter && confidenceFilter.length > 0) {
        conditions.push(
          or(...confidenceFilter.map(c => eq(companyLocations.confidence, c)))!
        );
      }

      const results = await db
        .select({
          id: companies.id,
          name: companies.name,
          websiteUrl: companies.websiteUrl,
          industryName: companies.industryName,
          sectorName: companies.sectorName,
          location: companyLocations
        })
        .from(companyLocations)
        .innerJoin(companies, eq(companyLocations.companyId, companies.id))
        .where(and(...conditions))
        .orderBy(companies.name);
      
      return results.map(r => ({
        id: r.id,
        name: r.name,
        websiteUrl: r.websiteUrl,
        industryName: r.industryName,
        sectorName: r.sectorName,
        location: r.location
      })) as Array<Company & { location: CompanyLocation }>;
    } catch (error) {
      console.error('Error getting companies by country:', error);
      return [];
    }
  }

  async getCompaniesByCountryWithFilters(
    countryId: number, 
    filters?: { sectorName?: string; industryName?: string; confidence?: string[] }
  ): Promise<Array<Company & { location: CompanyLocation }>> {
    try {
      const conditions = [eq(companyLocations.countryId, countryId)];
      
      if (filters?.sectorName) {
        conditions.push(eq(companies.sectorName, filters.sectorName));
      }
      if (filters?.industryName) {
        conditions.push(eq(companies.industryName, filters.industryName));
      }
      if (filters?.confidence && filters.confidence.length > 0) {
        conditions.push(
          or(...filters.confidence.map(c => eq(companyLocations.confidence, c)))!
        );
      }

      const results = await db
        .select({
          id: companies.id,
          name: companies.name,
          websiteUrl: companies.websiteUrl,
          industryName: companies.industryName,
          sectorName: companies.sectorName,
          location: companyLocations
        })
        .from(companyLocations)
        .innerJoin(companies, eq(companyLocations.companyId, companies.id))
        .where(and(...conditions))
        .orderBy(companies.name);
      
      return results.map(r => ({
        id: r.id,
        name: r.name,
        websiteUrl: r.websiteUrl,
        industryName: r.industryName,
        sectorName: r.sectorName,
        location: r.location
      })) as Array<Company & { location: CompanyLocation }>;
    } catch (error) {
      console.error('Error getting companies by country with filters:', error);
      return [];
    }
  }

  async getCompaniesByRegionWithFilters(
    regionId: number, 
    filters?: { countryId?: number; sectorName?: string; industryName?: string; confidence?: string[] }
  ): Promise<Array<Company & { location: CompanyLocation }>> {
    try {
      // First get all countries in this region
      const regionCountries = await db
        .select({ id: countries.id })
        .from(countries)
        .where(eq(countries.regionId, regionId));
      
      const countryIds = regionCountries.map(c => c.id);
      
      if (countryIds.length === 0) {
        return [];
      }

      const conditions = [
        or(...countryIds.map(id => eq(companyLocations.countryId, id)))!
      ];
      
      if (filters?.countryId) {
        conditions.push(eq(companyLocations.countryId, filters.countryId));
      }
      if (filters?.sectorName) {
        conditions.push(eq(companies.sectorName, filters.sectorName));
      }
      if (filters?.industryName) {
        conditions.push(eq(companies.industryName, filters.industryName));
      }
      if (filters?.confidence && filters.confidence.length > 0) {
        conditions.push(
          or(...filters.confidence.map(c => eq(companyLocations.confidence, c)))!
        );
      }

      const results = await db
        .select({
          id: companies.id,
          name: companies.name,
          websiteUrl: companies.websiteUrl,
          industryName: companies.industryName,
          sectorName: companies.sectorName,
          location: companyLocations
        })
        .from(companyLocations)
        .innerJoin(companies, eq(companyLocations.companyId, companies.id))
        .where(and(...conditions))
        .orderBy(companies.name);
      
      return results.map(r => ({
        id: r.id,
        name: r.name,
        websiteUrl: r.websiteUrl,
        industryName: r.industryName,
        sectorName: r.sectorName,
        location: r.location
      })) as Array<Company & { location: CompanyLocation }>;
    } catch (error) {
      console.error('Error getting companies by region with filters:', error);
      return [];
    }
  }

  async getGeographicStats(): Promise<{
    totalContinents: number;
    totalRegions: number;
    totalCountries: number;
    totalGeocodedCompanies: number;
    confidenceDistribution: Array<{ confidence: string; count: number }>;
  }> {
    try {
      const [continentCount] = await db.select({ count: sql<number>`count(*)` }).from(continents);
      const [regionCount] = await db.select({ count: sql<number>`count(*)` }).from(regions);
      const [countryCount] = await db.select({ count: sql<number>`count(*)` }).from(countries);
      const [companyLocationCount] = await db.select({ count: sql<number>`count(DISTINCT company_id)` }).from(companyLocations);
      
      const confidenceDistribution = await db
        .select({
          confidence: companyLocations.confidence,
          count: sql<number>`count(*)`
        })
        .from(companyLocations)
        .groupBy(companyLocations.confidence);

      return {
        totalContinents: Number(continentCount.count),
        totalRegions: Number(regionCount.count),
        totalCountries: Number(countryCount.count),
        totalGeocodedCompanies: Number(companyLocationCount.count),
        confidenceDistribution: confidenceDistribution.map(d => ({
          confidence: d.confidence || 'unknown',
          count: Number(d.count)
        }))
      };
    } catch (error) {
      console.error('Error getting geographic stats:', error);
      return {
        totalContinents: 0,
        totalRegions: 0,
        totalCountries: 0,
        totalGeocodedCompanies: 0,
        confidenceDistribution: []
      };
    }
  }

  async getRegionStats(regionId: number): Promise<{
    totalCountries: number;
    totalCompanies: number;
    topCountries: Array<{ countryName: string; companyCount: number }>;
  }> {
    try {
      const [countryCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(countries)
        .where(eq(countries.regionId, regionId));

      const topCountries = await db
        .select({
          countryName: countries.name,
          companyCount: sql<number>`count(DISTINCT company_id)`
        })
        .from(countries)
        .innerJoin(companyLocations, eq(countries.id, companyLocations.countryId))
        .where(eq(countries.regionId, regionId))
        .groupBy(countries.name)
        .orderBy(sql`count(DISTINCT company_id) DESC`)
        .limit(10);

      const totalCompanies = topCountries.reduce((sum, c) => sum + Number(c.companyCount), 0);

      return {
        totalCountries: Number(countryCount.count),
        totalCompanies,
        topCountries: topCountries.map(c => ({
          countryName: c.countryName,
          companyCount: Number(c.companyCount)
        }))
      };
    } catch (error) {
      console.error('Error getting region stats:', error);
      return {
        totalCountries: 0,
        totalCompanies: 0,
        topCountries: []
      };
    }
  }

  async getCountryStats(countryId: number): Promise<{
    totalCompanies: number;
    sectorBreakdown: Array<{ sectorName: string; count: number }>;
    industryBreakdown: Array<{ industryName: string; count: number }>;
  }> {
    try {
      const [totalCompanies] = await db
        .select({ count: sql<number>`count(DISTINCT company_id)` })
        .from(companyLocations)
        .where(eq(companyLocations.countryId, countryId));

      const sectorBreakdown = await db
        .select({
          sectorName: companies.sectorName,
          count: sql<number>`count(*)`
        })
        .from(companies)
        .innerJoin(companyLocations, eq(companies.id, companyLocations.companyId))
        .where(eq(companyLocations.countryId, countryId))
        .groupBy(companies.sectorName)
        .orderBy(sql`count(*) DESC`);

      const industryBreakdown = await db
        .select({
          industryName: companies.industryName,
          count: sql<number>`count(*)`
        })
        .from(companies)
        .innerJoin(companyLocations, eq(companies.id, companyLocations.companyId))
        .where(eq(companyLocations.countryId, countryId))
        .groupBy(companies.industryName)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      return {
        totalCompanies: Number(totalCompanies.count),
        sectorBreakdown: sectorBreakdown.map(s => ({
          sectorName: s.sectorName,
          count: Number(s.count)
        })),
        industryBreakdown: industryBreakdown.map(i => ({
          industryName: i.industryName,
          count: Number(i.count)
        }))
      };
    } catch (error) {
      console.error('Error getting country stats:', error);
      return {
        totalCompanies: 0,
        sectorBreakdown: [],
        industryBreakdown: []
      };
    }
  }

  async getContinentStats(continentId: number): Promise<{
    totalCountries: number;
    totalCompanies: number;
    topCountries: Array<{ countryName: string; companyCount: number }>;
  }> {
    try {
      const [countryCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(countries)
        .where(eq(countries.continentId, continentId));

      const topCountries = await db
        .select({
          countryName: countries.name,
          companyCount: sql<number>`count(*)`
        })
        .from(countries)
        .innerJoin(companyLocations, eq(countries.id, companyLocations.countryId))
        .where(eq(countries.continentId, continentId))
        .groupBy(countries.name)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      const totalCompanies = topCountries.reduce((sum, c) => sum + Number(c.companyCount), 0);

      return {
        totalCountries: Number(countryCount.count),
        totalCompanies,
        topCountries: topCountries.map(c => ({
          countryName: c.countryName,
          companyCount: Number(c.companyCount)
        }))
      };
    } catch (error) {
      console.error('Error getting continent stats:', error);
      return {
        totalCountries: 0,
        totalCompanies: 0,
        topCountries: []
      };
    }
  }

  async getTopCountriesByCompanyCount(limit: number): Promise<Array<Country & { companyCount: number }>> {
    try {
      const topCountriesData = await db
        .select({
          id: countries.id,
          name: countries.name,
          slug: countries.slug,
          iso2: countries.iso2,
          iso3: countries.iso3,
          phoneCode: countries.phoneCode,
          capital: countries.capital,
          currency: countries.currency,
          regionId: countries.regionId,
          continentId: countries.continentId,
          companyCount: sql<number>`count(*)`
        })
        .from(countries)
        .innerJoin(companyLocations, eq(countries.id, companyLocations.countryId))
        .groupBy(
          countries.id,
          countries.name,
          countries.slug,
          countries.iso2,
          countries.iso3,
          countries.phoneCode,
          countries.capital,
          countries.currency,
          countries.regionId,
          countries.continentId
        )
        .orderBy(sql`count(*) DESC`)
        .limit(limit);

      return topCountriesData.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        iso2: c.iso2,
        iso3: c.iso3,
        phoneCode: c.phoneCode,
        capital: c.capital,
        currency: c.currency,
        regionId: c.regionId,
        continentId: c.continentId,
        companyCount: Number(c.companyCount)
      }));
    } catch (error) {
      console.error('Error getting top countries by company count:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
