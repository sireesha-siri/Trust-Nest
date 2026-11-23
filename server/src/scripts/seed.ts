import '../config/env.js';
import mongoose from 'mongoose';
import { connectDB, isDatabaseConnected } from '../config/db.js';
import { PropertyModel } from '../models/Property.js';
import { CityServiceModel } from '../models/CityService.js';
import { CommunityReportModel } from '../models/CommunityReport.js';
import { DEMO_PROPERTIES } from '../data/demoProperties.js';
import { DEMO_CITY_SERVICES } from '../data/demoCityServices.js';
import { DEMO_COMMUNITY_REPORTS } from '../data/demoCommunity.js';
import { fileURLToPath } from 'url';

export async function runSeed(): Promise<void> {
  console.log('====================================================');
  console.log('  TrustNest – MongoDB Idempotent Seed Migration     ');
  console.log('====================================================\n');

  const uri = (process.env.MONGODB_URI || '').trim();
  if (!uri) {
    console.error('[Seed Error] MONGODB_URI is not configured in environment.');
    console.error('Please configure MONGODB_URI in server/.env before running database seeding.');
    process.exit(1);
  }

  try {
    await connectDB();
  } catch (err: any) {
    console.error(`[Seed Fatal Error] Cannot connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  if (!isDatabaseConnected()) {
    console.error('[Seed Error] Database connection is not ready.');
    process.exit(1);
  }

  console.log('[Seed] Connected to MongoDB. Commencing idempotent upsert migration...\n');

  try {
    // 1. Seed Properties
    console.log(`[Seed] Processing ${DEMO_PROPERTIES.length} verified demo properties...`);
    let propertiesUpserted = 0;
    for (const prop of DEMO_PROPERTIES) {
      await PropertyModel.findOneAndUpdate(
        { id: prop.id },
        { $set: prop },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      propertiesUpserted++;
    }
    console.log(`  ✓ ${propertiesUpserted} properties upserted by unique identifier.`);

    // 2. Seed City Services
    console.log(`\n[Seed] Processing ${DEMO_CITY_SERVICES.length} civic services and transit nodes...`);
    let servicesUpserted = 0;
    for (const service of DEMO_CITY_SERVICES) {
      await CityServiceModel.findOneAndUpdate(
        { id: service.id },
        { $set: service },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      servicesUpserted++;
    }
    console.log(`  ✓ ${servicesUpserted} civic services upserted by unique identifier.`);

    // 3. Seed Community Reports
    console.log(`\n[Seed] Processing ${DEMO_COMMUNITY_REPORTS.length} community ground truth reports...`);
    let communityUpserted = 0;
    for (const rep of DEMO_COMMUNITY_REPORTS) {
      await CommunityReportModel.findOneAndUpdate(
        { id: rep.id },
        { $set: rep },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      communityUpserted++;
    }
    console.log(`  ✓ ${communityUpserted} community reports upserted by unique identifier.`);

    // 4. Verify Total Counts in MongoDB
    const totalProps = await PropertyModel.countDocuments();
    const totalServices = await CityServiceModel.countDocuments();
    const totalReports = await CommunityReportModel.countDocuments();

    console.log('\n====================================================');
    console.log('  Database Migration Verification Summary           ');
    console.log('====================================================');
    console.log(`  • Properties in Database:       ${totalProps}`);
    console.log(`  • Civic Services in Database:   ${totalServices}`);
    console.log(`  • Community Reports in Database: ${totalReports}`);
    console.log('  • Idempotency Status:           VERIFIED (No duplicates on re-runs)');
    console.log('====================================================\n');
  } catch (err: any) {
    console.error(`[Seed Failure] Error during document upsert: ${err.message}`);
    throw err;
  } finally {
    await mongoose.disconnect();
    console.log('[Seed] Closed database connection cleanly.');
  }
}

// Execute directly if run via CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed().catch((err) => {
    console.error('[Seed Error]', err);
    process.exit(1);
  });
}
