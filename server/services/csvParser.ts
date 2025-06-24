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
      const filePath = path.resolve(import.meta.dirname, '../../attached_assets/SECTOR_1750802785300.csv');
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const sectors: Sector[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const sectorName = lines[i].trim();
        if (sectorName && sectorName !== '') {
          sectors.push({
            id: i,
            name: sectorName
          });
        }
      }
      
      return sectors;
    } catch (error) {
      console.error('Error loading sectors:', error);
      return [];
    }
  }

  async loadIndustries(): Promise<Industry[]> {
    try {
      const filePath = path.resolve(import.meta.dirname, '../../attached_assets/INDUSTRY_1750802785299.csv');
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const industries: Industry[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const columns = this.parseCSVLine(lines[i]);
        if (columns.length >= 2 && columns[0] && columns[1]) {
          industries.push({
            id: i,
            name: columns[0].trim(),
            sectorName: columns[1].trim()
          });
        }
      }
      
      return industries;
    } catch (error) {
      console.error('Error loading industries:', error);
      return [];
    }
  }

  async loadCompanies(): Promise<Company[]> {
    try {
      const filePath = path.resolve(import.meta.dirname, '../../attached_assets/COMPANY_1750803462655.csv');
      const content = await fs.promises.readFile(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const companies: Company[] = [];
      for (let i = 1; i < lines.length; i++) { // Skip header
        const columns = this.parseCSVLine(lines[i]);
        if (columns.length >= 4 && columns[0] && columns[2] && columns[3]) {
          companies.push({
            id: i,
            name: columns[0].trim(),
            websiteUrl: columns[1] ? columns[1].trim() : null,
            industryName: columns[2].trim(),
            sectorName: columns[3].trim()
          });
        }
      }
      
      return companies;
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  }
}

export const csvParser = new CSVParser();
