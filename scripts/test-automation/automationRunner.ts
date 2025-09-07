#!/usr/bin/env node

/**
 * Automation Runner
 * Orchestrates iterative testing and fixing until all tests pass
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestHarness, HarnessResult, FixRequest } from './testHarness';
import { execSync } from 'child_process';

interface AutomationConfig {
  maxIterations: number;
  autoFix: boolean;
  verbose: boolean;
  stopOnFirstSuccess: boolean;
  pauseBetweenIterations: number; // milliseconds
}

interface AutomationReport {
  startTime: string;
  endTime: string;
  totalIterations: number;
  successful: boolean;
  finalPhase: string;
  history: IterationHistory[];
  finalCoverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
  recommendations: string[];
}

interface IterationHistory {
  iteration: number;
  phase: string;
  success: boolean;
  errorCount: number;
  duration: number;
  coverage?: {
    statements: number;
    branches: number;
    functions: number;
    lines: number;
  };
}

class AutomationRunner {
  private config: AutomationConfig;
  private harness: TestHarness;
  private history: IterationHistory[] = [];
  private startTime: Date;
  
  constructor(config?: Partial<AutomationConfig>) {
    this.config = {
      maxIterations: 50,
      autoFix: true,
      verbose: true,
      stopOnFirstSuccess: true,
      pauseBetweenIterations: 1000,
      ...config,
    };
    
    this.harness = new TestHarness({
      verbose: this.config.verbose,
      autoFix: this.config.autoFix,
    });
    
    this.startTime = new Date();
  }
  
  private log(message: string, level: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
    };
    
    const icons = {
      info: 'ℹ️ ',
      success: '✅',
      error: '❌',
      warning: '⚠️ ',
    };
    
    console.log(`${colors[level]}${icons[level]} ${message}\x1b[0m`);
  }
  
  private printBanner() {
    console.log('\x1b[35m');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║     GH-Workflow-Issue-Creator Automation     ║');
    console.log('║           Build-to-Test System v1.0          ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('\x1b[0m\n');
    
    this.log(`Configuration:`, 'info');
    console.log(`  • Max Iterations: ${this.config.maxIterations}`);
    console.log(`  • Auto-Fix: ${this.config.autoFix ? 'Enabled' : 'Disabled'}`);
    console.log(`  • Verbose: ${this.config.verbose ? 'Yes' : 'No'}`);
    console.log(`  • Stop on Success: ${this.config.stopOnFirstSuccess ? 'Yes' : 'No'}`);
    console.log('');
  }
  
  async run(): Promise<AutomationReport> {
    this.printBanner();
    this.log('Starting automation...', 'info');
    
    let successful = false;
    let finalPhase = 'initialization';
    let iteration = 0;
    
    // First, ensure basic setup
    if (!await this.ensureBasicSetup()) {
      this.log('Basic setup failed. Please run "npm run setup:first-time" first', 'error');
      return this.generateReport(false, 'setup');
    }
    
    // Run iterations
    for (iteration = 1; iteration <= this.config.maxIterations; iteration++) {
      this.log(`\n═══ Iteration ${iteration}/${this.config.maxIterations} ═══`, 'info');
      
      const result = await this.harness.runIteration();
      
      // Record history
      this.history.push({
        iteration,
        phase: result.phase,
        success: result.success,
        errorCount: result.errors.length,
        duration: result.duration,
        coverage: result.coverage,
      });
      
      // Update final phase
      finalPhase = result.phase;
      
      // Handle result
      if (result.success) {
        this.log('All tests passed! 🎉', 'success');
        successful = true;
        
        if (this.config.stopOnFirstSuccess) {
          break;
        }
      } else {
        this.log(`Phase '${result.phase}' failed with ${result.errors.length} errors`, 'error');
        
        // Show errors
        if (this.config.verbose && result.errors.length > 0) {
          console.log('\nErrors:');
          result.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message}`);
            if (error.suggestion) {
              console.log(`     💡 ${error.suggestion}`);
            }
          });
        }
        
        // Attempt auto-fix if enabled
        if (this.config.autoFix && result.fixRequest) {
          const fixed = await this.attemptAutoFix(result.fixRequest);
          if (fixed) {
            this.log('Applied automatic fixes', 'success');
          }
        }
        
        // Show coverage if available
        if (result.coverage) {
          this.printCoverage(result.coverage);
        }
      }
      
      // Pause between iterations
      if (iteration < this.config.maxIterations && !successful) {
        await this.pause(this.config.pauseBetweenIterations);
      }
    }
    
    // Generate and save report
    const report = this.generateReport(successful, finalPhase);
    this.saveReport(report);
    
    // Print summary
    this.printSummary(report);
    
    return report;
  }
  
  private async ensureBasicSetup(): Promise<boolean> {
    this.log('Checking basic setup...', 'info');
    
    // Check if package-lock.json exists
    if (!fs.existsSync('package-lock.json')) {
      this.log('package-lock.json not found. Installing dependencies...', 'warning');
      try {
        execSync('npm install', { stdio: 'inherit' });
        this.log('Dependencies installed', 'success');
      } catch (error) {
        this.log('Failed to install dependencies', 'error');
        return false;
      }
    }
    
    // Check if node_modules exists
    if (!fs.existsSync('node_modules')) {
      this.log('node_modules not found. Installing dependencies...', 'warning');
      try {
        execSync('npm ci', { stdio: 'inherit' });
        this.log('Dependencies installed from lock file', 'success');
      } catch (error) {
        this.log('Failed to install dependencies', 'error');
        return false;
      }
    }
    
    return true;
  }
  
  private async attemptAutoFix(fixRequest: FixRequest): Promise<boolean> {
    this.log('Attempting automatic fixes...', 'info');
    let fixedSomething = false;
    
    // Auto-fix based on error types
    for (const error of fixRequest.errors) {
      switch (error.type) {
        case 'lint':
          // Try ESLint auto-fix
          try {
            execSync('npx eslint . --ext .ts --fix', { stdio: 'pipe' });
            this.log('Applied ESLint auto-fixes', 'success');
            fixedSomething = true;
          } catch {
            // Silent fail
          }
          break;
        
        case 'compilation':
          // Check for common TypeScript issues
          if (error.code === 'TS2307') {
            // Missing module - try to install types
            const moduleMatch = error.message.match(/Cannot find module '(.+?)'/);
            if (moduleMatch) {
              const moduleName = moduleMatch[1];
              if (moduleName.startsWith('@types/')) {
                try {
                  execSync(`npm install --save-dev ${moduleName}`, { stdio: 'pipe' });
                  this.log(`Installed ${moduleName}`, 'success');
                  fixedSomething = true;
                } catch {
                  // Silent fail
                }
              }
            }
          }
          break;
        
        case 'coverage':
          // Can't auto-fix coverage, but can suggest
          this.log('Coverage issues require manual test creation', 'warning');
          break;
      }
    }
    
    return fixedSomething;
  }
  
  private printCoverage(coverage: { statements: number; branches: number; functions: number; lines: number }) {
    console.log('\n📊 Coverage Report:');
    
    const formatPercent = (value: number) => {
      const color = value === 100 ? '\x1b[32m' : value >= 80 ? '\x1b[33m' : '\x1b[31m';
      return `${color}${value.toFixed(1)}%\x1b[0m`;
    };
    
    console.log(`  • Statements: ${formatPercent(coverage.statements)}`);
    console.log(`  • Branches:   ${formatPercent(coverage.branches)}`);
    console.log(`  • Functions:  ${formatPercent(coverage.functions)}`);
    console.log(`  • Lines:      ${formatPercent(coverage.lines)}`);
  }
  
  private async pause(milliseconds: number) {
    if (milliseconds > 0) {
      await new Promise(resolve => setTimeout(resolve, milliseconds));
    }
  }
  
  private generateReport(successful: boolean, finalPhase: string): AutomationReport {
    const endTime = new Date();
    
    // Get final coverage from last iteration with coverage data
    const lastCoverage = [...this.history]
      .reverse()
      .find(h => h.coverage)?.coverage;
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (!successful) {
      switch (finalPhase) {
        case 'setup':
          recommendations.push('Ensure Node.js 18+ is installed');
          recommendations.push('Run "npm install" manually');
          break;
        
        case 'compilation':
          recommendations.push('Fix TypeScript compilation errors');
          recommendations.push('Check all import statements');
          recommendations.push('Ensure all types are properly defined');
          break;
        
        case 'test':
          recommendations.push('Review failing test cases');
          recommendations.push('Add missing test implementations');
          recommendations.push('Check test fixtures and mocks');
          break;
        
        case 'coverage':
          recommendations.push('Add tests for uncovered code paths');
          recommendations.push('Focus on untested branches and functions');
          recommendations.push('Run "npm test -- --coverage" to see detailed report');
          break;
        
        case 'build':
          recommendations.push('Check build configuration');
          recommendations.push('Ensure all dependencies are installed');
          recommendations.push('Verify ncc bundler configuration');
          break;
      }
    }
    
    return {
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      totalIterations: this.history.length,
      successful,
      finalPhase,
      history: this.history,
      finalCoverage: lastCoverage,
      recommendations,
    };
  }
  
  private saveReport(report: AutomationReport) {
    const reportPath = 'automation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Report saved to ${reportPath}`, 'info');
  }
  
  private printSummary(report: AutomationReport) {
    console.log('\n');
    console.log('\x1b[36m╔══════════════════════════════════════════════╗\x1b[0m');
    console.log('\x1b[36m║              AUTOMATION SUMMARY              ║\x1b[0m');
    console.log('\x1b[36m╚══════════════════════════════════════════════╝\x1b[0m');
    console.log('');
    
    const duration = new Date(report.endTime).getTime() - new Date(report.startTime).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    console.log(`📈 Statistics:`);
    console.log(`  • Total Iterations: ${report.totalIterations}`);
    console.log(`  • Duration: ${minutes}m ${seconds}s`);
    console.log(`  • Final Phase: ${report.finalPhase}`);
    console.log(`  • Result: ${report.successful ? '\x1b[32m✅ SUCCESS\x1b[0m' : '\x1b[31m❌ FAILED\x1b[0m'}`);
    
    if (report.finalCoverage) {
      console.log('\n📊 Final Coverage:');
      this.printCoverage(report.finalCoverage);
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }
    
    // Phase progression
    console.log('\n📈 Phase Progression:');
    const phaseMap = new Map<string, number>();
    report.history.forEach(h => {
      phaseMap.set(h.phase, (phaseMap.get(h.phase) || 0) + 1);
    });
    
    phaseMap.forEach((count, phase) => {
      const bar = '█'.repeat(Math.min(count, 30));
      console.log(`  ${phase.padEnd(12)} ${bar} (${count})`);
    });
    
    if (report.successful) {
      console.log('\n');
      console.log('\x1b[32m');
      console.log('🎉 SUCCESS! All tests are passing!');
      console.log('The project is ready for use.');
      console.log('\x1b[0m');
      console.log('\nNext steps:');
      console.log('  1. Commit package-lock.json and dist/');
      console.log('  2. Push changes to repository');
      console.log('  3. Tag a release version');
      console.log('  4. Test in a real GitHub workflow');
    } else {
      console.log('\n');
      console.log('\x1b[33m');
      console.log('⚠️  Automation completed with issues.');
      console.log('Manual intervention required.');
      console.log('\x1b[0m');
      console.log('\nNext steps:');
      console.log('  1. Review .fix-request.json for specific issues');
      console.log('  2. Check test-automation.log for details');
      console.log('  3. Fix the issues manually');
      console.log('  4. Run automation again');
    }
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const config: Partial<AutomationConfig> = {};
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--max-iterations':
        config.maxIterations = parseInt(args[++i]);
        break;
      case '--no-auto-fix':
        config.autoFix = false;
        break;
      case '--quiet':
        config.verbose = false;
        break;
      case '--continue-on-success':
        config.stopOnFirstSuccess = false;
        break;
      case '--pause':
        config.pauseBetweenIterations = parseInt(args[++i]);
        break;
      case '--help':
        console.log('Usage: automation-runner [options]');
        console.log('');
        console.log('Options:');
        console.log('  --max-iterations <n>    Maximum iterations (default: 50)');
        console.log('  --no-auto-fix          Disable automatic fixes');
        console.log('  --quiet                Reduce output verbosity');
        console.log('  --continue-on-success  Continue even after success');
        console.log('  --pause <ms>           Pause between iterations (default: 1000)');
        console.log('  --help                 Show this help');
        process.exit(0);
    }
  }
  
  const runner = new AutomationRunner(config);
  const report = await runner.run();
  
  // Exit with appropriate code
  process.exit(report.successful ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('\x1b[31m❌ Unexpected error:\x1b[0m', error);
    process.exit(1);
  });
}

export { AutomationRunner, AutomationConfig, AutomationReport };