import { csvParser } from './services/csvParser';
import { db } from './db';
import { sectors, industries, companies, type Sector, type Industry, type Company, type InsertSector, type InsertIndustry, type InsertCompany } from '@shared/schema';
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
      // Order by ID to show companies with logos first (they have lower IDs)
      return await db.select().from(companies).orderBy(companies.id);
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
}

export const storage = new DatabaseStorage();
