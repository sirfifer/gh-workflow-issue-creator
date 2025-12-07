/**
 * Local E2E Test for GH-Workflow-Issue-Creator
 *
 * This script simulates a local GitHub Actions environment to test the action
 * without needing to deploy to GitHub.
 *
 * Usage:
 *   npm run test:e2e
 *
 * Prerequisites:
 *   - Built dist/ directory (npm run build)
 *   - GITHUB_TOKEN environment variable (optional, uses mock if not provided)
 */

import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  name: string;
  env: Record<string, string>;
  inputs: Record<string, string>;
  expectedOutputs?: Record<string, string>;
  shouldFail?: boolean;
}

/**
 * Set up GitHub Actions environment variables
 */
function setupEnvironment(env: Record<string, string>): void {
  for (const [key, value] of Object.entries(env)) {
    process.env[key] = value;
  }
}

/**
 * Clean up environment after test
 */
function cleanupEnvironment(keys: string[]): void {
  for (const key of keys) {
    delete process.env[key];
  }
}

/**
 * Validate that required files exist
 */
function validateProjectStructure(): boolean {
  const requiredFiles = [
    'action.yml',
    'package.json',
    'src/index.ts',
    'src/lib/config.ts',
    'src/lib/context.ts',
    'src/lib/category.ts',
    'src/lib/fingerprint.ts',
    'src/lib/render.ts',
    'src/lib/issue-manager.ts',
    'src/lib/redact.ts',
    'templates/default.md',
  ];

  const projectRoot = path.join(__dirname, '..', '..');
  let allExist = true;

  console.log('\n📁 Validating project structure...\n');

  for (const file of requiredFiles) {
    const filePath = path.join(projectRoot, file);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    console.log(`  ${status} ${file}`);
    if (!exists) allExist = false;
  }

  return allExist;
}

/**
 * Validate action.yml structure
 */
function validateActionYml(): boolean {
  const projectRoot = path.join(__dirname, '..', '..');
  const actionPath = path.join(projectRoot, 'action.yml');

  console.log('\n📋 Validating action.yml...\n');

  try {
    const content = fs.readFileSync(actionPath, 'utf8');

    // Check for required sections
    const requiredSections = ['name:', 'description:', 'inputs:', 'outputs:', 'runs:'];
    let valid = true;

    for (const section of requiredSections) {
      const exists = content.includes(section);
      const status = exists ? '✅' : '❌';
      console.log(`  ${status} ${section}`);
      if (!exists) valid = false;
    }

    // Check for required input
    const hasToken = content.includes('github-token:');
    console.log(`  ${hasToken ? '✅' : '❌'} github-token input`);

    return valid && hasToken;
  } catch (error) {
    console.error('  ❌ Failed to read action.yml');
    return false;
  }
}

/**
 * Test module imports
 */
async function testModuleImports(): Promise<boolean> {
  console.log('\n📦 Testing module imports...\n');

  const modules = [
    '../src/lib/config',
    '../src/lib/context',
    '../src/lib/category',
    '../src/lib/fingerprint',
    '../src/lib/render',
    '../src/lib/issue-manager',
    '../src/lib/redact',
  ];

  let allPass = true;

  for (const mod of modules) {
    try {
      await import(mod);
      console.log(`  ✅ ${mod}`);
    } catch (error) {
      console.log(`  ❌ ${mod}: ${(error as Error).message}`);
      allPass = false;
    }
  }

  return allPass;
}

/**
 * Test category detection
 */
