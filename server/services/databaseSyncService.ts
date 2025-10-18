import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure Neon for WebSocket mode (required for transactions)
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

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
  private pool: Pool;

  constructor(databaseUrl: string) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
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
    const client = await this.pool.connect();
    try {
      const continentsResult = await client.query('SELECT COUNT(*)::int as count FROM continents');
      const regionsResult = await client.query('SELECT COUNT(*)::int as count FROM regions');
      const countriesResult = await client.query('SELECT COUNT(*)::int as count FROM countries');
      const sectorsResult = await client.query('SELECT COUNT(*)::int as count FROM sectors');
      const industriesResult = await client.query('SELECT COUNT(*)::int as count FROM industries');
      const companiesResult = await client.query('SELECT COUNT(*)::int as count FROM companies');

      return {
        continents: continentsResult.rows[0].count,
        regions: regionsResult.rows[0].count,
        countries: countriesResult.rows[0].count,
        sectors: sectorsResult.rows[0].count,
        industries: industriesResult.rows[0].count,
        companies: companiesResult.rows[0].count,
      };
    } finally {
      client.release();
    }
  }

  /**
   * Cleanup pool connections
   */
  async close() {
    await this.pool.end();
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
    if (data.tables.industries.length !== 398) {
      errors.push(`Expected 398 industries, got ${data.tables.industries.length}`);
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
   * Perform complete database synchronization using proper Pool/Client transactions
   * This ensures ACID guarantees - all changes commit or roll back as one unit
   */
  async synchronizeDatabase(data: SyncData): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const client = await this.pool.connect();

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

      console.log('🗑️  Step 3: Starting transaction...');
      await client.query('BEGIN');
      
      try {
        // Delete in reverse dependency order
        console.log('  Deleting companies...');
        await client.query('DELETE FROM companies');
        console.log('  Deleting industries...');
        await client.query('DELETE FROM industries');
        console.log('  Deleting sectors...');
        await client.query('DELETE FROM sectors');
        console.log('  Deleting countries...');
        await client.query('DELETE FROM countries');
        console.log('  Deleting regions...');
        await client.query('DELETE FROM regions');
        console.log('  Deleting continents...');
        await client.query('DELETE FROM continents');
        
        console.log('✅ Purge complete');

        console.log('📥 Step 4: Importing clean data...');
        
        // Import continents
        for (const continent of data.tables.continents) {
          await client.query(
            'INSERT INTO continents (id, name, code, description) VALUES ($1, $2, $3, $4)',
            [continent.id, continent.name, continent.code, continent.description]
          );
        }
        console.log(`  ✓ Imported ${data.tables.continents.length} continents`);

        // Import regions
        for (const region of data.tables.regions) {
          await client.query(
            'INSERT INTO regions (id, name, continent_id, description) VALUES ($1, $2, $3, $4)',
            [region.id, region.name, region.continent_id, region.description]
          );
        }
        console.log(`  ✓ Imported ${data.tables.regions.length} regions`);

        // Import countries
        for (const country of data.tables.countries) {
          await client.query(
            'INSERT INTO countries (id, name, code, region_id, continent_id) VALUES ($1, $2, $3, $4, $5)',
            [country.id, country.name, country.code, country.region_id, country.continent_id]
          );
        }
        console.log(`  ✓ Imported ${data.tables.countries.length} countries`);

        // Import sectors
        for (const sector of data.tables.sectors) {
          await client.query(
            'INSERT INTO sectors (id, name, description, image_url) VALUES ($1, $2, $3, $4)',
            [sector.id, sector.name, sector.description, sector.image_url]
          );
        }
        console.log(`  ✓ Imported ${data.tables.sectors.length} sectors`);

        // Import industries
        for (const industry of data.tables.industries) {
          await client.query(
            'INSERT INTO industries (id, name, sector_name, description, image_url) VALUES ($1, $2, $3, $4, $5)',
            [industry.id, industry.name, industry.sector_name, industry.description, industry.image_url]
          );
        }
        console.log(`  ✓ Imported ${data.tables.industries.length} industries`);

        // Import companies in batches
        console.log(`  Importing ${data.tables.companies.length} companies...`);
        for (let i = 0; i < data.tables.companies.length; i++) {
          const company = data.tables.companies[i];
          await client.query(
            `INSERT INTO companies (
              id, name, sector_name, industry_name, description, website,
              headquarters, country_name, employee_count, revenue_estimate,
              founded_year, company_size, specialization_tags, verification_status,
              old_geocoding_country, old_geocoding_confidence, old_geocoding_source
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
            [
              company.id, company.name, company.sector_name, company.industry_name,
              company.description, company.website, company.headquarters,
              company.country_name, company.employee_count, company.revenue_estimate,
              company.founded_year, company.company_size, company.specialization_tags,
              company.verification_status, company.old_geocoding_country,
              company.old_geocoding_confidence, company.old_geocoding_source
            ]
          );
          
          if ((i + 1) % 1000 === 0 || i + 1 === data.tables.companies.length) {
            console.log(`  ✓ Imported ${i + 1}/${data.tables.companies.length} companies`);
          }
        }

        await client.query('COMMIT');
        console.log('✅ Transaction committed successfully');

      } catch (error) {
        await client.query('ROLLBACK');
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
    } finally {
      client.release();
    }
  }
}
