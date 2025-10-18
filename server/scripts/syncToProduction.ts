/**
 * Production Database Sync Script
 * 
 * This script synchronizes the production database with the clean development data.
 * It performs a complete rebuild to ensure perfect parity.
 * 
 * Usage:
 *   1. Ensure clean_database_export.json exists in /tmp/
 *   2. Set ADMIN_SECRET environment variable
 *   3. Run this script to sync production database
 */

async function syncProductionDatabase() {
  const ADMIN_SECRET = process.env.ADMIN_SECRET || '9167_fix_geocoding_2025_secure_key_007';
  const PRODUCTION_URL = 'https://comcubes.com';
  const SYNC_DATA_PATH = '/tmp/clean_database_export.json';

  console.log('🔄 COMCUBES Production Database Sync');
  console.log('====================================');
  console.log(`Target: ${PRODUCTION_URL}`);
  console.log(`Data Source: ${SYNC_DATA_PATH}`);
  console.log('');

  // Step 1: Check current production state
  console.log('📊 Step 1: Checking current production state...');
  try {
    const statusResponse = await fetch(
      `${PRODUCTION_URL}/api/admin/sync-status?secret=${encodeURIComponent(ADMIN_SECRET)}`
    );
    
    if (!statusResponse.ok) {
      throw new Error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();
    console.log('Current production state:');
    console.log(JSON.stringify(statusData.stats, null, 2));
    console.log(`In sync: ${statusData.inSync ? '✅ YES' : '❌ NO'}`);
    console.log('');

    if (statusData.inSync) {
      console.log('✅ Production database is already in sync!');
      console.log('No synchronization needed.');
      return;
    }
  } catch (error) {
    console.error('❌ Failed to check production status:', error);
    console.log('Continuing with sync anyway...');
    console.log('');
  }

  // Step 2: Prepare sync data
  console.log('📦 Step 2: Preparing sync data...');
  const fs = await import('fs');
  
  if (!fs.existsSync(SYNC_DATA_PATH)) {
    console.error(`❌ Sync data file not found: ${SYNC_DATA_PATH}`);
    console.log('Please ensure clean_database_export.json exists in /tmp/');
    process.exit(1);
  }

  const syncData = JSON.parse(fs.readFileSync(SYNC_DATA_PATH, 'utf8'));
  console.log('Sync data loaded:');
  console.log(JSON.stringify(syncData.summary, null, 2));
  console.log('');

  // Step 3: Execute sync
  console.log('🚀 Step 3: Executing production database sync...');
  console.log('This may take several minutes. Please wait...');
  console.log('');

  try {
    const syncResponse = await fetch(
      `${PRODUCTION_URL}/api/admin/sync-database`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: ADMIN_SECRET,
          syncDataPath: SYNC_DATA_PATH,
        }),
      }
    );

    if (!syncResponse.ok) {
      throw new Error(`Sync request failed: ${syncResponse.status} ${syncResponse.statusText}`);
    }

    const syncResult = await syncResponse.json();
    
    console.log('====================================');
    console.log('SYNC RESULT');
    console.log('====================================');
    console.log(`Status: ${syncResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Message: ${syncResult.message}`);
    console.log(`Duration: ${syncResult.duration}`);
    console.log('');

    if (syncResult.preSync) {
      console.log('Pre-Sync State:');
      console.log(JSON.stringify(syncResult.preSync, null, 2));
      console.log('');
    }

    if (syncResult.postSync) {
      console.log('Post-Sync State:');
      console.log(JSON.stringify(syncResult.postSync, null, 2));
      console.log('');
    }

    if (syncResult.imported) {
      console.log('Imported Data:');
      console.log(JSON.stringify(syncResult.imported, null, 2));
      console.log('');
    }

    if (syncResult.errors && syncResult.errors.length > 0) {
      console.log('⚠️  Errors:');
      syncResult.errors.forEach((error: string) => console.log(`  - ${error}`));
      console.log('');
    }

    if (!syncResult.success) {
      console.error('❌ Sync failed!');
      process.exit(1);
    }

    console.log('✅ Production database synchronized successfully!');
    console.log('');

    // Step 4: Verify final state
    console.log('📊 Step 4: Verifying final state...');
    const verifyResponse = await fetch(
      `${PRODUCTION_URL}/api/admin/sync-status?secret=${encodeURIComponent(ADMIN_SECRET)}`
    );
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('Final production state:');
      console.log(JSON.stringify(verifyData.stats, null, 2));
      console.log(`In sync: ${verifyData.inSync ? '✅ YES' : '❌ NO'}`);
      
      if (!verifyData.inSync) {
        console.error('⚠️  Warning: Database may not be fully synced!');
        console.log('Expected:', verifyData.expectedStats);
        console.log('Actual:', verifyData.stats);
      }
    }

    console.log('');
    console.log('====================================');
    console.log('✅ SYNC COMPLETE');
    console.log('====================================');

  } catch (error) {
    console.error('❌ Sync execution failed:', error);
    process.exit(1);
  }
}

syncProductionDatabase().catch(console.error);
