#!/usr/bin/env node

/**
 * Upload Module Test Script
 * This script verifies that the upload module is properly loaded and configured
 * when the NestJS server starts.
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000';
const UPLOAD_TEST_DIR = './test-uploads';

// ANSI colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const levelColors = {
    INFO: colors.blue,
    SUCCESS: colors.green,
    ERROR: colors.red,
    WARN: colors.yellow
  };
  
  console.log(`${levelColors[level]}[${level}]${colors.reset} ${colors.bold}${timestamp}${colors.reset} - ${message}`);
}

async function waitForServer(retries = 30, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      await axios.get(`${BASE_URL}/health`);
      log('SUCCESS', 'Server is running and healthy');
      return true;
    } catch (error) {
      if (i === retries - 1) {
        log('ERROR', `Server not responding after ${retries} attempts`);
        return false;
      }
      log('INFO', `Waiting for server... (attempt ${i + 1}/${retries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function testUploadModuleEndpoint() {
  try {
    log('INFO', 'Testing upload module test endpoint...');
    const response = await axios.post(`${BASE_URL}/upload/test`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    log('INFO', `Response status: ${response.status}`);
    log('INFO', `Response data: ${JSON.stringify(response.data)}`);
    
    // The endpoint returns 201 Created, not 200
    if ((response.status === 200 || response.status === 201) && response.data.status === 'success') {
      log('SUCCESS', '✓ Upload module test endpoint working');
      log('INFO', `Environment: ${response.data.environment}`);
      log('INFO', `Upload directory: ${response.data.uploadDir}`);
      return true;
    } else {
      log('ERROR', '✗ Upload module test endpoint failed');
      log('ERROR', `Expected status 200/201 and success, got ${response.status} and ${response.data.status}`);
      return false;
    }
  } catch (error) {
    log('ERROR', `✗ Upload module test failed: ${error.message}`);
    if (error.response) {
      log('ERROR', `Response status: ${error.response.status}`);
      log('ERROR', `Response data: ${JSON.stringify(error.response.data)}`);
    }
    if (error.request) {
      log('ERROR', `Request failed: ${error.request}`);
    }
    return false;
  }
}

async function createTestImage() {
  // Create a simple test image (1x1 pixel PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
    0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x57, 0x63, 0xF8, 0x0F, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x5C, 0xC2, 0x8A, 0xBC, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);

  if (!fs.existsSync(UPLOAD_TEST_DIR)) {
    fs.mkdirSync(UPLOAD_TEST_DIR, { recursive: true });
  }

  const testImagePath = path.join(UPLOAD_TEST_DIR, 'test-image.png');
  fs.writeFileSync(testImagePath, testImageBuffer);
  
  log('SUCCESS', `✓ Test image created: ${testImagePath}`);
  return testImagePath;
}

async function testUploadDirectories() {
  try {
    log('INFO', 'Testing upload directory structure...');
    
    // Check if upload directories exist (they should be auto-created)
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const requiredDirs = ['images', 'thumbnails', 'verification'];
    
    for (const dir of requiredDirs) {
      const fullPath = path.join(uploadDir, dir);
      if (fs.existsSync(fullPath)) {
        log('SUCCESS', `✓ Directory exists: ${fullPath}`);
      } else {
        log('WARN', `⚠ Directory missing: ${fullPath} (will be auto-created on upload)`);
      }
    }
    
    return true;
  } catch (error) {
    log('ERROR', `✗ Directory check failed: ${error.message}`);
    return false;
  }
}

async function cleanup() {
  try {
    if (fs.existsSync(UPLOAD_TEST_DIR)) {
      fs.rmSync(UPLOAD_TEST_DIR, { recursive: true });
      log('INFO', 'Test files cleaned up');
    }
  } catch (error) {
    log('WARN', `Cleanup warning: ${error.message}`);
  }
}

async function runTests() {
  log('INFO', '🚀 Starting Upload Module Test Suite');
  log('INFO', `Server URL: ${BASE_URL}`);
  
  const results = {
    serverHealth: false,
    uploadModule: false,
    directories: false,
  };

  try {
    // Test 1: Server Health
    log('INFO', '\n📊 Test 1: Server Health Check');
    results.serverHealth = await waitForServer();
    
    if (!results.serverHealth) {
      log('ERROR', 'Cannot proceed with tests - server is not responding');
      process.exit(1);
    }

    // Test 2: Upload Module Endpoint
    log('INFO', '\n📤 Test 2: Upload Module Configuration');
    results.uploadModule = await testUploadModuleEndpoint();

    // Test 3: Directory Structure
    log('INFO', '\n📁 Test 3: Upload Directory Structure');
    results.directories = await testUploadDirectories();

    // Summary
    log('INFO', '\n📋 Test Results Summary:');
    log(results.serverHealth ? 'SUCCESS' : 'ERROR', `Server Health: ${results.serverHealth ? 'PASS' : 'FAIL'}`);
    log(results.uploadModule ? 'SUCCESS' : 'ERROR', `Upload Module: ${results.uploadModule ? 'PASS' : 'FAIL'}`);
    log(results.directories ? 'SUCCESS' : 'ERROR', `Directories: ${results.directories ? 'PASS' : 'FAIL'}`);

    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
      log('SUCCESS', '\n🎉 All tests passed! Upload module is properly configured.');
      log('INFO', '\n📝 Next steps:');
      log('INFO', '  1. Test image upload with authentication');
      log('INFO', '  2. Test file serving endpoints');
      log('INFO', '  3. Test thumbnail generation');
      log('INFO', '  4. Test file cleanup and management');
    } else {
      log('ERROR', '\n❌ Some tests failed. Please check the configuration.');
      process.exit(1);
    }

  } catch (error) {
    log('ERROR', `Test suite failed: ${error.message}`);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log('INFO', '\nReceived SIGINT, cleaning up...');
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('INFO', '\nReceived SIGTERM, cleaning up...');
  await cleanup();
  process.exit(0);
});

// Run the tests
runTests().catch(error => {
  log('ERROR', `Unhandled error: ${error.message}`);
  cleanup().finally(() => process.exit(1));
});
