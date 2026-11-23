import express from 'express';
import propertyRoutes from './dist/routes/propertyRoutes.js';
import cityServiceRoutes from './dist/routes/cityServiceRoutes.js';
import communityRoutes from './dist/routes/communityRoutes.js';

console.log('=== RUNNING TRUSTNEST REST API & CONTROLLER INTEGRATION TESTS ===\n');

const app = express();
app.use(express.json());
app.use('/api/properties', propertyRoutes);
app.use('/api/city-services', cityServiceRoutes);
app.use('/api/community', communityRoutes);

const results = {
  passed: [],
  failed: [],
};

function assert(condition, message) {
  if (condition) {
    results.passed.push(message);
    console.log(`  ✓ PASS: ${message}`);
  } else {
    results.failed.push(message);
    console.log(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  const server = app.listen(5099);

  try {
    const baseUrl = 'http://127.0.0.1:5099';

    // 1. GET /api/properties
    console.log('--- Test 1: Property Listings Endpoint ---');
    const propRes = await fetch(`${baseUrl}/api/properties`);
    const propData = await propRes.json();
    assert(propRes.status === 200, 'GET /api/properties returns HTTP 200');
    assert(propData.success === true, 'Response has success: true');
    assert(propData.count >= 4, `Returns properties (count: ${propData.count})`);
    assert(propData.source === 'demonstration_fallback', 'Labels unseeded offline state as demonstration_fallback');
    assert(propData.isDemoData === true, 'isDemoData is true when fallback is active');

    // 2. GET /api/properties/:id
    console.log('\n--- Test 2: Single Property Lookup ---');
    const singleRes = await fetch(`${baseUrl}/api/properties/TN-HYD-0101`);
    const singleData = await singleRes.json();
    assert(singleRes.status === 200, 'GET /api/properties/TN-HYD-0101 returns HTTP 200');
    assert(singleData.data.id === 'TN-HYD-0101', 'Retrieved exact property TN-HYD-0101');
    assert(singleData.data.name.includes('Ananya'), 'Property name matches Ananya Executive');

    // 3. GET /api/city-services
    console.log('\n--- Test 3: Civic Services Endpoint ---');
    const cityRes = await fetch(`${baseUrl}/api/city-services`);
    const cityData = await cityRes.json();
    assert(cityRes.status === 200, 'GET /api/city-services returns HTTP 200');
    assert(cityData.count >= 12, `Returns civic services (count: ${cityData.count})`);
    assert(cityData.source === 'demonstration_fallback', 'Civic services correctly labeled as demonstration_fallback');

    // 4. GET /api/community/reports
    console.log('\n--- Test 4: Community Reports Listing ---');
    const commRes = await fetch(`${baseUrl}/api/community/reports`);
    const commData = await commRes.json();
    assert(commRes.status === 200, 'GET /api/community/reports returns HTTP 200');
    assert(commData.count >= 4, `Returns community reports (count: ${commData.count})`);

    // 5. POST /api/community/reports (Strict DB Offline Check)
    console.log('\n--- Test 5: Community Report Submission when Database Disconnected ---');
    const postCommRes = await fetch(`${baseUrl}/api/community/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'TN-HYD-0101',
        observation: 'Testing water supply observation during evening hours.',
      }),
    });
    const postCommData = await postCommRes.json();
    assert(postCommRes.status === 503, 'POST returns HTTP 503 Service Unavailable when DB is disconnected');
    assert(postCommData.code === 'DATABASE_UNAVAILABLE', 'Returns DATABASE_UNAVAILABLE code');
    assert(postCommData.success === false, 'success is false (never simulates fake success)');

    // 6. POST /api/properties/:id/discrepancies (Strict DB Offline Check)
    console.log('\n--- Test 6: Discrepancy Submission when Database Disconnected ---');
    const postDiscRes = await fetch(`${baseUrl}/api/properties/TN-HYD-0101/discrepancies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        observation: 'Corridor CCTV was reported non-functional yesterday.',
      }),
    });
    const postDiscData = await postDiscRes.json();
    assert(postDiscRes.status === 503, 'POST returns HTTP 503 when DB is disconnected');
    assert(postDiscData.code === 'DATABASE_UNAVAILABLE', 'Returns DATABASE_UNAVAILABLE code');
    assert(postDiscData.success === false, 'Never reports success when not persisted');

    console.log('\n=== REST API INTEGRATION TEST SUMMARY ===');
    console.log(`Passed: ${results.passed.length}`);
    console.log(`Failed: ${results.failed.length}`);

    if (results.failed.length > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
