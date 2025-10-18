import { neon } from '@neondatabase/serverless';

interface SyncData {
  exportedAt: string;
  source: string;
  tables: {
    continents: any[];
    regions: any[];
    countries: any[];
    sectors: any[];
    industries: any[];
    companies: any[];
  };
  summary: {
    continents: number;
    regions: number;
    countries: number;
    sectors: number;
    industries: number;
    companies: number;
  };
}

interface SyncResult {
  success: boolean;
  message: string;
  preSync?: {
    continents: number;
    regions: number;
    countries: number;
    sectors: number;
    industries: number;
    companies: number;
  };
  postSync?: {
    continents: number;
    regions: number;
    countries: number;
    sectors: number;
    industries: number;
    companies: number;
  };
  imported?: {
    continents: number;
    regions: number;
    countries: number;
    sectors: number;
    industries: number;
    companies: number;
  };
  duration?: string;
  errors?: string[];
}

export class DatabaseSyncService {
  private sql: ReturnType<typeof neon>;

  constructor(databaseUrl: string) {
    this.sql = neon(databaseUrl);
  }

  /**
   * Public method to get database statistics
   */
  async getStats() {
    return this.getDatabaseStats();
  }

  /**
   * Get current database statistics
   */
  private async getDatabaseStats() {
    const continentsResult = await this.sql`SELECT COUNT(*)::int as count FROM continents`;
    const regionsResult = await this.sql`SELECT COUNT(*)::int as count FROM regions`;
    const countriesResult = await this.sql`SELECT COUNT(*)::int as count FROM countries`;
    const sectorsResult = await this.sql`SELECT COUNT(*)::int as count FROM sectors`;
    const industriesResult = await this.sql`SELECT COUNT(*)::int as count FROM industries`;
    const companiesResult = await this.sql`SELECT COUNT(*)::int as count FROM companies`;

    return {
      continents: (continentsResult[0] as any).count,
      regions: (regionsResult[0] as any).count,
      countries: (countriesResult[0] as any).count,
      sectors: (sectorsResult[0] as any).count,
      industries: (industriesResult[0] as any).count,
      companies: (companiesResult[0] as any).count,
    };
  }

