/**
 * Test script to verify delete validation is working
 * Tests all error scenarios
 */

const http = require('http');

const baseUrl = 'http://localhost:5000';
const token = process.argv[2];

if (!token) {
  console.error('Usage: node test-delete-validation.js <ACCESS_TOKEN>');
  console.error('Get your token from: DevTools → Application → Local Storage → ra_admin_access_token');
  process.exit(1);
}

const tests = [
  {
    name: 'Test 1: Missing ID (undefined)',
    id: 'undefined',
    expectedStatus: 400,
    expectedMessage: 'News ID is required',
  },
  {
    name: 'Test 2: Invalid ID format (too short)',
    id: 'invalid',
    expectedStatus: 400,
    expectedMessage: 'Invalid news ID format',
  },
  {
    name: 'Test 3: Invalid ID format (wrong characters)',
    id: 'xxxxxxxxxxxxxxxxxxxxxxxx',
    expectedStatus: 400,
    expectedMessage: 'Invalid news ID format',
  },
  {
    name: 'Test 4: Valid format but non-existent ID',
    id: '507f1f77bcf86cd799439011',
    expectedStatus: 404,
    expectedMessage: 'News article not found',
  },
];

async function runTest(test) {
  return new Promise((resolve) => {
    const url = new URL(`${baseUrl}/api/news/${test.id}`);
    
    const options = {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const passed = res.statusCode === test.expectedStatus && 
                        json.error?.message === test.expectedMessage;
          
          resolve({
            ...test,
            actualStatus: res.statusCode,
            actualMessage: json.error?.message || json.data?.message,
            passed,
            response: json,
          });
        } catch (e) {
          resolve({
            ...test,
            actualStatus: res.statusCode,
            actualMessage: 'Failed to parse response',
            passed: false,
            response: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      resolve({
        ...test,
        actualStatus: 0,
        actualMessage: error.message,
        passed: false,
        error: error.message,
      });
    });

    req.end();
  });
}

async function runAllTests() {
  console.log('🧪 Testing Delete News Validation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await runTest(test);
    
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
    console.log(`   Expected: ${result.expectedStatus} - "${result.expectedMessage}"`);
    console.log(`   Actual:   ${result.actualStatus} - "${result.actualMessage}"`);
    
    if (!result.passed) {
      console.log(`   Response:`, JSON.stringify(result.response, null, 2));
      failed++;
    } else {
      passed++;
    }
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Results: ${passed} passed, ${failed} failed out of ${tests.length} tests\n`);

  if (failed === 0) {
    console.log('🎉 All validation tests passed!');
    console.log('✅ The delete endpoint is properly validating IDs');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }
}

runAllTests();