async function testCategoryDetection(): Promise<boolean> {
  console.log('\n🏷️ Testing category detection...\n');

  try {
    const { autoDetectCategory } = await import('../../src/lib/category');

    const testCases = [
      { workflow: 'terraform-validate', expected: 'terraform-validation' },
      { workflow: 'Deploy to Production', expected: 'infrastructure-deployment' },
      { workflow: 'Security Scan', expected: 'security-scan' },
      { workflow: 'Run Tests', expected: 'code-quality' },
      { workflow: 'random-workflow', expected: 'general' },
    ];

    let allPass = true;

    for (const { workflow, expected } of testCases) {
      const result = autoDetectCategory({ workflow, jobName: '', additionalLabels: '' });
      const pass = result === expected;
      const status = pass ? '✅' : '❌';
      console.log(`  ${status} "${workflow}" → ${result} (expected: ${expected})`);
      if (!pass) allPass = false;
    }

    return allPass;
  } catch (error) {
    console.error(`  ❌ Failed: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Test fingerprint stability
 */
async function testFingerprintStability(): Promise<boolean> {
  console.log('\n🔑 Testing fingerprint stability...\n');

  try {
    const { computeFingerprint } = await import('../../src/lib/fingerprint');

    const ctx = {
      repository: 'test/repo',
      workflow: { name: 'CI', job: 'test' },
    };

    // Same context should produce same fingerprint
    const fp1 = computeFingerprint({ ctx, category: 'general', errorSignatures: [] });
    const fp2 = computeFingerprint({ ctx, category: 'general', errorSignatures: [] });
    const stable = fp1 === fp2;

    console.log(`  ${stable ? '✅' : '❌'} Fingerprints are stable: ${fp1}`);

    // Different category should produce different fingerprint
    const fp3 = computeFingerprint({ ctx, category: 'code-quality', errorSignatures: [] });
    const different = fp1 !== fp3;

    console.log(`  ${different ? '✅' : '❌'} Different categories produce different fingerprints`);

    // Dynamic content should be normalized
    const fp4 = computeFingerprint({ ctx, category: 'general', errorSignatures: ['Error: sha abc123'] });
    const fp5 = computeFingerprint({ ctx, category: 'general', errorSignatures: ['Error: sha def456'] });
    const normalized = fp4 === fp5;

    console.log(`  ${normalized ? '✅' : '❌'} Dynamic content is normalized`);

    return stable && different && normalized;
  } catch (error) {
    console.error(`  ❌ Failed: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Test redaction
 */
async function testRedaction(): Promise<boolean> {
  console.log('\n🔒 Testing redaction...\n');

  try {
    const { redactText } = await import('../../src/lib/redact');

    const testCases = [
      { input: 'API_KEY=secret123', shouldContain: '[REDACTED]', shouldNotContain: 'secret123' },
      { input: 'password: mysecret', shouldContain: '[REDACTED]', shouldNotContain: 'mysecret' },
      { input: 'ghp_abc123xyz', shouldContain: '[REDACTED]', shouldNotContain: 'ghp_abc123xyz' },
      { input: 'Normal text without secrets', shouldContain: 'Normal text', shouldNotContain: '[REDACTED]' },
    ];

    let allPass = true;

    for (const { input, shouldContain, shouldNotContain } of testCases) {
      const result = redactText(input);
      const containsExpected = result.includes(shouldContain);
      const notContainsSecret = !result.includes(shouldNotContain);
      const pass = containsExpected && notContainsSecret;
      const status = pass ? '✅' : '❌';
      console.log(`  ${status} "${input.substring(0, 30)}..." → properly redacted`);
      if (!pass) allPass = false;
    }

    return allPass;
  } catch (error) {
    console.error(`  ❌ Failed: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Test context building
 */
async function testContextBuilding(): Promise<boolean> {
  console.log('\n🌍 Testing context building...\n');

  try {
    const { buildContext } = await import('../../src/lib/context');

    // Set up test environment
    const testEnv = {
      GITHUB_REPOSITORY: 'test-owner/test-repo',
      GITHUB_WORKFLOW: 'Test Workflow',
      GITHUB_JOB: 'test-job',
      GITHUB_RUN_ID: '12345',
      GITHUB_SHA: 'abc123',
      GITHUB_REF: 'refs/heads/main',
      GITHUB_ACTOR: 'test-user',
    };

    setupEnvironment(testEnv);

    const ctx = buildContext({});

    const checks = [
      { name: 'owner', value: ctx.owner, expected: 'test-owner' },
      { name: 'repo', value: ctx.repo, expected: 'test-repo' },
      { name: 'workflow.name', value: ctx.workflow.name, expected: 'Test Workflow' },
      { name: 'branch', value: ctx.branch, expected: 'main' },
    ];

    let allPass = true;

    for (const { name, value, expected } of checks) {
      const pass = value === expected;
      const status = pass ? '✅' : '❌';
      console.log(`  ${status} ${name}: "${value}" (expected: "${expected}")`);
      if (!pass) allPass = false;
    }

    cleanupEnvironment(Object.keys(testEnv));

    return allPass;
  } catch (error) {
    console.error(`  ❌ Failed: ${(error as Error).message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log('🧪 GH-Workflow-Issue-Creator E2E Tests\n');
  console.log('='.repeat(50));

  const results: { name: string; passed: boolean }[] = [];

  // Run all tests
  results.push({ name: 'Project Structure', passed: validateProjectStructure() });
  results.push({ name: 'Action YAML', passed: validateActionYml() });
  results.push({ name: 'Module Imports', passed: await testModuleImports() });
  results.push({ name: 'Category Detection', passed: await testCategoryDetection() });
  results.push({ name: 'Fingerprint Stability', passed: await testFingerprintStability() });
  results.push({ name: 'Redaction', passed: await testRedaction() });
  results.push({ name: 'Context Building', passed: await testContextBuilding() });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('\n📊 Test Summary:\n');

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status}: ${result.name}`);
    if (result.passed) passed++;
    else failed++;
  }

  console.log(`\n  Total: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
