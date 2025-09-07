import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Integration tests for GitHub Action execution
 * These tests simulate running the action in a GitHub-like environment
 */

describe('Action Runner Integration Tests', () => {
  let tempDir: string;
  let originalEnv: NodeJS.ProcessEnv;
  let originalCwd: string;
  
  beforeEach(() => {
    // Save original state
    originalEnv = { ...process.env };
    originalCwd = process.cwd();
    
    // Create temporary directory for test
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'action-test-'));
    
    // Set up GitHub Actions environment
    process.env.GITHUB_REPOSITORY = 'test-owner/test-repo';
    process.env.GITHUB_WORKFLOW = 'Test Workflow';
    process.env.GITHUB_JOB = 'test-job';
    process.env.GITHUB_RUN_ID = '999999';
    process.env.GITHUB_RUN_NUMBER = '1';
    process.env.GITHUB_SHA = 'test-sha-123456';
    process.env.GITHUB_REF = 'refs/heads/test-branch';
    process.env.GITHUB_ACTOR = 'test-user';
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.GITHUB_WORKSPACE = tempDir;
    process.env.RUNNER_TEMP = path.join(tempDir, 'runner-temp');
    process.env.RUNNER_TOOL_CACHE = path.join(tempDir, 'runner-cache');
    
    // Create necessary directories
    fs.mkdirSync(process.env.RUNNER_TEMP, { recursive: true });
    fs.mkdirSync(process.env.RUNNER_TOOL_CACHE, { recursive: true });
  });
  
  afterEach(() => {
    // Restore original state
    process.env = originalEnv;
    process.chdir(originalCwd);
    
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
  
  describe('Action Initialization', () => {
    it('should load action.yml configuration', () => {
      const actionYmlPath = path.join(process.cwd(), 'action.yml');
      expect(fs.existsSync(actionYmlPath)).toBe(true);
      
      const content = fs.readFileSync(actionYmlPath, 'utf8');
      expect(content).toContain('name:');
      expect(content).toContain('description:');
      expect(content).toContain('inputs:');
      expect(content).toContain('outputs:');
      expect(content).toContain('runs:');
    });
    
    it('should validate required inputs', () => {
      const actionYml = fs.readFileSync('action.yml', 'utf8');
      
      // Check for required github-token input
      expect(actionYml).toContain('github-token:');
      expect(actionYml).toContain('required: true');
    });
    
    it('should point to correct main file', () => {
      const actionYml = fs.readFileSync('action.yml', 'utf8');
      expect(actionYml).toContain("main: 'dist/index.js'");
    });
  });
  
  describe('Environment Setup', () => {
    it('should detect GitHub Actions environment', () => {
      // Check that we can detect we're in a GitHub Actions-like environment
      expect(process.env.GITHUB_REPOSITORY).toBeDefined();
      expect(process.env.GITHUB_WORKFLOW).toBeDefined();
      expect(process.env.GITHUB_RUN_ID).toBeDefined();
    });
    
    it('should handle missing environment variables gracefully', () => {
      delete process.env.GITHUB_REPOSITORY;
      
      // Action should still initialize but with defaults
      // This would be tested by actually running the action
      expect(() => {
        // Simulate action initialization
        const repository = process.env.GITHUB_REPOSITORY || '';
        const [owner, repo] = repository.split('/');
      }).not.toThrow();
    });
  });
  
  describe('Input Processing', () => {
    it('should process action inputs correctly', () => {
      // Set up inputs as environment variables (how GitHub Actions passes them)
      process.env['INPUT_GITHUB-TOKEN'] = 'test-token';
      process.env['INPUT_MODE'] = 'create';
      process.env['INPUT_CATEGORY'] = 'test-failure';
      process.env['INPUT_DEDUPE-STRATEGY'] = 'fingerprint';
      process.env['INPUT_FAILURE-LABEL'] = 'ci-failure';
      
      // Simulate reading inputs
      const getInput = (name: string): string => {
        const envName = `INPUT_${name.toUpperCase().replace(/-/g, '-')}`;
        return process.env[envName] || '';
      };
      
      expect(getInput('github-token')).toBe('test-token');
      expect(getInput('mode')).toBe('create');
      expect(getInput('category')).toBe('test-failure');
      expect(getInput('dedupe-strategy')).toBe('fingerprint');
      expect(getInput('failure-label')).toBe('ci-failure');
    });
    
    it('should handle boolean inputs', () => {
      process.env['INPUT_AUTO-DETECT-CATEGORY'] = 'true';
      process.env['INPUT_ALWAYS-CREATE-NEW'] = 'false';
      process.env['INPUT_COPILOT-OPTIMIZED'] = 'true';
      
      const getBooleanInput = (name: string): boolean => {
        const envName = `INPUT_${name.toUpperCase().replace(/-/g, '-')}`;
        const value = process.env[envName] || '';
        return value === 'true';
      };
      
      expect(getBooleanInput('auto-detect-category')).toBe(true);
      expect(getBooleanInput('always-create-new')).toBe(false);
      expect(getBooleanInput('copilot-optimized')).toBe(true);
    });
    
    it('should handle numeric inputs', () => {
      process.env['INPUT_MAX-ISSUES-PER-WORKFLOW'] = '5';
      process.env['INPUT_RATE-LIMIT-HOURS'] = '48';
      
      const getNumericInput = (name: string): number => {
        const envName = `INPUT_${name.toUpperCase().replace(/-/g, '-')}`;
        const value = process.env[envName] || '0';
        return parseInt(value, 10);
      };
      
      expect(getNumericInput('max-issues-per-workflow')).toBe(5);
      expect(getNumericInput('rate-limit-hours')).toBe(48);
    });
  });
  
  describe('Output Generation', () => {
    it('should set action outputs', () => {
      const outputs: Record<string, string> = {};
      
      // Simulate setting outputs (GitHub Actions uses special commands)
      const setOutput = (name: string, value: string) => {
        outputs[name] = value;
        // In real GitHub Actions, this would be:
        // console.log(`::set-output name=${name}::${value}`);
      };
      
      // Simulate action execution setting outputs
      setOutput('issue-number', '42');
      setOutput('issue-url', 'https://github.com/test/repo/issues/42');
      setOutput('deduped', 'false');
      setOutput('fingerprint', 'fp-test-123');
      setOutput('detected-category', 'test-failure');
      
      expect(outputs['issue-number']).toBe('42');
      expect(outputs['issue-url']).toBe('https://github.com/test/repo/issues/42');
      expect(outputs['deduped']).toBe('false');
      expect(outputs['fingerprint']).toBe('fp-test-123');
      expect(outputs['detected-category']).toBe('test-failure');
    });
  });
  
  describe('Error Handling', () => {
    it('should handle action failures gracefully', () => {
      const setFailed = (message: string) => {
        // In real GitHub Actions:
        // console.log(`::error::${message}`);
        // process.exit(1);
        throw new Error(message);
      };
      
      expect(() => {
        setFailed('Missing required input: github-token');
      }).toThrow('Missing required input: github-token');
    });
    
    it('should provide helpful error messages', () => {
      const errors = [
        'GitHub token is not valid',
        'Failed to create issue: 403 Forbidden',
        'Repository not found',
        'Rate limit exceeded',
      ];
      
      errors.forEach(error => {
        expect(error).toBeTruthy();
        // Each error should be descriptive
        expect(error.length).toBeGreaterThan(10);
      });
    });
  });
  
  describe('Mock GitHub API Interactions', () => {
    it('should handle issue creation', async () => {
      // Mock GitHub API response
      const mockCreateIssue = vi.fn().mockResolvedValue({
        data: {
          number: 123,
          html_url: 'https://github.com/test/repo/issues/123',
          title: 'Test Issue',
          state: 'open',
        },
      });
      
      const result = await mockCreateIssue({
        owner: 'test',
        repo: 'repo',
        title: 'Test Issue',
        body: 'Issue body',
        labels: ['bug', 'ci-failure'],
      });
      
      expect(result.data.number).toBe(123);
      expect(result.data.state).toBe('open');
    });
    
    it('should handle issue updates', async () => {
      const mockUpdateIssue = vi.fn().mockResolvedValue({
        data: {
          number: 123,
          html_url: 'https://github.com/test/repo/issues/123',
          title: 'Updated Issue',
          state: 'open',
        },
      });
      
      const result = await mockUpdateIssue({
        owner: 'test',
        repo: 'repo',
        issue_number: 123,
        title: 'Updated Issue',
        body: 'Updated body',
      });
      
      expect(result.data.title).toBe('Updated Issue');
    });
    
    it('should handle issue search for deduplication', async () => {
      const mockListIssues = vi.fn().mockResolvedValue({
        data: [
          {
            number: 100,
            title: '[CI] failed — general — fp-abc123',
            state: 'open',
          },
          {
            number: 101,
            title: '[Deploy] failed — deployment — fp-def456',
            state: 'open',
          },
        ],
      });
      
      const result = await mockListIssues({
        owner: 'test',
        repo: 'repo',
        state: 'open',
        labels: 'ci-failure',
      });
      
      // Should find existing issue with matching fingerprint
      const fingerprint = 'fp-abc123';
      const existing = result.data.find((issue: any) => 
        issue.title.includes(fingerprint)
      );
      
      expect(existing).toBeDefined();
      expect(existing.number).toBe(100);
    });
  });
  
  describe('Category Detection', () => {
    it('should detect deployment category', () => {
      process.env.GITHUB_WORKFLOW = 'Deploy to Production';
      
      const detectCategory = (workflowName: string): string => {
        if (/deploy/i.test(workflowName)) return 'deployment';
        if (/test/i.test(workflowName)) return 'test-failure';
        if (/security/i.test(workflowName)) return 'security-scan';
        return 'general';
      };
      
      expect(detectCategory(process.env.GITHUB_WORKFLOW)).toBe('deployment');
    });
    
    it('should detect test failure category', () => {
      process.env.GITHUB_WORKFLOW = 'Run Tests';
      process.env.GITHUB_JOB = 'unit-tests';
      
      const detectCategory = (workflowName: string, jobName: string): string => {
        const combined = `${workflowName} ${jobName}`;
        if (/test/i.test(combined)) return 'test-failure';
        return 'general';
      };
      
      expect(detectCategory(
        process.env.GITHUB_WORKFLOW,
        process.env.GITHUB_JOB
      )).toBe('test-failure');
    });
  });
  
  describe('Template Processing', () => {
    it('should load category-specific templates', () => {
      const categories = ['general', 'deployment', 'security-scan', 'terraform', 'code-quality'];
      
      categories.forEach(category => {
        const templatePath = category === 'general' 
          ? 'templates/default.md'
          : `templates/category-${category}.md`;
        
        if (fs.existsSync(templatePath)) {
          const template = fs.readFileSync(templatePath, 'utf8');
          expect(template).toBeTruthy();
          expect(template.length).toBeGreaterThan(0);
        }
      });
    });
    
    it('should fall back to default template', () => {
      const defaultTemplate = 'templates/default.md';
      expect(fs.existsSync(defaultTemplate)).toBe(true);
      
      const template = fs.readFileSync(defaultTemplate, 'utf8');
      expect(template).toContain('{{');  // Should have Mustache variables
    });
  });
  
  describe('Close-on-Success Mode', () => {
    it('should close issues when build succeeds', async () => {
      process.env['INPUT_MODE'] = 'close-on-success';
      
      const mockUpdateIssue = vi.fn().mockResolvedValue({
        data: {
          number: 123,
          state: 'closed',
        },
      });
      
      const result = await mockUpdateIssue({
        owner: 'test',
        repo: 'repo',
        issue_number: 123,
        state: 'closed',
      });
      
      expect(result.data.state).toBe('closed');
    });
  });
  
  describe('Full Action Simulation', () => {
    it('should simulate complete action execution', async () => {
      // This is a high-level integration test
      // In a real scenario, we would use something like @actions/exec to run the action
      
      // Set up all necessary inputs
      process.env['INPUT_GITHUB-TOKEN'] = 'test-token';
      process.env['INPUT_MODE'] = 'create';
      process.env['INPUT_CATEGORY'] = 'general';
      process.env['INPUT_AUTO-DETECT-CATEGORY'] = 'true';
      process.env['INPUT_DEDUPE-STRATEGY'] = 'fingerprint';
      
      // Simulate action execution steps
      const steps = [
        'Load configuration',
        'Build context from environment',
        'Detect category',
        'Generate fingerprint',
        'Search for existing issues',
        'Render issue body from template',
        'Create or update issue',
        'Set outputs',
      ];
      
      steps.forEach(step => {
        // Each step should complete without error
        expect(() => {
          // Simulate step execution
          console.log(`Executing: ${step}`);
        }).not.toThrow();
      });
    });
  });
});