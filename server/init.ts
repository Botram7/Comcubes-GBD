import { db } from './db';
import { sectors, industries, companies, bannerAds, appInitMeta } from '@shared/schema';
import { csvParser } from './services/csvParser';
import { eq } from 'drizzle-orm';

/**
 * One-time database initialization bootstrap function
 * Uses durable flags in appInitMeta table to ensure initialization runs only once
 * across all instances and server restarts.
 */
export async function initDatabaseOnce(): Promise<void> {
  console.log('🚀 Starting database bootstrap initialization...');
  
  try {
    // First, ensure the appInitMeta table exists by running a simple query
    await db.select().from(appInitMeta).limit(1);
    console.log('✅ appInitMeta table is available');
  } catch (error) {
    console.log('⚠️ appInitMeta table not yet created, will be created by Drizzle push');
    // If table doesn't exist yet, we'll proceed anyway - Drizzle will handle the schema sync
  }

  // Check if core data initialization is already completed
  try {
    const coreDataFlag = await db
      .select()
      .from(appInitMeta)
      .where(eq(appInitMeta.key, 'core_data_seeded'))
      .limit(1);

    if (coreDataFlag.length === 0) {
      console.log('🌱 Core data not seeded, proceeding with core data initialization...');
      await seedCoreData();
      
      // Mark core data as seeded
      await db.insert(appInitMeta).values({
        key: 'core_data_seeded',
        value: 'true'
      });
      console.log('✅ Core data seeding completed and marked as done');
    } else {
      console.log('✅ Core data already seeded, skipping');
    }
  } catch (error) {
    console.error('❌ Error checking core data flag:', error);
    // If we can't check the flag, proceed with seeding to be safe
    await seedCoreData();
  }

  // Check if banner ads initialization is already completed
  try {
    const bannerFlag = await db
      .select()
      .from(appInitMeta)
      .where(eq(appInitMeta.key, 'banners_seeded_v1'))
      .limit(1);

    if (bannerFlag.length === 0) {
      console.log('🎯 Banner ads not seeded, proceeding with banner ads initialization...');
      await seedBannerAds();
      
      // Mark banner ads as seeded
      await db.insert(appInitMeta).values({
        key: 'banners_seeded_v1',
        value: 'true'
      });
      console.log('✅ Banner ads seeding completed and marked as done');
    } else {
      console.log('✅ Banner ads already seeded, skipping');
    }
  } catch (error) {
    console.error('❌ Error checking banner ads flag:', error);
    // If we can't check the flag, proceed with seeding to be safe
    await seedBannerAds();
  }

  console.log('🎉 Database bootstrap initialization completed successfully!');
}

/**
 * Seeds core business data (sectors, industries, companies) from CSV files
 */
async function seedCoreData(): Promise<void> {
  console.log('📊 Loading core data from CSV files...');
  
  // Check if data already exists to avoid duplicates
  const existingSectors = await db.select().from(sectors).limit(1);
  if (existingSectors.length > 0) {
    console.log('✅ Core data already exists in database, skipping CSV load');
    return;
  }

  // Load data from CSV files
  const csvSectors = await csvParser.loadSectors();
  const csvIndustries = await csvParser.loadIndustries();
  const csvCompanies = await csvParser.loadCompanies();

  console.log(`📈 Loaded ${csvSectors.length} sectors, ${csvIndustries.length} industries, ${csvCompanies.length} companies from CSV`);

  // Insert sectors
  if (csvSectors.length > 0) {
    await db.insert(sectors).values(
      csvSectors.map(sector => ({
        name: sector.name
      }))
    );
    console.log(`✅ Inserted ${csvSectors.length} sectors`);
  }

  // Insert industries
  if (csvIndustries.length > 0) {
    await db.insert(industries).values(
      csvIndustries.map(industry => ({
        name: industry.name,
        sectorName: industry.sectorName
      }))
    );
    console.log(`✅ Inserted ${csvIndustries.length} industries`);
  }

  // Insert companies
  if (csvCompanies.length > 0) {
    await db.insert(companies).values(
      csvCompanies.map(company => ({
        name: company.name,
        websiteUrl: company.websiteUrl,
        industryName: company.industryName,
        sectorName: company.sectorName
      }))
    );
    console.log(`✅ Inserted ${csvCompanies.length} companies`);
  }

  console.log('🎯 Core data seeding completed successfully!');
}

/**
 * Seeds default banner ads if none exist
 */
async function seedBannerAds(): Promise<void> {
  console.log('🎨 Initializing banner ads...');

  // Check if banner ads already exist
  const existingBanners = await db.select().from(bannerAds).limit(1);
  if (existingBanners.length > 0) {
    console.log('✅ Banner ads already exist, skipping initialization');
    return;
  }

  // Create default banner ads
  const defaultBanners = [
    {
      title: 'Welcome to COMCUBES',
      position: 'left' as const,
      images: [
        '/server/banner-images/banner-1756772583342-9ixfpj72x7t.jpg',
        '/server/banner-images/banner-1756772869185-e7zf3gbm5oh.jpg'
      ],
      imageUrls: [
        '/server/banner-images/banner-1756772583342-9ixfpj72x7t.jpg',
        '/server/banner-images/banner-1756772869185-e7zf3gbm5oh.jpg'
      ],
      clickUrl: 'https://comcubes.com',
      rotationInterval: 7000,
      isActive: true
    },
    {
      title: 'Discover Global Business',
      position: 'right' as const,
      images: [
        '/server/banner-images/banner-1756772896318-fdn74xfwtbp.jpg',
        '/server/banner-images/banner-1756772918354-nhg6ydt1x5.jpg'
      ],
      imageUrls: [
        '/server/banner-images/banner-1756772896318-fdn74xfwtbp.jpg',
        '/server/banner-images/banner-1756772918354-nhg6ydt1x5.jpg'
      ],
      clickUrl: 'https://comcubes.com',
      rotationInterval: 7000,
      isActive: true
    }
  ];

  await db.insert(bannerAds).values(defaultBanners);
  console.log(`✅ Inserted ${defaultBanners.length} default banner ads`);
  console.log('🎨 Banner ads initialization completed successfully!');
}