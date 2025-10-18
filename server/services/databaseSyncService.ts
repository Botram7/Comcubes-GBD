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
   * Insert records in batches for performance
   */
  private async batchInsert(
    client: any,
    tableName: string,
    columns: string[],
    records: any[],
    batchSize: number = 300
  ): Promise<void> {
    const totalBatches = Math.ceil(records.length / batchSize);
    
    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIdx = batchIndex * batchSize;
      const endIdx = Math.min(startIdx + batchSize, records.length);
      const batch = records.slice(startIdx, endIdx);
      
      // Build multi-row VALUES clause
      const valuesClauses: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      for (const record of batch) {
        const placeholders = columns.map(() => `$${paramIndex++}`).join(', ');
        valuesClauses.push(`(${placeholders})`);
        
        for (const col of columns) {
          params.push(record[col]);
        }
      }
      
      const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${valuesClauses.join(', ')}`;
      await client.query(sql, params);
      
      console.log(`  ✓ Batch ${batchIndex + 1}/${totalBatches} (${batch.length} rows)`);
    }
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

        console.log('📥 Step 4: Importing clean data with batch inserts...');
        
        // Import continents (7 rows - small, single batch)
        console.log(`  Importing ${data.tables.continents.length} continents...`);
        await this.batchInsert(
          client,
          'continents',
          ['id', 'name', 'code', 'description'],
          data.tables.continents,
          100
        );
        console.log(`  ✓ Imported ${data.tables.continents.length} continents`);

        // Import regions (22 rows - small, single batch)
        console.log(`  Importing ${data.tables.regions.length} regions...`);
        await this.batchInsert(
          client,
          'regions',
          ['id', 'name', 'continent_id', 'description'],
          data.tables.regions,
          100
        );
        console.log(`  ✓ Imported ${data.tables.regions.length} regions`);

        // Import countries (200 rows - batched)
        console.log(`  Importing ${data.tables.countries.length} countries...`);
        await this.batchInsert(
          client,
          'countries',
          ['id', 'name', 'code', 'region_id', 'continent_id'],
          data.tables.countries,
          100
        );
        console.log(`  ✓ Imported ${data.tables.countries.length} countries`);

        // Import sectors (20 rows - small, single batch)
        console.log(`  Importing ${data.tables.sectors.length} sectors...`);
        await this.batchInsert(
          client,
          'sectors',
          ['id', 'name', 'description', 'image_url'],
          data.tables.sectors,
          100
        );
        console.log(`  ✓ Imported ${data.tables.sectors.length} sectors`);

        // Import industries (398 rows - batched)
        console.log(`  Importing ${data.tables.industries.length} industries...`);
        await this.batchInsert(
          client,
          'industries',
          ['id', 'name', 'sector_name', 'description', 'image_url'],
          data.tables.industries,
          200
        );
        console.log(`  ✓ Imported ${data.tables.industries.length} industries`);

        // Import companies (7,487 rows - LARGE, batched in chunks of 300)
        console.log(`  Importing ${data.tables.companies.length} companies in batches...`);
        await this.batchInsert(
          client,
          'companies',
          [
            'id', 'name', 'sector_name', 'industry_name', 'description', 'website',
            'headquarters', 'country_name', 'employee_count', 'revenue_estimate',
            'founded_year', 'company_size', 'specialization_tags', 'verification_status',
            'old_geocoding_country', 'old_geocoding_confidence', 'old_geocoding_source'
          ],
          data.tables.companies,
          300 // Batch size optimized for 17 columns
        );
        console.log(`  ✓ Imported ${data.tables.companies.length} companies`);

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
