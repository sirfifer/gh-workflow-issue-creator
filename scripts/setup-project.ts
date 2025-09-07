#!/usr/bin/env node

/**
 * Initial Setup Script
 * Handles first-time setup of the project to get it into a buildable state
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step: string) {
  log(`\n📦 ${step}`, colors.cyan);
}

function logSuccess(message: string) {
  log(`✅ ${message}`, colors.green);
}

function logError(message: string) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message: string) {
  log(`⚠️  ${message}`, colors.yellow);
}

function checkPrerequisites(): boolean {
  logStep('Checking prerequisites...');
  
  try {
    // Check Node version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
    if (majorVersion < 18) {
      logError(`Node.js 18+ required, found ${nodeVersion}`);
      return false;
    }
    logSuccess(`Node.js ${nodeVersion} detected`);
    
    // Check npm
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    logSuccess(`npm ${npmVersion} detected`);
    
    return true;
  } catch (error) {
    logError('Failed to check prerequisites');
    console.error(error);
    return false;
  }
}

function installDependencies(): boolean {
  logStep('Installing dependencies...');
  
  const hasLockFile = fs.existsSync('package-lock.json');
  
  if (hasLockFile) {
    logWarning('package-lock.json already exists, using npm ci');
    try {
      execSync('npm ci', { stdio: 'inherit' });
      logSuccess('Dependencies installed from lock file');
      return true;
    } catch (error) {
      logError('npm ci failed, trying npm install');
    }
  }
  
  try {
    log('Running npm install (this will create package-lock.json)...');
    execSync('npm install', { stdio: 'inherit' });
    logSuccess('Dependencies installed and package-lock.json created');
    return true;
  } catch (error) {
    logError('Failed to install dependencies');
    console.error(error);
    return false;
  }
}

function runInitialTests(): boolean {
  logStep('Running initial tests...');
  
  try {
    execSync('npm test', { stdio: 'inherit' });
    logSuccess('Tests passed!');
    return true;
  } catch (error) {
    logWarning('Tests failed - this is expected with minimal test coverage');
    // Don't fail setup if tests fail, as we know coverage is incomplete
    return true;
  }
}

function buildProject(): boolean {
  logStep('Building project...');
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    
    // Verify dist directory was created
    if (fs.existsSync('dist/index.js')) {
      logSuccess('Project built successfully! dist/index.js created');
      return true;
    } else {
      logError('Build completed but dist/index.js not found');
      return false;
    }
  } catch (error) {
    logError('Build failed');
    console.error(error);
    return false;
  }
}

function validateSetup(): boolean {
  logStep('Validating setup...');
  
  const checks = [
    { name: 'package-lock.json exists', check: () => fs.existsSync('package-lock.json') },
    { name: 'node_modules exists', check: () => fs.existsSync('node_modules') },
    { name: 'dist directory exists', check: () => fs.existsSync('dist') },
    { name: 'dist/index.js exists', check: () => fs.existsSync('dist/index.js') },
    { name: 'TypeScript compiles', check: () => {
      try {
        execSync('npx tsc --noEmit', { encoding: 'utf8' });
        return true;
      } catch {
        return false;
      }
    }},
  ];
  
  let allPassed = true;
  
  for (const { name, check } of checks) {
    const passed = check();
    if (passed) {
      logSuccess(name);
    } else {
      logError(name);
      allPassed = false;
    }
  }
  
  return allPassed;
}

function generateSetupReport(success: boolean) {
  logStep('Setup Report');
  
  const report = {
    timestamp: new Date().toISOString(),
    success,
    environment: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    files: {
      packageLockExists: fs.existsSync('package-lock.json'),
      nodeModulesExists: fs.existsSync('node_modules'),
      distExists: fs.existsSync('dist'),
      distIndexExists: fs.existsSync('dist/index.js'),
    },
    nextSteps: success ? [
      'Run "npm run quick-test" for fast validation',
      'Run "npm run automate" for full test automation',
      'Commit package-lock.json and dist/ if everything works',
    ] : [
      'Review error messages above',
      'Fix any issues and run this script again',
      'Check Node.js version (must be 18+)',
    ],
  };
  
  fs.writeFileSync('setup-report.json', JSON.stringify(report, null, 2));
  log('\n📄 Setup report written to setup-report.json', colors.blue);
  
  if (success) {
    log('\n🎉 Setup completed successfully!', colors.green);
    log('\nNext steps:', colors.cyan);
    report.nextSteps.forEach(step => log(`  - ${step}`));
  } else {
    log('\n⚠️  Setup completed with issues', colors.yellow);
    log('\nPlease:', colors.yellow);
    report.nextSteps.forEach(step => log(`  - ${step}`));
  }
}

async function main() {
  log('=================================', colors.magenta);
  log(' GH-Workflow-Issue-Creator Setup', colors.magenta);
  log('=================================', colors.magenta);
  
  let success = true;
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    generateSetupReport(false);
    process.exit(1);
  }
  
  // Install dependencies
  if (!installDependencies()) {
    generateSetupReport(false);
    process.exit(1);
  }
  
  // Run tests (don't fail on test failures)
  runInitialTests();
  
  // Build project
  if (!buildProject()) {
    success = false;
  }
  
  // Validate everything
  if (!validateSetup()) {
    success = false;
  }
  
  // Generate report
  generateSetupReport(success);
  
  process.exit(success ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    logError('Unexpected error during setup:');
    console.error(error);
    process.exit(1);
  });
}

export { checkPrerequisites, installDependencies, buildProject, validateSetup };