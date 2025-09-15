#!/usr/bin/env node

/**
 * 🔍 Advanced Search System Test Suite
 * 
 * Tests the enhanced search functionality including:
 * - Faceted search with dynamic filtering
 * - Advanced search with complex queries
 * - Geographic search capabilities
 * - Search analytics and performance
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';
const TIMEOUT = 30000;

class AdvancedSearchTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    const prefix = level === 'SUCCESS' ? '✅' : level === 'ERROR' ? '❌' : level === 'WARN' ? '⚠️' : 'ℹ️';
    console.log(`[${level}] ${timestamp} - ${prefix} ${message}`);
  }

  async runTest(testName, testFn) {
    this.testResults.total++;
    this.log('INFO', `Running test: ${testName}`);
    
    try {
      await testFn();
      this.testResults.passed++;
      this.testResults.details.push({ name: testName, status: 'PASS' });
      this.log('SUCCESS', `${testName}: PASSED`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.details.push({ name: testName, status: 'FAIL', error: error.message });
      this.log('ERROR', `${testName}: FAILED - ${error.message}`);
    }
  }

  async waitForServer(maxAttempts = 30) {
    for (let i = 1; i <= maxAttempts; i++) {
      try {
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        if (response.status === 200) {
          this.log('SUCCESS', 'Server is ready for testing');
          return true;
        }
      } catch (error) {
        this.log('INFO', `Waiting for server... (attempt ${i}/${maxAttempts})`);
        if (i === maxAttempts) {
          throw new Error('Server not responding after maximum attempts');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  async testBasicSearchEndpoints() {
    // Test existing search endpoints still work
    const response = await axios.get(`${BASE_URL}/search/listings?q=airpods`, { timeout: TIMEOUT });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    if (!data.hasOwnProperty('listings') || !Array.isArray(data.listings)) {
      throw new Error('Response should contain listings array');
    }
    
    this.log('INFO', `Basic search returned ${data.listings.length} results`);
  }

  async testFacetedSearch() {
    // Test faceted search endpoint
    const response = await axios.get(`${BASE_URL}/search/facets?q=bluetooth`, { timeout: TIMEOUT });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    
    // Validate facet structure
    const expectedFacets = ['brands', 'models', 'priceRanges', 'conditions', 'cities'];
    for (const facet of expectedFacets) {
      if (!data.hasOwnProperty(facet)) {
        throw new Error(`Missing facet: ${facet}`);
      }
    }
    
    this.log('INFO', `Faceted search returned facets: ${Object.keys(data).join(', ')}`);
    this.log('INFO', `Brand facets: ${data.brands.length}, Model facets: ${data.models.length}`);
  }

  async testFacetedSearchWithFilters() {
    // Test faceted search with filters applied
    const params = new URLSearchParams({
      q: 'earbuds',
      brandIds: '1,2',
      minPrice: '50',
      maxPrice: '200',
      conditions: 'NEW,LIKE_NEW'
    });
    
    const response = await axios.get(`${BASE_URL}/search/facets?${params}`, { timeout: TIMEOUT });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    this.log('INFO', `Filtered faceted search completed successfully`);
  }

  async testAdvancedSearch() {
    // Test advanced search endpoint
    const response = await axios.get(`${BASE_URL}/search/advanced?q=wireless&sortBy=price_asc&limit=10`, { timeout: TIMEOUT });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    
    // Validate advanced search response structure
    const expectedFields = ['listings', 'total', 'page', 'totalPages', 'hasMore'];
    for (const field of expectedFields) {
      if (!data.hasOwnProperty(field)) {
        throw new Error(`Missing field: ${field}`);
      }
    }
    
    this.log('INFO', `Advanced search returned ${data.total} total results, page ${data.page}/${data.totalPages}`);
  }

  async testAdvancedSearchWithComplexFilters() {
    // Test advanced search with comprehensive filters
    const params = new URLSearchParams({
      q: 'headphones',
      brandIds: '1,2,3',
      modelIds: '1,2',
      minPrice: '100',
      maxPrice: '500',
      conditions: 'NEW,LIKE_NEW',
      cityIds: '1,2',
      verifiedOnly: 'true',
      hasImages: 'true',
      sortBy: 'createdAt_desc',
      page: '1',
      limit: '20'
    });
    
    const response = await axios.get(`${BASE_URL}/search/advanced?${params}`, { timeout: TIMEOUT });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    this.log('INFO', `Complex advanced search with all filters completed successfully`);
    this.log('INFO', `Results: ${data.listings.length} listings, ${data.total} total matches`);
  }

  async testGeographicSearch() {
    // Test geographic search capabilities
    const params = new URLSearchParams({
      q: 'speakers',
      lat: '40.7128',
      lng: '-74.0060',
      radius: '10',
      sortBy: 'distance_asc'
    });
    
    const response = await axios.get(`${BASE_URL}/search/advanced?${params}`, { timeout: TIMEOUT });
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    
    const data = response.data;
    this.log('INFO', `Geographic search (NYC area, 10km radius) returned ${data.listings.length} results`);
  }

  async testSearchWithPagination() {
    // Test pagination in advanced search
    const params1 = new URLSearchParams({
      q: 'audio',
      page: '1',
      limit: '5'
    });
    
    const response1 = await axios.get(`${BASE_URL}/search/advanced?${params1}`, { timeout: TIMEOUT });
    const data1 = response1.data;
    
    if (data1.listings.length > 5) {
      throw new Error(`Expected max 5 results per page, got ${data1.listings.length}`);
    }
    
    // Test second page if available
    if (data1.hasMore) {
      const params2 = new URLSearchParams({
        q: 'audio',
        page: '2',
        limit: '5'
      });
      
      const response2 = await axios.get(`${BASE_URL}/search/advanced?${params2}`, { timeout: TIMEOUT });
      const data2 = response2.data;
      
      if (data2.page !== 2) {
        throw new Error(`Expected page 2, got page ${data2.page}`);
      }
    }
    
    this.log('INFO', `Pagination test completed - page 1 has ${data1.listings.length} results`);
  }

  async testSearchSorting() {
    // Test different sorting options
    const sortOptions = [
      'price_asc',
      'price_desc', 
      'createdAt_desc',
      'createdAt_asc',
      'relevance'
    ];
    
    for (const sortBy of sortOptions) {
      const params = new URLSearchParams({
        q: 'gaming',
        sortBy: sortBy,
        limit: '5'
      });
      
      const response = await axios.get(`${BASE_URL}/search/advanced?${params}`, { timeout: TIMEOUT });
      if (response.status !== 200) {
        throw new Error(`Sort by ${sortBy} failed with status ${response.status}`);
      }
    }
    
    this.log('INFO', `All ${sortOptions.length} sorting options tested successfully`);
  }

  async testErrorHandling() {
    // Test invalid parameters
    try {
      await axios.get(`${BASE_URL}/search/advanced?minPrice=invalid&maxPrice=also_invalid`, { timeout: TIMEOUT });
      throw new Error('Should have failed with invalid price parameters');
    } catch (error) {
      if (error.response && error.response.status >= 400) {
        // Expected error response
        this.log('INFO', 'Error handling test passed - invalid parameters rejected');
      } else {
        throw error;
      }
    }
  }

  async testPerformance() {
    // Test search performance
    const startTime = Date.now();
    
    const response = await axios.get(`${BASE_URL}/search/advanced?q=popular+search+term&limit=50`, { timeout: TIMEOUT });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status !== 200) {
      throw new Error(`Performance test failed with status ${response.status}`);
    }
    
    this.log('INFO', `Search performance: ${responseTime}ms for ${response.data.listings.length} results`);
    
    if (responseTime > 5000) {
      this.log('WARN', 'Search response time is high (>5s) - consider optimization');
    }
  }

  async runAllTests() {
    this.log('INFO', '🚀 Starting Advanced Search System Test Suite');
    this.log('INFO', `Server URL: ${BASE_URL}`);
    
    try {
      // Wait for server to be ready
      await this.waitForServer();
      
      // Run all tests
      await this.runTest('Basic Search Endpoints', () => this.testBasicSearchEndpoints());
      await this.runTest('Faceted Search', () => this.testFacetedSearch());
      await this.runTest('Faceted Search with Filters', () => this.testFacetedSearchWithFilters());
      await this.runTest('Advanced Search Basic', () => this.testAdvancedSearch());
      await this.runTest('Advanced Search Complex Filters', () => this.testAdvancedSearchWithComplexFilters());
      await this.runTest('Geographic Search', () => this.testGeographicSearch());
      await this.runTest('Search Pagination', () => this.testSearchWithPagination());
      await this.runTest('Search Sorting', () => this.testSearchSorting());
      await this.runTest('Error Handling', () => this.testErrorHandling());
      await this.runTest('Performance Test', () => this.testPerformance());
      
    } catch (error) {
      this.log('ERROR', `Test suite setup failed: ${error.message}`);
      process.exit(1);
    }
    
    // Print summary
    this.printSummary();
  }

  printSummary() {
    this.log('INFO', '📋 Test Results Summary:');
    
    for (const result of this.testResults.details) {
      const status = result.status === 'PASS' ? 'SUCCESS' : 'ERROR';
      const message = result.status === 'PASS' ? 'PASS' : `FAIL - ${result.error}`;
      this.log(status, `${result.name}: ${message}`);
    }
    
    this.log('INFO', '');
    this.log('INFO', `📊 Overall Results:`);
    this.log('INFO', `Total Tests: ${this.testResults.total}`);
    this.log('INFO', `Passed: ${this.testResults.passed}`);
    this.log('INFO', `Failed: ${this.testResults.failed}`);
    this.log('INFO', `Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
    
    if (this.testResults.failed === 0) {
      this.log('SUCCESS', '🎉 All advanced search tests passed! Search system is ready for production.');
    } else {
      this.log('ERROR', '❌ Some tests failed. Please check the configuration and fix issues.');
      process.exit(1);
    }
  }
}

// Run the test suite
const tester = new AdvancedSearchTester();
tester.runAllTests().catch(error => {
  console.error('Test suite crashed:', error);
  process.exit(1);
});
