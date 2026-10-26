import http from 'http';
import app from './src/index.js';

const PORT = 5001; // test on separate port to avoid conflicts

async function runTests() {
  const server = app.listen(PORT, async () => {
    console.log(`\n🧪 Running Backend API Verification Tests on port ${PORT}...`);

    try {
      // 1. Health check
      console.log('\n--- 1. Testing GET /api/weather/health ---');
      const healthRes = await fetch(`http://localhost:${PORT}/api/weather/health`);
      const healthData = await healthRes.json();
      console.log('Status code:', healthRes.status);
      console.log('Health response:', JSON.stringify(healthData, null, 2));
      if (healthRes.status !== 200 || !healthData.success) throw new Error('Health check failed');
      console.log('✅ Health check passed');

      // 2. Current Weather (First call -> Cache MISS)
      console.log('\n--- 2. Testing GET /api/weather/current?city=Tokyo&units=metric (First call) ---');
      const firstRes = await fetch(`http://localhost:${PORT}/api/weather/current?city=Tokyo&units=metric`);
      const firstHeader = firstRes.headers.get('X-Cache');
      const firstData = await firstRes.json();
      console.log('Status code:', firstRes.status);
      console.log('X-Cache header:', firstHeader);
      console.log('City:', firstData.data?.city, '| Temp:', firstData.data?.temperature?.current, firstData.data?.temperature?.unit);
      if (firstRes.status !== 200 || firstHeader !== 'MISS') throw new Error('First call did not return MISS');
      console.log('✅ First call cache MISS passed');

      // 3. Current Weather (Second call -> Cache HIT)
      console.log('\n--- 3. Testing GET /api/weather/current?city=Tokyo&units=metric (Second call) ---');
      const secondRes = await fetch(`http://localhost:${PORT}/api/weather/current?city=Tokyo&units=metric`);
      const secondHeader = secondRes.headers.get('X-Cache');
      const secondData = await secondRes.json();
      console.log('Status code:', secondRes.status);
      console.log('X-Cache header:', secondHeader);
      if (secondRes.status !== 200 || secondHeader !== 'HIT') throw new Error('Second call did not return HIT');
      console.log('✅ In-memory cache HIT passed');

      // 4. Forecast endpoint
      console.log('\n--- 4. Testing GET /api/weather/forecast?city=Paris&units=metric ---');
      const forecastRes = await fetch(`http://localhost:${PORT}/api/weather/forecast?city=Paris&units=metric`);
      const forecastData = await forecastRes.json();
      console.log('Status code:', forecastRes.status);
      console.log('Hourly slots:', forecastData.data?.hourly?.length);
      console.log('Daily days:', forecastData.data?.daily?.length);
      if (forecastRes.status !== 200 || !forecastData.data?.hourly || !forecastData.data?.daily) {
        throw new Error('Forecast structure invalid');
      }
      console.log('✅ Forecast passed');

      // 5. Error handling (Missing params -> 400 Bad Request)
      console.log('\n--- 5. Testing Error Handling: GET /api/weather/current with no params ---');
      const badRes = await fetch(`http://localhost:${PORT}/api/weather/current`);
      const badData = await badRes.json();
      console.log('Status code:', badRes.status);
      console.log('Error message:', badData.error);
      if (badRes.status !== 400 || badData.success !== false) throw new Error('Should have returned 400 error');
      console.log('✅ Error handling passed');

      console.log('\n🎉 ALL VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
    } catch (err) {
      console.error('\n❌ Test failed:', err.message);
      process.exitCode = 1;
    } finally {
      server.close();
      process.exit();
    }
  });
}

runTests();
