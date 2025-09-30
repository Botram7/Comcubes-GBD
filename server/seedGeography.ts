import { db } from './db';
import { continents, regions, countries } from '../shared/schema';
import { continentsData, regionsData, countriesData } from './data/geographicData';
import { eq } from 'drizzle-orm';

export async function seedGeographicData() {
  try {
    console.log('🌍 Starting geographic data seed...');

    // Check if already seeded
    const existingContinents = await db.select().from(continents).limit(1);
    if (existingContinents.length > 0) {
      console.log('✅ Geographic data already seeded, skipping...');
      return;
    }

    // Seed continents
    console.log('📊 Seeding continents...');
    const insertedContinents = await db.insert(continents).values(continentsData).returning();
    console.log(`✅ Inserted ${insertedContinents.length} continents`);

    // Create continent lookup map
    const continentMap = new Map(
      insertedContinents.map(c => [c.code, c.id])
    );

    // Seed regions
    console.log('📊 Seeding regions...');
    const regionsToInsert = regionsData.map(region => ({
      ...region,
      continentId: continentMap.get(region.continentCode)!
    }));
    const insertedRegions = await db.insert(regions).values(regionsToInsert).returning();
    console.log(`✅ Inserted ${insertedRegions.length} regions`);

    // Create region lookup map
    const regionMap = new Map(
      insertedRegions.map(r => [r.slug, r.id])
    );

    // Seed countries
    console.log('📊 Seeding countries...');
    const countriesToInsert = countriesData.map(country => {
      const region = insertedRegions.find(r => r.slug === country.regionSlug);
      if (!region) {
        throw new Error(`Region not found for country: ${country.name}`);
      }
      return {
        name: country.name,
        slug: country.slug,
        iso2: country.iso2,
        iso3: country.iso3,
        phoneCode: country.phoneCode || '',
        capital: country.capital || '',
        currency: country.currency || '',
        regionId: region.id,
        continentId: region.continentId,
        flagEmoji: country.flagEmoji || ''
      };
    });
    
    const insertedCountries = await db.insert(countries).values(countriesToInsert).returning();
    console.log(`✅ Inserted ${insertedCountries.length} countries`);

    console.log('🎉 Geographic data seed completed successfully!');
    console.log(`   - Continents: ${insertedContinents.length}`);
    console.log(`   - Regions: ${insertedRegions.length}`);
    console.log(`   - Countries: ${insertedCountries.length}`);
    
    return {
      continents: insertedContinents.length,
      regions: insertedRegions.length,
      countries: insertedCountries.length
    };
  } catch (error) {
    console.error('❌ Error seeding geographic data:', error);
    throw error;
  }
}