  /**
   * Validate sync data before proceeding
   */
  private validateSyncData(data: SyncData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required tables exist
    const requiredTables = ['continents', 'regions', 'countries', 'sectors', 'industries', 'companies'];
    for (const table of requiredTables) {
      if (!data.tables[table as keyof typeof data.tables]) {
        errors.push(`Missing required table: ${table}`);
      }
    }

    // Validate data completeness
    if (data.tables.continents.length !== 7) {
      errors.push(`Expected 7 continents, got ${data.tables.continents.length}`);
    }
    if (data.tables.regions.length !== 22) {
      errors.push(`Expected 22 regions, got ${data.tables.regions.length}`);
    }
    if (data.tables.countries.length !== 200) {
      errors.push(`Expected 200 countries, got ${data.tables.countries.length}`);
    }
    if (data.tables.sectors.length !== 20) {
      errors.push(`Expected 20 sectors, got ${data.tables.sectors.length}`);
    }
    if (data.tables.companies.length !== 7487) {
      errors.push(`Expected 7487 companies, got ${data.tables.companies.length}`);
    }

    // Validate referential integrity
    const regionContinents = new Set(data.tables.regions.map(r => r.continent_id));
    const validContinents = new Set(data.tables.continents.map(c => c.id));
    Array.from(regionContinents).forEach(continentId => {
      if (!validContinents.has(continentId)) {
        errors.push(`Region references invalid continent_id: ${continentId}`);
      }
    });

    const countryRegions = new Set(data.tables.countries.map(c => c.region_id));
    const validRegions = new Set(data.tables.regions.map(r => r.id));
    Array.from(countryRegions).forEach(regionId => {
      if (!validRegions.has(regionId)) {
        errors.push(`Country references invalid region_id: ${regionId}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Perform complete database synchronization
   * This will:
   * 1. Validate source data
   * 2. Take pre-sync snapshot
   * 3. Purge all existing data (in transaction)
   * 4. Import clean data (in transaction)
   * 5. Verify post-sync state
   */
  async synchronizeDatabase(data: SyncData): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      console.log('🔍 Step 1: Validating sync data...');
      const validation = this.validateSyncData(data);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Sync data validation failed',
          errors: validation.errors,
        };
      }
      console.log('✅ Validation passed');

      console.log('📊 Step 2: Taking pre-sync snapshot...');
      const preSync = await this.getDatabaseStats();
      console.log('Pre-sync stats:', preSync);

      console.log('🗑️  Step 3: Purging existing data...');
      await this.sql`BEGIN`;
      
      try {
        // Delete in reverse dependency order
        await this.sql`DELETE FROM companies`;
        await this.sql`DELETE FROM industries`;
        await this.sql`DELETE FROM sectors`;
        await this.sql`DELETE FROM countries`;
        await this.sql`DELETE FROM regions`;
        await this.sql`DELETE FROM continents`;
        
        console.log('✅ Purge complete');

        console.log('📥 Step 4: Importing clean data...');
        
        // Import continents
        for (const continent of data.tables.continents) {
          await this.sql`
            INSERT INTO continents (id, name, code, description)
            VALUES (${continent.id}, ${continent.name}, ${continent.code}, ${continent.description})
          `;
        }
        console.log(`  ✓ Imported ${data.tables.continents.length} continents`);

        // Import regions
        for (const region of data.tables.regions) {
          await this.sql`
            INSERT INTO regions (id, name, continent_id, description)
            VALUES (${region.id}, ${region.name}, ${region.continent_id}, ${region.description})
          `;
        }
        console.log(`  ✓ Imported ${data.tables.regions.length} regions`);

        // Import countries
        for (const country of data.tables.countries) {
          await this.sql`
            INSERT INTO countries (id, name, code, region_id, continent_id)
            VALUES (${country.id}, ${country.name}, ${country.code}, ${country.region_id}, ${country.continent_id})
          `;
        }
        console.log(`  ✓ Imported ${data.tables.countries.length} countries`);

        // Import sectors
        for (const sector of data.tables.sectors) {
          await this.sql`
            INSERT INTO sectors (id, name, description, image_url)
            VALUES (${sector.id}, ${sector.name}, ${sector.description}, ${sector.image_url})
          `;
        }
        console.log(`  ✓ Imported ${data.tables.sectors.length} sectors`);

        // Import industries
        for (const industry of data.tables.industries) {
          await this.sql`
            INSERT INTO industries (id, name, sector_name, description, image_url)
            VALUES (${industry.id}, ${industry.name}, ${industry.sector_name}, ${industry.description}, ${industry.image_url})
          `;
        }
        console.log(`  ✓ Imported ${data.tables.industries.length} industries`);

        // Import companies in batches for better performance
        const batchSize = 100;
        for (let i = 0; i < data.tables.companies.length; i += batchSize) {
          const batch = data.tables.companies.slice(i, i + batchSize);
          
          for (const company of batch) {
            await this.sql`
              INSERT INTO companies (
                id, name, sector_name, industry_name, description, website,
                headquarters, country_name, employee_count, revenue_estimate,
                founded_year, company_size, specialization_tags, verification_status,
                old_geocoding_country, old_geocoding_confidence, old_geocoding_source
              ) VALUES (
                ${company.id}, ${company.name}, ${company.sector_name}, ${company.industry_name},
                ${company.description}, ${company.website}, ${company.headquarters},
                ${company.country_name}, ${company.employee_count}, ${company.revenue_estimate},
                ${company.founded_year}, ${company.company_size}, ${company.specialization_tags},
                ${company.verification_status}, ${company.old_geocoding_country},
                ${company.old_geocoding_confidence}, ${company.old_geocoding_source}
              )
            `;
          }
          
          if ((i + batchSize) % 1000 === 0 || i + batchSize >= data.tables.companies.length) {
            console.log(`  ✓ Imported ${Math.min(i + batchSize, data.tables.companies.length)}/${data.tables.companies.length} companies`);
          }
        }

        await this.sql`COMMIT`;
        console.log('✅ Transaction committed successfully');

      } catch (error) {
        await this.sql`ROLLBACK`;
        console.error('❌ Transaction rolled back due to error');
        throw error;
      }

      console.log('📊 Step 5: Verifying post-sync state...');
      const postSync = await this.getDatabaseStats();
      console.log('Post-sync stats:', postSync);

      // Verify counts match expected
      const importedCounts = {
        continents: data.tables.continents.length,
        regions: data.tables.regions.length,
        countries: data.tables.countries.length,
        sectors: data.tables.sectors.length,
        industries: data.tables.industries.length,
        companies: data.tables.companies.length,
      };

      if (JSON.stringify(postSync) !== JSON.stringify(importedCounts)) {
        errors.push('Post-sync verification failed: counts do not match');
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      if (errors.length > 0) {
        return {
          success: false,
          message: 'Sync completed with errors',
          preSync,
          postSync,
          imported: importedCounts,
          duration: `${duration}s`,
          errors,
        };
      }

      return {
        success: true,
        message: 'Database synchronized successfully',
        preSync,
        postSync,
        imported: importedCounts,
        duration: `${duration}s`,
      };

    } catch (error) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      return {
        success: false,
        message: 'Sync failed with exception',
        duration: `${duration}s`,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }
}
