import type { Express } from 'express';
import { DatabaseSyncService } from '../services/databaseSyncService';
import fs from 'fs';
import path from 'path';

export function registerDatabaseSyncRoute(app: Express) {
  const ADMIN_SECRET = process.env.ADMIN_SECRET;
  
  if (!ADMIN_SECRET) {
    console.error('⚠️  WARNING: ADMIN_SECRET environment variable is not set!');
    console.error('   Database sync endpoints will not be available.');
    console.error('   Set ADMIN_SECRET to enable admin functions.');
    return; // Skip registering endpoints if secret not set
  }

  app.post('/api/admin/sync-database', async (req, res) => {
    try {
      const { secret, syncData: providedSyncData, syncDataPath } = req.body;

      if (secret !== ADMIN_SECRET) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Invalid admin secret',
        });
      }

      console.log('🔄 Database Sync Request Received');
      console.log('====================================');

      let syncData;

      // Option 1: Sync data provided directly in request body
      if (providedSyncData) {
        console.log('📦 Using sync data from request body');
        syncData = providedSyncData;
      }
      // Option 2: Load from file path
      else if (syncDataPath) {
        const dataPath = syncDataPath;
        
        if (!fs.existsSync(dataPath)) {
          return res.status(400).json({
            success: false,
            message: `Sync data file not found: ${dataPath}`,
          });
        }

        console.log(`📂 Loading sync data from: ${dataPath}`);
        syncData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      }
      // Option 3: Use default file location
      else {
        const defaultPath = path.join(__dirname, '..', 'data', 'clean_database_export.json');
        
        if (!fs.existsSync(defaultPath)) {
          return res.status(400).json({
            success: false,
            message: `No sync data provided. Clean data file not found at: ${defaultPath}`,
          });
        }

        console.log(`📂 Loading sync data from default location: ${defaultPath}`);
        syncData = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
      }

      console.log(`📊 Sync data summary:`);
      console.log(JSON.stringify(syncData.summary, null, 2));

      // Initialize sync service
      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        return res.status(500).json({
          success: false,
          message: 'DATABASE_URL environment variable not set',
        });
      }

      const syncService = new DatabaseSyncService(databaseUrl);

      try {
        console.log('🚀 Starting database synchronization...');
        const result = await syncService.synchronizeDatabase(syncData);

        console.log('====================================');
        if (result.success) {
          console.log('✅ SYNC COMPLETE');
        } else {
          console.log('❌ SYNC FAILED');
        }
        console.log('====================================');

        return res.json(result);
      } finally {
        await syncService.close();
      }

    } catch (error) {
      console.error('❌ Sync endpoint error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  });

  app.get('/api/admin/sync-status', async (req, res) => {
    try {
      const { secret } = req.query;

      if (secret !== ADMIN_SECRET) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized: Invalid admin secret',
        });
      }

      const databaseUrl = process.env.DATABASE_URL;
      if (!databaseUrl) {
        return res.status(500).json({
          success: false,
          message: 'DATABASE_URL environment variable not set',
        });
      }

      const syncService = new DatabaseSyncService(databaseUrl);

      try {
        const stats = await syncService.getStats();

        return res.json({
          success: true,
          message: 'Current database statistics',
          stats,
          expectedStats: {
            continents: 7,
            regions: 22,
            countries: 200,
            sectors: 20,
            industries: 398,
            companies: 7487,
          },
          inSync: 
            stats.continents === 7 &&
            stats.regions === 22 &&
            stats.countries === 200 &&
            stats.sectors === 20 &&
            stats.industries === 398 &&
            stats.companies === 7487,
        });
      } finally {
        await syncService.close();
      }

    } catch (error) {
      console.error('Status check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve database statistics',
        errors: [error instanceof Error ? error.message : String(error)],
      });
    }
  });
}
