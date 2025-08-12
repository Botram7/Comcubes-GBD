import { csvParser } from './services/csvParser';
import { db } from './db';
import { sectors, industries, companies, contactMessages, companyListings, industryWaitlist, type Sector, type Industry, type Company, type ContactMessage, type CompanyListing, type IndustryWaitlist, type InsertSector, type InsertIndustry, type InsertCompany, type InsertContactMessage, type InsertCompanyListing, type InsertIndustryWaitlist } from '@shared/schema';
import { eq, ilike, or } from 'drizzle-orm';
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
        
        console.log(`Database initialized successfully with ${csvSectors.length} sectors, ${csvIndustries.length} industries, ${csvCompanies.length} companies`);
      } else {
        console.log('Database already contains data, skipping initialization');
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

      return {
        totalCompanies: totalCompanies.length,
        pendingListings: pendingListings.length,
        totalWaitlistEntries: allWaitlist.length,
        industriesAtCapacity: industriesAtCapacity,
        recentSubmissions,
        completedPayments: completedPayments.length
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      return {
        totalCompanies: 0,
        pendingListings: 0,
        totalWaitlistEntries: 0,
        industriesAtCapacity: 0,
        recentSubmissions: 0,
        completedPayments: 0
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
}

export const storage = new DatabaseStorage();
