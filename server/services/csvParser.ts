import fs from 'fs';
import path from 'path';
import type { Sector, Industry, Company } from '@shared/schema';

export class CSVParser {
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  async loadSectors(): Promise<Sector[]> {
    try {
      const filePath = path.resolve(process.cwd(), 'data/SECTOR_1750802785300.csv');
      console.log('Loading sectors from:', filePath);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const sectors: Sector[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const sectorName = lines[i].trim().replace(/"/g, '');
        if (sectorName && sectorName !== '') {
          sectors.push({
            id: i,
            name: sectorName
          });
        }
      }
      
      console.log(`Loaded ${sectors.length} sectors from CSV`);
      return sectors;
    } catch (error) {
      console.error('Error loading sectors:', error);
      return [];
    }
  }

  async loadIndustries(): Promise<Industry[]> {
    try {
      const filePath = path.resolve(process.cwd(), 'data/INDUSTRY_1750802785299.csv');
      console.log('Loading industries from:', filePath);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const industries: Industry[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const columns = this.parseCSVLine(lines[i]);
        if (columns.length >= 2 && columns[0] && columns[1]) {
          industries.push({
            id: i,
            name: columns[0].trim().replace(/"/g, ''),
            sectorName: columns[1].trim().replace(/"/g, '')
          });
        }
      }
      
      console.log(`Loaded ${industries.length} industries from CSV`);
      return industries;
    } catch (error) {
      console.error('Error loading industries:', error);
      return [];
    }
  }

  async loadCompanies(): Promise<Company[]> {
    try {
      const filePath = path.resolve(process.cwd(), 'data/COMPANY_1750803462655.csv');
      console.log('Loading companies from:', filePath);
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const companies: Company[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const columns = this.parseCSVLine(lines[i]);
        if (columns.length >= 4 && columns[0] && columns[2] && columns[3]) {
          companies.push({
            id: i,
            name: columns[0].trim().replace(/"/g, ''),
            websiteUrl: columns[1] && columns[1].trim() !== '' ? columns[1].trim().replace(/"/g, '') : null,
            industryName: columns[2].trim().replace(/"/g, ''),
            sectorName: columns[3].trim().replace(/"/g, '')
          });
        }
      }
      
      console.log(`Loaded ${companies.length} companies from CSV`);
      return companies;
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  }
}

export const csvParser = new CSVParser();
