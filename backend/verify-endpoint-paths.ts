/**
 * Verification Script for RAG Service Endpoint Paths
 * 
 * This script verifies that the backend HTTP client is configured
 * with the correct endpoint paths for the RAG service.
 * 
 * Requirements validated: 1.1, 2.1, 4.1
 */

import * as fs from 'fs';
import * as path from 'path';

interface VerificationResult {
  check: string;
  passed: boolean;
  expected: string;
  actual: string;
  message: string;
}

class EndpointPathVerifier {
  private results: VerificationResult[] = [];
  private httpClientPath = path.join(__dirname, 'src', 'utils', 'httpClient.ts');

  /**
   * Read the HTTP client file
   */
  private readHttpClient(): string {
    try {
      return fs.readFileSync(this.httpClientPath, 'utf-8');
    } catch (error: any) {
      console.error(`❌ Failed to read HTTP client file: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Verify indexDocument endpoint path
   */
  private verifyIndexDocumentPath(content: string): void {
    const expected = '/api/index';
    const regex = /ragServiceClient\.post\(['"]([^'"]+)['"]/;
    const match = content.match(/async indexDocument[\s\S]*?ragServiceClient\.post\(['"]([^'"]+)['"]/);
    
    if (match) {
      const actual = match[1];
      const passed = actual === expected;
      
      this.results.push({
        check: 'indexDocument endpoint',
        passed,
        expected,
        actual,
        message: passed 
          ? 'Correct endpoint path for document indexing'
          : `Incorrect path - should be ${expected} but found ${actual}`
      });
    } else {
      this.results.push({
        check: 'indexDocument endpoint',
        passed: false,
        expected,
        actual: 'NOT FOUND',
        message: 'Could not find indexDocument method or endpoint path'
      });
    }
  }

  /**
   * Verify queryDocuments endpoint path
   */
  private verifyQueryDocumentsPath(content: string): void {
    const expected = '/api/query';
    const match = content.match(/async queryDocuments[\s\S]*?ragServiceClient\.post\(['"]([^'"]+)['"]/);
    
    if (match) {
      const actual = match[1];
      const passed = actual === expected;
      
      this.results.push({
        check: 'queryDocuments endpoint',
        passed,
        expected,
        actual,
        message: passed 
          ? 'Correct endpoint path for querying documents'
          : `Incorrect path - should be ${expected} but found ${actual}`
      });
    } else {
      this.results.push({
        check: 'queryDocuments endpoint',
        passed: false,
        expected,
        actual: 'NOT FOUND',
        message: 'Could not find queryDocuments method or endpoint path'
      });
    }
  }

  /**
   * Verify getIndexingProgress endpoint path
   */
  private verifyProgressPath(content: string): void {
    const expectedPattern = '/api/index/progress/';
    const match = content.match(/async getIndexingProgress[\s\S]*?ragServiceClient\.get\([`'"]([^`'"]+)[`'"]/);
    
    if (match) {
      const actual = match[1];
      const passed = actual.includes(expectedPattern);
      
      this.results.push({
        check: 'getIndexingProgress endpoint',
        passed,
        expected: expectedPattern + '{documentId}',
        actual,
        message: passed 
          ? 'Correct endpoint path for indexing progress'
          : `Incorrect path - should include ${expectedPattern} but found ${actual}`
      });
    } else {
      this.results.push({
        check: 'getIndexingProgress endpoint',
        passed: false,
        expected: expectedPattern + '{documentId}',
        actual: 'NOT FOUND',
        message: 'Could not find getIndexingProgress method or endpoint path'
      });
    }
  }

  /**
   * Verify healthCheck endpoint path
   */
  private verifyHealthCheckPath(content: string): void {
    const expected = '/health';
    const match = content.match(/async healthCheck[\s\S]*?ragServiceClient\.get\(['"]([^'"]+)['"]/);
    
    if (match) {
      const actual = match[1];
      const passed = actual === expected;
      
      this.results.push({
        check: 'healthCheck endpoint',
        passed,
        expected,
        actual,
        message: passed 
          ? 'Correct endpoint path for health check (no /api prefix)'
          : `Incorrect path - should be ${expected} but found ${actual}`
      });
    } else {
      this.results.push({
        check: 'healthCheck endpoint',
        passed: false,
        expected,
        actual: 'NOT FOUND',
        message: 'Could not find healthCheck method or endpoint path'
      });
    }
  }

  /**
   * Run all verifications
   */
  public verify(): void {
    console.log('\n========================================');
    console.log('RAG Service Endpoint Path Verification');
    console.log('========================================\n');
    console.log(`Checking file: ${this.httpClientPath}\n`);

    const content = this.readHttpClient();

    // Run all verifications
    this.verifyIndexDocumentPath(content);
    this.verifyQueryDocumentsPath(content);
    this.verifyProgressPath(content);
    this.verifyHealthCheckPath(content);

    // Print results
    this.printResults();
  }

  /**
   * Print verification results
   */
  private printResults(): void {
    console.log('Results:\n');

    this.results.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.check}`);
      console.log(`   Expected: ${result.expected}`);
      console.log(`   Actual:   ${result.actual}`);
      console.log(`   ${result.message}\n`);
    });

    // Summary
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const allPassed = passed === total;

    console.log('========================================');
    console.log('Summary');
    console.log('========================================\n');
    console.log(`Total Checks: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${total - passed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (allPassed) {
      console.log('✅ All endpoint paths are correctly configured!\n');
      console.log('Requirements Validated:');
      console.log('  ✅ 1.1: Backend calls RAG indexing endpoint at /api/index');
      console.log('  ✅ 2.1: Backend sends queries to /api/query');
      console.log('  ✅ 4.1: Consistent API endpoint paths with /api prefix');
      console.log('  ✅ Health check correctly uses /health (no /api prefix)\n');
      
      console.log('Next Steps:');
      console.log('  1. Ensure RAG service is running: START-RAG.bat');
      console.log('  2. Upload a test document through admin interface');
      console.log('  3. Verify no 404 errors in backend logs');
      console.log('  4. Check document indexing completes successfully\n');
    } else {
      console.log('❌ Some endpoint paths are incorrect!\n');
      console.log('Action Required:');
      console.log('  1. Review the failed checks above');
      console.log('  2. Update src/utils/httpClient.ts with correct paths');
      console.log('  3. Run this verification script again\n');
      process.exit(1);
    }
  }
}

// Run verification
const verifier = new EndpointPathVerifier();
verifier.verify();
