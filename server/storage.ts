import { csvParser } from './services/csvParser';
import type { Sector, Industry, Company } from '@shared/schema';

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
}

export class MemStorage implements IStorage {
  private sectors: Sector[] = [];
  private industries: Industry[] = [];
  private companies: Company[] = [];
  private initialized = false;

  private async initialize() {
    if (this.initialized) return;
    
    try {
      this.sectors = await csvParser.loadSectors();
      this.industries = await csvParser.loadIndustries();
      this.companies = await csvParser.loadCompanies();
      this.initialized = true;
      
      console.log(`Loaded ${this.sectors.length} sectors, ${this.industries.length} industries, ${this.companies.length} companies`);
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async getSectors(): Promise<Sector[]> {
    await this.initialize();
    return this.sectors;
  }

  async getIndustriesBySector(sectorName: string): Promise<Industry[]> {
    await this.initialize();
    return this.industries.filter(industry => 
      industry.sectorName.toLowerCase() === sectorName.toLowerCase()
    );
  }

  async getCompaniesByIndustry(industryName: string): Promise<Company[]> {
    await this.initialize();
    return this.companies.filter(company => 
      company.industryName.toLowerCase() === industryName.toLowerCase()
    );
  }

  async getAllIndustries(): Promise<Industry[]> {
    await this.initialize();
    return this.industries;
  }

  async getAllCompanies(): Promise<Company[]> {
    await this.initialize();
    return this.companies;
  }

  async searchAll(query: string): Promise<{
    sectors: Sector[];
    industries: Industry[];
    companies: Company[];
  }> {
    await this.initialize();
    const lowerQuery = query.toLowerCase();

    return {
      sectors: this.sectors.filter(sector =>
        sector.name.toLowerCase().includes(lowerQuery)
      ),
      industries: this.industries.filter(industry =>
        industry.name.toLowerCase().includes(lowerQuery) ||
        industry.sectorName.toLowerCase().includes(lowerQuery)
      ),
      companies: this.companies.filter(company =>
        company.name.toLowerCase().includes(lowerQuery) ||
        company.industryName.toLowerCase().includes(lowerQuery) ||
        company.sectorName.toLowerCase().includes(lowerQuery)
      )
    };
  }
}

export const storage = new MemStorage();
