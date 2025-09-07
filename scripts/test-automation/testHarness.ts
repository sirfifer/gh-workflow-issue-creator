/**
 * Test Automation Harness
 * Core engine for automated testing, error analysis, and fix generation
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface TestError {
  type: 'compilation' | 'test' | 'coverage' | 'build' | 'lint' | 'security';
  file?: string;
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  code?: string;
}

export interface CoverageData {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

export interface FixRequest {
  iteration: number;
  phase: 'setup' | 'compilation' | 'test' | 'coverage' | 'build' | 'validation';
  errors: TestError[];
  coverage?: CoverageData;
  timestamp: string;
  nextSteps: string[];
  autoFixable: boolean;
  suggestedFixes: string[];
}

export interface HarnessResult {
  success: boolean;
  phase: string;
  errors: TestError[];
  coverage?: CoverageData;
  duration: number;
  fixRequest?: FixRequest;
}

export class TestHarness {
  private iteration: number = 0;
  private logFile: string = 'test-automation.log';
  private fixRequestFile: string = '.fix-request.json';
  private maxTimeout: number = 120000; // 2 minutes
  
  constructor(private config: {
    verbose?: boolean;
    maxIterations?: number;
    autoFix?: boolean;
  } = {}) {
    this.clearLog();
  }
  
  private clearLog() {
    fs.writeFileSync(this.logFile, `Test Automation Log - ${new Date().toISOString()}\n${'='.repeat(50)}\n\n`);
  }
  
  private log(message: string, level: 'info' | 'error' | 'warning' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
    
    if (this.config.verbose) {
      const colors = {
        info: '\x1b[36m',
        error: '\x1b[31m',
        warning: '\x1b[33m',
        success: '\x1b[32m',
      };
      console.log(`${colors[level]}${message}\x1b[0m`);
    }
  }
  
  async runIteration(): Promise<HarnessResult> {
    this.iteration++;
    this.log(`\nStarting iteration ${this.iteration}`, 'info');
    const startTime = Date.now();
    
    // Phase 1: Check setup
    const setupResult = await this.checkSetup();
    if (!setupResult.success) {
      return this.createResult('setup', false, setupResult.errors, Date.now() - startTime);
    }
    
    // Phase 2: Compilation
    const compileResult = await this.checkCompilation();
    if (!compileResult.success) {
      return this.createResult('compilation', false, compileResult.errors, Date.now() - startTime);
    }
    
    // Phase 3: Linting
    const lintResult = await this.checkLinting();
    if (!lintResult.success && !this.config.autoFix) {
      return this.createResult('lint', false, lintResult.errors, Date.now() - startTime);
    }
    
    // Phase 4: Tests
    const testResult = await this.runTests();
    if (!testResult.success) {
      return this.createResult('test', false, testResult.errors, Date.now() - startTime, testResult.coverage);
    }
    
    // Phase 5: Coverage
    const coverageResult = await this.checkCoverage();
    if (!coverageResult.success) {
      return this.createResult('coverage', false, coverageResult.errors, Date.now() - startTime, coverageResult.coverage);
    }
    
    // Phase 6: Build
    const buildResult = await this.checkBuild();
    if (!buildResult.success) {
      return this.createResult('build', false, buildResult.errors, Date.now() - startTime);
    }
    
    // Phase 7: Validation
    const validationResult = await this.validateAction();
    if (!validationResult.success) {
      return this.createResult('validation', false, validationResult.errors, Date.now() - startTime);
    }
    
    this.log('All checks passed!', 'success');
    return this.createResult('complete', true, [], Date.now() - startTime);
  }
  
  private async checkSetup(): Promise<{ success: boolean; errors: TestError[] }> {
    this.log('Checking project setup...', 'info');
    const errors: TestError[] = [];
    
    if (!fs.existsSync('package-lock.json')) {
      errors.push({
        type: 'compilation',
        message: 'package-lock.json not found',
        suggestion: 'Run "npm install" to create package-lock.json',
      });
    }
    
    if (!fs.existsSync('node_modules')) {
      errors.push({
        type: 'compilation',
        message: 'node_modules directory not found',
        suggestion: 'Run "npm install" to install dependencies',
      });
    }
    
    return { success: errors.length === 0, errors };
  }
  
  private async checkCompilation(): Promise<{ success: boolean; errors: TestError[] }> {
    this.log('Checking TypeScript compilation...', 'info');
    
    try {
      execSync('npx tsc --noEmit', { encoding: 'utf8', stdio: 'pipe' });
      this.log('TypeScript compilation successful', 'success');
      return { success: true, errors: [] };
    } catch (error: any) {
      const errors = this.parseTypeScriptErrors(error.stdout || error.message);
      this.log(`TypeScript compilation failed with ${errors.length} errors`, 'error');
      return { success: false, errors };
    }
  }
  
  private parseTypeScriptErrors(output: string): TestError[] {
    const errors: TestError[] = [];
    const lines = output.split('\n');
    
    for (const line of lines) {
      // Parse TypeScript error format: file(line,column): error TS####: message
      const match = line.match(/^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$/);
      if (match) {
        const [, file, lineNum, colNum, code, message] = match;
        errors.push({
          type: 'compilation',
          file,
          line: parseInt(lineNum),
          column: parseInt(colNum),
          message,
          code,
          suggestion: this.getTypeScriptFixSuggestion(code, message),
        });
      }
    }
    
    return errors;
  }
  
  private getTypeScriptFixSuggestion(code: string, message: string): string {
    const suggestions: Record<string, string> = {
      'TS2307': 'Check import paths and ensure the module exists',
      'TS2339': 'Add the missing property or check the type definition',
      'TS2345': 'Check argument types match the function signature',
      'TS2322': 'Ensure the assigned value matches the expected type',
      'TS7006': 'Add explicit type annotations',
      'TS2304': 'Import or declare the missing identifier',
    };
    
    return suggestions[code] || 'Review TypeScript documentation for this error';
  }
  
  private async checkLinting(): Promise<{ success: boolean; errors: TestError[] }> {
    this.log('Running ESLint...', 'info');
    
    try {
      execSync('npm run lint', { encoding: 'utf8', stdio: 'pipe' });
      this.log('Linting passed', 'success');
      return { success: true, errors: [] };
    } catch (error: any) {
      const errors = this.parseESLintErrors(error.stdout || error.message);
      this.log(`Linting failed with ${errors.length} errors`, 'warning');
      
      if (this.config.autoFix) {
        this.log('Attempting auto-fix...', 'info');
        try {
          execSync('npx eslint . --ext .ts --fix', { stdio: 'pipe' });
          this.log('Auto-fix applied', 'success');
          return { success: true, errors: [] };
        } catch {
          return { success: false, errors };
        }
      }
      
      return { success: false, errors };
    }
  }
  
  private parseESLintErrors(output: string): TestError[] {
    const errors: TestError[] = [];
    // Simplified parsing - real implementation would be more robust
    const lines = output.split('\n');
    
    for (const line of lines) {
      if (line.includes('error') && line.includes(':')) {
        errors.push({
          type: 'lint',
          message: line.trim(),
          suggestion: 'Run "npm run lint -- --fix" to auto-fix some issues',
        });
      }
    }
    
    return errors;
  }
  
  private async runTests(): Promise<{ success: boolean; errors: TestError[]; coverage?: CoverageData }> {
    this.log('Running tests...', 'info');
    
    try {
      const output = execSync('npm test', { encoding: 'utf8', stdio: 'pipe' });
      this.log('All tests passed', 'success');
      
      // Try to extract coverage data
      const coverage = this.extractCoverageFromOutput(output);
      
      return { success: true, errors: [], coverage };
    } catch (error: any) {
      const errors = this.parseTestErrors(error.stdout || error.message);
      const coverage = this.extractCoverageFromOutput(error.stdout || '');
      
      this.log(`Tests failed with ${errors.length} errors`, 'error');
      return { success: false, errors, coverage };
    }
  }
  
  private parseTestErrors(output: string): TestError[] {
    const errors: TestError[] = [];
    const lines = output.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for test failures
      if (line.includes('✗') || line.includes('FAIL')) {
        const testName = line.replace(/.*✗\s*/, '').replace(/.*FAIL\s*/, '').trim();
        const nextLines = lines.slice(i + 1, i + 5).join('\n');
        
        errors.push({
          type: 'test',
          message: `Test failed: ${testName}`,
          suggestion: 'Review test implementation and fix the failing assertion',
          code: nextLines,
        });
      }
    }
    
    return errors;
  }
  
  private extractCoverageFromOutput(output: string): CoverageData | undefined {
    // Look for coverage summary in output
    const coverageMatch = output.match(/Statements\s*:\s*([\d.]+)%.*Branches\s*:\s*([\d.]+)%.*Functions\s*:\s*([\d.]+)%.*Lines\s*:\s*([\d.]+)%/s);
    
    if (coverageMatch) {
      return {
        statements: parseFloat(coverageMatch[1]),
        branches: parseFloat(coverageMatch[2]),
        functions: parseFloat(coverageMatch[3]),
        lines: parseFloat(coverageMatch[4]),
      };
    }
    
    return undefined;
  }
  
  private async checkCoverage(): Promise<{ success: boolean; errors: TestError[]; coverage?: CoverageData }> {
    this.log('Checking test coverage...', 'info');
    
    try {
      const output = execSync('npx vitest run --coverage', { encoding: 'utf8', stdio: 'pipe' });
      const coverage = this.extractCoverageFromOutput(output);
      
      if (!coverage) {
        return {
          success: false,
          errors: [{
            type: 'coverage',
            message: 'Could not extract coverage data',
            suggestion: 'Ensure coverage reporter is configured correctly',
          }],
        };
      }
      
      // Check if coverage meets 100% requirement
      const meets100 = coverage.statements === 100 && 
                       coverage.branches === 100 && 
                       coverage.functions === 100 && 
                       coverage.lines === 100;
      
      if (!meets100) {
        const errors: TestError[] = [];
        
        if (coverage.statements < 100) {
          errors.push({
            type: 'coverage',
            message: `Statement coverage is ${coverage.statements}%, needs 100%`,
            suggestion: 'Add tests for uncovered statements',
          });
        }
        
        if (coverage.branches < 100) {
          errors.push({
            type: 'coverage',
            message: `Branch coverage is ${coverage.branches}%, needs 100%`,
            suggestion: 'Add tests for all conditional branches',
          });
        }
        
        if (coverage.functions < 100) {
          errors.push({
            type: 'coverage',
            message: `Function coverage is ${coverage.functions}%, needs 100%`,
            suggestion: 'Add tests for uncovered functions',
          });
        }
        
        if (coverage.lines < 100) {
          errors.push({
            type: 'coverage',
            message: `Line coverage is ${coverage.lines}%, needs 100%`,
            suggestion: 'Add tests for uncovered lines',
          });
        }
        
        this.log('Coverage does not meet 100% requirement', 'error');
        return { success: false, errors, coverage };
      }
      
      this.log('Coverage meets 100% requirement', 'success');
      return { success: true, errors: [], coverage };
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          type: 'coverage',
          message: 'Failed to run coverage analysis',
          suggestion: 'Check vitest configuration and try running manually',
        }],
      };
    }
  }
  
  private async checkBuild(): Promise<{ success: boolean; errors: TestError[] }> {
    this.log('Building project...', 'info');
    
    try {
      execSync('npm run build', { encoding: 'utf8', stdio: 'pipe' });
      
      // Verify dist/index.js exists
      if (!fs.existsSync('dist/index.js')) {
        return {
          success: false,
          errors: [{
            type: 'build',
            message: 'Build succeeded but dist/index.js not found',
            suggestion: 'Check ncc configuration in package.json',
          }],
        };
      }
      
      this.log('Build successful', 'success');
      return { success: true, errors: [] };
    } catch (error: any) {
      return {
        success: false,
        errors: [{
          type: 'build',
          message: 'Build failed',
          suggestion: 'Fix compilation errors before building',
          code: error.message,
        }],
      };
    }
  }
  
  private async validateAction(): Promise<{ success: boolean; errors: TestError[] }> {
    this.log('Validating GitHub Action...', 'info');
    const errors: TestError[] = [];
    
    // Check action.yml exists
    if (!fs.existsSync('action.yml')) {
      errors.push({
        type: 'build',
        message: 'action.yml not found',
        suggestion: 'Ensure action.yml exists in the root directory',
      });
      return { success: false, errors };
    }
    
    // Validate action.yml structure
    try {
      const content = fs.readFileSync('action.yml', 'utf8');
      
      if (!content.includes('name:')) {
        errors.push({
          type: 'build',
          message: 'action.yml missing name field',
          suggestion: 'Add a name field to action.yml',
        });
      }
      
      if (!content.includes('description:')) {
        errors.push({
          type: 'build',
          message: 'action.yml missing description field',
          suggestion: 'Add a description field to action.yml',
        });
      }
      
      if (!content.includes('runs:')) {
        errors.push({
          type: 'build',
          message: 'action.yml missing runs configuration',
          suggestion: 'Add runs configuration to action.yml',
        });
      }
      
      if (!content.includes('main: \'dist/index.js\'')) {
        errors.push({
          type: 'build',
          message: 'action.yml not pointing to dist/index.js',
          suggestion: 'Ensure runs.main points to dist/index.js',
        });
      }
    } catch (error: any) {
      errors.push({
        type: 'build',
        message: 'Failed to read action.yml',
        suggestion: 'Check file permissions and format',
      });
    }
    
    if (errors.length > 0) {
      this.log(`Action validation failed with ${errors.length} errors`, 'error');
      return { success: false, errors };
    }
    
    this.log('Action validation passed', 'success');
    return { success: true, errors: [] };
  }
  
  private createResult(
    phase: string,
    success: boolean,
    errors: TestError[],
    duration: number,
    coverage?: CoverageData
  ): HarnessResult {
    const result: HarnessResult = {
      success,
      phase,
      errors,
      duration,
      coverage,
    };
    
    if (!success) {
      result.fixRequest = this.generateFixRequest(phase, errors, coverage);
      this.saveFixRequest(result.fixRequest);
    }
    
    return result;
  }
  
  private generateFixRequest(phase: string, errors: TestError[], coverage?: CoverageData): FixRequest {
    const request: FixRequest = {
      iteration: this.iteration,
      phase: phase as any,
      errors,
      coverage,
      timestamp: new Date().toISOString(),
      nextSteps: [],
      autoFixable: false,
      suggestedFixes: [],
    };
    
    // Generate next steps based on phase and errors
    switch (phase) {
      case 'setup':
        request.nextSteps.push('Run "npm install" to install dependencies');
        request.nextSteps.push('Ensure Node.js 18+ is installed');
        break;
      
      case 'compilation':
        request.nextSteps.push('Fix TypeScript compilation errors');
        request.nextSteps.push('Check import paths and type definitions');
        request.autoFixable = true;
        break;
      
      case 'test':
        request.nextSteps.push('Fix failing tests');
        request.nextSteps.push('Add missing test implementations');
        break;
      
      case 'coverage':
        request.nextSteps.push('Add tests for uncovered code');
        request.nextSteps.push('Check coverage report for details');
        break;
      
      case 'build':
        request.nextSteps.push('Fix build configuration');
        request.nextSteps.push('Ensure all dependencies are installed');
        break;
    }
    
    // Add suggested fixes
    for (const error of errors) {
      if (error.suggestion) {
        request.suggestedFixes.push(error.suggestion);
      }
    }
    
    return request;
  }
  
  private saveFixRequest(request: FixRequest) {
    fs.writeFileSync(this.fixRequestFile, JSON.stringify(request, null, 2));
    this.log(`Fix request saved to ${this.fixRequestFile}`, 'info');
  }
  
  getIterationCount(): number {
    return this.iteration;
  }
  
  getLastFixRequest(): FixRequest | null {
    if (fs.existsSync(this.fixRequestFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.fixRequestFile, 'utf8'));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default TestHarness;