#!/usr/bin/env node

/**
 * Security Testing Script for PLN Form
 * Run with: node security-test.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_RESULTS = [];

// Test configuration
const TESTS = {
  RATE_LIMITING: true,
  CSRF_PROTECTION: true,
  INPUT_VALIDATION: true,
  FILE_UPLOAD_SECURITY: true,
  CAPTCHA_PROTECTION: true,
  AUTHENTICATION: true,
};

class SecurityTester {
  constructor() {
    this.results = [];
    this.csrfToken = null;
  }

  log(test, status, message, details = null) {
    const result = {
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
    
    this.results.push(result);
    
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${test}: ${message}`);
    
    if (details) {
      console.log(`   Details: ${JSON.stringify(details, null, 2)}`);
    }
  }

  async getCSRFToken() {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pln/csrf-token`);
      this.csrfToken = response.data.token;
      this.log('CSRF_TOKEN_FETCH', 'PASS', 'Successfully retrieved CSRF token');
      return this.csrfToken;
    } catch (error) {
      this.log('CSRF_TOKEN_FETCH', 'FAIL', 'Failed to retrieve CSRF token', {
        error: error.message,
        status: error.response?.status,
      });
      return null;
    }
  }

  async testRateLimiting() {
    if (!TESTS.RATE_LIMITING) return;
    
    console.log('\n🔄 Testing Rate Limiting...');
    
    const requests = [];
    const maxRequests = 7; // Should exceed the 5/hour limit
    
    for (let i = 0; i < maxRequests; i++) {
      requests.push(this.makeTestSubmission(false)); // Without proper data
    }
    
    try {
      const responses = await Promise.allSettled(requests);
      const rateLimitedCount = responses.filter(r => 
        r.status === 'rejected' && 
        r.reason?.response?.status === 429
      ).length;
      
      if (rateLimitedCount > 0) {
        this.log('RATE_LIMITING', 'PASS', `Rate limiting active: ${rateLimitedCount} requests blocked`);
      } else {
        this.log('RATE_LIMITING', 'FAIL', 'Rate limiting not working - all requests went through');
      }
    } catch (error) {
      this.log('RATE_LIMITING', 'WARN', 'Rate limiting test inconclusive', { error: error.message });
    }
  }

  async testCSRFProtection() {
    if (!TESTS.CSRF_PROTECTION) return;
    
    console.log('\n🛡️ Testing CSRF Protection...');
    
    try {
      // Test without CSRF token
      const response = await this.makeTestSubmission(false, { skipCSRF: true });
      this.log('CSRF_PROTECTION', 'FAIL', 'Request succeeded without CSRF token');
    } catch (error) {
      if (error.response?.status === 403 || error.response?.status === 400) {
        this.log('CSRF_PROTECTION', 'PASS', 'CSRF protection active - request blocked without token');
      } else {
        this.log('CSRF_PROTECTION', 'WARN', 'Unexpected error in CSRF test', {
          status: error.response?.status,
          message: error.message,
        });
      }
    }
  }

  async testInputValidation() {
    if (!TESTS.INPUT_VALIDATION) return;
    
    console.log('\n🔍 Testing Input Validation...');
    
    const maliciousInputs = [
      { field: 'surname', value: '<script>alert("xss")</script>', type: 'XSS' },
      { field: 'email', value: 'test@test.com<script>alert("xss")</script>', type: 'XSS' },
      { field: 'initials', value: "'; DROP TABLE plns; --", type: 'SQL Injection' },
      { field: 'businessName', value: '${7*7}', type: 'Template Injection' },
      { field: 'declarationPlace', value: 'javascript:alert("xss")', type: 'JavaScript Protocol' },
    ];
    
    for (const input of maliciousInputs) {
      try {
        const testData = this.getValidFormData();
        testData[input.field] = input.value;
        
        await this.makeTestSubmission(true, { formData: testData });
        this.log('INPUT_VALIDATION', 'FAIL', `${input.type} not blocked in ${input.field}`);
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('INPUT_VALIDATION', 'PASS', `${input.type} blocked in ${input.field}`);
        } else {
          this.log('INPUT_VALIDATION', 'WARN', `Unexpected response for ${input.type}`, {
            field: input.field,
            status: error.response?.status,
          });
        }
      }
    }
  }

  async testFileUploadSecurity() {
    if (!TESTS.FILE_UPLOAD_SECURITY) return;
    
    console.log('\n📁 Testing File Upload Security...');
    
    const maliciousFiles = [
      { name: 'malware.pdf', content: '%PDF-1.4\n<script>alert("xss")</script>', type: 'PDF with JS' },
      { name: 'fake.pdf', content: 'This is not a PDF file', type: 'Fake PDF' },
      { name: 'large.pdf', content: 'A'.repeat(15 * 1024 * 1024), type: 'Oversized file' },
      { name: 'script.exe', content: 'MZ\x90\x00\x03', type: 'Executable file' },
    ];
    
    for (const file of maliciousFiles) {
      try {
        await this.makeTestSubmission(true, { 
          customFile: { name: file.name, content: file.content }
        });
        this.log('FILE_UPLOAD_SECURITY', 'FAIL', `${file.type} not blocked`);
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('FILE_UPLOAD_SECURITY', 'PASS', `${file.type} blocked`);
        } else {
          this.log('FILE_UPLOAD_SECURITY', 'WARN', `Unexpected response for ${file.type}`, {
            status: error.response?.status,
          });
        }
      }
    }
  }

  async testCaptchaProtection() {
    if (!TESTS.CAPTCHA_PROTECTION) return;
    
    console.log('\n🤖 Testing CAPTCHA Protection...');
    
    try {
      // Test without CAPTCHA token
      await this.makeTestSubmission(true, { skipCaptcha: true });
      this.log('CAPTCHA_PROTECTION', 'FAIL', 'Request succeeded without CAPTCHA');
    } catch (error) {
      if (error.response?.status === 400) {
        this.log('CAPTCHA_PROTECTION', 'PASS', 'CAPTCHA protection active');
      } else {
        this.log('CAPTCHA_PROTECTION', 'WARN', 'Unexpected CAPTCHA test result', {
          status: error.response?.status,
        });
      }
    }
  }

  async testAuthentication() {
    if (!TESTS.AUTHENTICATION) return;
    
    console.log('\n🔐 Testing Authentication...');
    
    try {
      // Test admin endpoint without auth
      const response = await axios.get(`${API_BASE_URL}/api/pln/applications`);
      this.log('AUTHENTICATION', 'FAIL', 'Admin endpoint accessible without authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        this.log('AUTHENTICATION', 'PASS', 'Admin endpoints properly protected');
      } else {
        this.log('AUTHENTICATION', 'WARN', 'Unexpected auth test result', {
          status: error.response?.status,
        });
      }
    }
  }

  getValidFormData() {
    return {
      idType: 'Traffic Register Number',
      trafficRegisterNumber: 'TR123456789',
      surname: 'TestUser',
      initials: 'T.U.',
      postalAddress: JSON.stringify({
        line1: '123 Test Street',
        line2: 'Test Area',
        line3: 'Test City',
      }),
      streetAddress: JSON.stringify({
        line1: '123 Test Street',
        line2: 'Test Area',
        line3: 'Test City',
      }),
      cellNumber: JSON.stringify({
        code: '+264',
        number: '811234567',
      }),
      email: 'test@example.com',
      plateFormat: 'Normal',
      quantity: '1',
      plateChoices: JSON.stringify([
        { text: 'TEST1', meaning: 'Test plate 1' },
        { text: 'TEST2', meaning: 'Test plate 2' },
        { text: 'TEST3', meaning: 'Test plate 3' },
      ]),
      declarationAccepted: 'true',
      declarationPlace: 'Windhoek',
    };
  }

  async makeTestSubmission(useValidData = true, options = {}) {
    const formData = new FormData();
    
    if (useValidData) {
      const data = options.formData || this.getValidFormData();
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });
    }
    
    // Add file
    if (!options.customFile) {
      const pdfContent = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000053 00000 n \n0000000125 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n196\n%%EOF';
      formData.append('document', Buffer.from(pdfContent), {
        filename: 'test-document.pdf',
        contentType: 'application/pdf',
      });
    } else {
      formData.append('document', Buffer.from(options.customFile.content), {
        filename: options.customFile.name,
        contentType: 'application/pdf',
      });
    }
    
    // Add security tokens
    if (!options.skipCaptcha) {
      formData.append('captchaToken', 'test-captcha-token');
    }
    
    const headers = { ...formData.getHeaders() };
    
    if (!options.skipCSRF && this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }
    
    return axios.post(`${API_BASE_URL}/api/pln/applications`, formData, { headers });
  }

  async runAllTests() {
    console.log('🚀 Starting PLN Form Security Tests...\n');
    
    // Get CSRF token first
    await this.getCSRFToken();
    
    // Run all tests
    await this.testRateLimiting();
    await this.testCSRFProtection();
    await this.testInputValidation();
    await this.testFileUploadSecurity();
    await this.testCaptchaProtection();
    await this.testAuthentication();
    
    // Generate report
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Security Test Report');
    console.log('========================\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`📝 Total Tests: ${this.results.length}\n`);
    
    if (failed > 0) {
      console.log('❌ CRITICAL SECURITY ISSUES FOUND:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
      console.log('');
    }
    
    if (warnings > 0) {
      console.log('⚠️  WARNINGS:');
      this.results
        .filter(r => r.status === 'WARN')
        .forEach(r => console.log(`   - ${r.test}: ${r.message}`));
      console.log('');
    }
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'security-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      summary: { passed, failed, warnings, total: this.results.length },
      results: this.results,
      timestamp: new Date().toISOString(),
    }, null, 2));
    
    console.log(`📄 Detailed report saved to: ${reportPath}`);
    
    // Exit with error code if tests failed
    if (failed > 0) {
      process.exit(1);
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Security test suite failed:', error);
    process.exit(1);
  });
}

module.exports = SecurityTester;