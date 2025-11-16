/**
 * Quick API Test for Portfolio Endpoints
 * Run: npx tsx test-portfolio-api.ts
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Portfolio API Endpoints...\n');

  try {
    // Test 1: GET /api/templates - List templates
    console.log('1️⃣  GET /api/templates - List Templates');
    const templatesRes = await fetch(`${BASE_URL}/api/templates`);
    if (templatesRes.ok) {
      const templates = await templatesRes.json();
      console.log(`   ✅ SUCCESS: Found ${templates.data?.length || templates.length || 0} templates`);
    } else {
      console.log(`   ❌ FAILED: ${templatesRes.status} ${templatesRes.statusText}`);
    }

    // Test 2: GET /api/portfolios - List portfolios
    console.log('\n2️⃣  GET /api/portfolios - List Portfolios');
    const portfoliosRes = await fetch(`${BASE_URL}/api/portfolios`);
    if (portfoliosRes.ok) {
      const portfolios = await portfoliosRes.json();
      console.log(`   ✅ SUCCESS: Found ${portfolios.data?.length || 0} portfolios`);
      console.log(`   📊 Pagination: Page ${portfolios.meta?.page || 1} of ${portfolios.meta?.totalPages || 1}`);
    } else {
      console.log(`   ❌ FAILED: ${portfoliosRes.status} ${portfoliosRes.statusText}`);
    }

    // Test 3: POST /api/portfolios - Create portfolio
    console.log('\n3️⃣  POST /api/portfolios - Create Portfolio');
    const createRes = await fetch(`${BASE_URL}/api/portfolios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Portfolio',
        data: {
          hero: { title: 'Welcome', subtitle: 'My Portfolio' },
          about: { bio: 'Test bio' },
        },
      }),
    });
    
    let createdPortfolioId: string | null = null;
    if (createRes.ok) {
      const portfolio = await createRes.json();
      createdPortfolioId = portfolio.id;
      console.log(`   ✅ SUCCESS: Created portfolio "${portfolio.title || portfolio.name}"`);
      console.log(`   🆔 ID: ${portfolio.id}`);
    } else {
      const error = await createRes.text();
      console.log(`   ❌ FAILED: ${createRes.status} ${createRes.statusText}`);
      console.log(`   Error: ${error.substring(0, 200)}`);
    }

    // Test 4: GET /api/portfolios/[id] - Get single portfolio
    if (createdPortfolioId) {
      console.log('\n4️⃣  GET /api/portfolios/[id] - Get Single Portfolio');
      const getRes = await fetch(`${BASE_URL}/api/portfolios/${createdPortfolioId}`);
      if (getRes.ok) {
        const portfolio = await getRes.json();
        console.log(`   ✅ SUCCESS: Retrieved "${portfolio.title || portfolio.name}"`);
        console.log(`   📝 Status: ${portfolio.status}`);
        console.log(`   👁️  Views: ${portfolio.viewCount}`);
      } else {
        console.log(`   ❌ FAILED: ${getRes.status} ${getRes.statusText}`);
      }

      // Test 5: PATCH /api/portfolios/[id] - Update portfolio
      console.log('\n5️⃣  PATCH /api/portfolios/[id] - Update Portfolio');
      const patchRes = await fetch(`${BASE_URL}/api/portfolios/${createdPortfolioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Updated Test Portfolio',
          data: { hero: { title: 'Updated Welcome' } },
        }),
      });
      if (patchRes.ok) {
        const updated = await patchRes.json();
        console.log(`   ✅ SUCCESS: Updated to "${updated.title || updated.name}"`);
      } else {
        console.log(`   ❌ FAILED: ${patchRes.status} ${patchRes.statusText}`);
      }

      // Test 6: DELETE /api/portfolios/[id] - Delete portfolio
      console.log('\n6️⃣  DELETE /api/portfolios/[id] - Delete Portfolio');
      const deleteRes = await fetch(`${BASE_URL}/api/portfolios/${createdPortfolioId}`, {
        method: 'DELETE',
      });
      if (deleteRes.ok) {
        console.log(`   ✅ SUCCESS: Portfolio deleted`);
      } else {
        console.log(`   ❌ FAILED: ${deleteRes.status} ${deleteRes.statusText}`);
      }
    }

    console.log('\n✨ API Testing Complete!\n');
  } catch (error) {
    console.error('\n❌ Test Error:', error);
    console.log('\n💡 Make sure your dev server is running: npm run dev\n');
  }
}

testAPI();

