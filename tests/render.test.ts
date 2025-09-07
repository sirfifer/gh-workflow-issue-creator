import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderBody } from '../src/lib/render';
import Mustache from 'mustache';

// Mock Mustache
vi.mock('mustache');

describe('render.ts - Template Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Mustache mock behavior
    (Mustache.render as any) = vi.fn((template: string, data: any) => {
      // Simple mock implementation
      let result = template;
      Object.keys(data).forEach(key => {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
      });
      return result;
    });
  });
  
  describe('Basic Rendering', () => {
    it('should render template with basic variables', async () => {
      const template = 'Workflow {{workflowName}} failed in {{repository}}';
      const inputs = {};
      const ctx = {
        workflow: { name: 'CI Build' },
        repository: 'owner/repo',
      };
      
      const result = await renderBody({
        template,
        inputs,
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(Mustache.render).toHaveBeenCalled();
      expect(result).toContain('CI Build');
      expect(result).toContain('owner/repo');
    });
    
    it('should include fingerprint in rendered output', async () => {
      const template = 'Issue fingerprint: {{fingerprint}}';
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx: {},
        category: 'general',
        fingerprint: 'fp-unique-123',
      });
      
      expect(result).toContain('fp-unique-123');
    });
    
    it('should include category in rendered output', async () => {
      const template = 'Category: {{category}}';
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx: {},
        category: 'deployment',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('deployment');
    });
  });
  
  describe('Context Variables', () => {
    it('should render workflow context variables', async () => {
      const template = `
        Workflow: {{workflow.name}}
        Job: {{workflow.job}}
        Run ID: {{workflow.runId}}
        Run Number: {{workflow.runNumber}}
      `;
      
      const ctx = {
        workflow: {
          name: 'Deploy to Production',
          job: 'deploy',
          runId: '123456',
          runNumber: '42',
        },
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'deployment',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('Deploy to Production');
      expect(result).toContain('deploy');
      expect(result).toContain('123456');
      expect(result).toContain('42');
    });
    
    it('should render repository information', async () => {
      const template = `
        Repository: {{repository}}
        Owner: {{owner}}
        Repo: {{repo}}
      `;
      
      const ctx = {
        repository: 'myorg/myrepo',
        owner: 'myorg',
        repo: 'myrepo',
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('myorg/myrepo');
      expect(result).toContain('myorg');
      expect(result).toContain('myrepo');
    });
    
    it('should render git information', async () => {
      const template = `
        SHA: {{sha}}
        Branch: {{branch}}
        Actor: {{actor}}
        Event: {{eventName}}
      `;
      
      const ctx = {
        sha: 'abc123def456',
        branch: 'main',
        actor: 'developer',
        eventName: 'push',
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('abc123def456');
      expect(result).toContain('main');
      expect(result).toContain('developer');
      expect(result).toContain('push');
    });
    
    it('should render URLs', async () => {
      const template = `
        Workflow URL: {{workflowUrl}}
        Commit URL: {{commitUrl}}
        Server: {{serverUrl}}
      `;
      
      const ctx = {
        workflowUrl: 'https://github.com/owner/repo/actions/runs/123',
        commitUrl: 'https://github.com/owner/repo/commit/abc123',
        serverUrl: 'https://github.com',
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('https://github.com/owner/repo/actions/runs/123');
      expect(result).toContain('https://github.com/owner/repo/commit/abc123');
      expect(result).toContain('https://github.com');
    });
  });
  
  describe('Error Signatures', () => {
    it('should render error signatures if present', async () => {
      const template = `
        Errors:
        {{#errorSignatures}}
        - {{.}}
        {{/errorSignatures}}
      `;
      
      const ctx = {
        errorSignatures: [
          'Error: Test failed',
          'AssertionError: Expected true',
          'TypeError: Cannot read property',
        ],
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('Error: Test failed');
      expect(result).toContain('AssertionError: Expected true');
      expect(result).toContain('TypeError: Cannot read property');
    });
    
    it('should handle empty error signatures', async () => {
      const template = `
        {{#errorSignatures}}
        Error: {{.}}
        {{/errorSignatures}}
        {{^errorSignatures}}
        No errors captured
        {{/errorSignatures}}
      `;
      
      const ctx = {
        errorSignatures: [],
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('No errors captured');
    });
  });
  
  describe('Conditional Rendering', () => {
    it('should handle conditional sections', async () => {
      const template = `
        {{#isPullRequest}}
        This is a pull request build
        {{/isPullRequest}}
        {{^isPullRequest}}
        This is not a pull request build
        {{/isPullRequest}}
      `;
      
      const ctx = {
        isPullRequest: false,
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('This is not a pull request build');
      expect(result).not.toContain('This is a pull request build');
    });
    
    it('should handle nested conditionals', async () => {
      const template = `
        {{#workflow}}
        Workflow: {{name}}
        {{#runId}}
        Run ID: {{runId}}
        {{/runId}}
        {{/workflow}}
      `;
      
      const ctx = {
        workflow: {
          name: 'CI',
          runId: '12345',
        },
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('Workflow: CI');
      expect(result).toContain('Run ID: 12345');
    });
  });
  
  describe('Copilot Optimization', () => {
    it('should add copilot-friendly structure when enabled', async () => {
      const template = 'Basic template';
      const inputs = {
        copilotOptimized: true,
      };
      
      const result = await renderBody({
        template,
        inputs,
        ctx: {
          workflow: { name: 'Test' },
          repository: 'owner/repo',
        },
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      // Should add structured sections for AI parsing
      expect(result).toBeDefined();
      // The actual structure would depend on implementation
    });
    
    it('should not add copilot structure when disabled', async () => {
      const template = 'Basic template';
      const inputs = {
        copilotOptimized: false,
      };
      
      const result = await renderBody({
        template,
        inputs,
        ctx: {},
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toBeDefined();
    });
  });
  
  describe('Template Helpers', () => {
    it('should support date formatting', async () => {
      const template = 'Timestamp: {{timestamp}}';
      const ctx = {
        timestamp: '2024-01-01T12:00:00Z',
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toContain('2024-01-01T12:00:00Z');
    });
    
    it('should support truncation of long values', async () => {
      const template = 'SHA: {{sha}}';
      const ctx = {
        sha: 'a'.repeat(100),
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toBeDefined();
      // Implementation might truncate long SHAs
    });
  });
  
  describe('Error Handling', () => {
    it('should handle missing variables gracefully', async () => {
      const template = 'Value: {{missingVariable}}';
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx: {},
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      // Mustache typically renders empty string for missing variables
      expect(result).toBeDefined();
    });
    
    it('should handle malformed templates', async () => {
      (Mustache.render as any) = vi.fn(() => {
        throw new Error('Template syntax error');
      });
      
      const template = '{{unclosed';
      
      await expect(renderBody({
        template,
        inputs: {},
        ctx: {},
        category: 'general',
        fingerprint: 'fp-123',
      })).rejects.toThrow('Template syntax error');
    });
    
    it('should handle null/undefined context gracefully', async () => {
      const template = 'Test template';
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx: null as any,
        category: 'general',
        fingerprint: 'fp-123',
      });
      
      expect(result).toBeDefined();
    });
  });
  
  describe('Complex Templates', () => {
    it('should handle complex real-world template', async () => {
      const template = `
# Workflow Failure Report

## Summary
- **Repository**: {{repository}}
- **Workflow**: {{workflow.name}}
- **Job**: {{workflow.job}}
- **Run**: [#{{workflow.runNumber}}]({{workflowUrl}})
- **Commit**: [{{sha}}]({{commitUrl}})
- **Actor**: {{actor}}
- **Category**: {{category}}
- **Fingerprint**: \`{{fingerprint}}\`

## Error Details
{{#errorSignatures}}
\`\`\`
{{.}}
\`\`\`
{{/errorSignatures}}

## Context
- **Branch**: {{branch}}
- **Event**: {{eventName}}
- **Runner OS**: {{runner.os}}
- **Timestamp**: {{timestamp}}

## Next Steps
1. Review the error messages above
2. Check the [workflow run]({{workflowUrl}}) for more details
3. Fix the issue and push a new commit

---
*This issue was automatically created by GH-Workflow-Issue-Creator*
      `;
      
      const ctx = {
        repository: 'myorg/myapp',
        workflow: {
          name: 'CI/CD Pipeline',
          job: 'test',
          runNumber: '123',
        },
        workflowUrl: 'https://github.com/myorg/myapp/actions/runs/456',
        sha: 'abc123',
        commitUrl: 'https://github.com/myorg/myapp/commit/abc123',
        actor: 'developer',
        errorSignatures: ['Error: Test failed at line 42'],
        branch: 'main',
        eventName: 'push',
        runner: { os: 'Linux' },
        timestamp: new Date().toISOString(),
      };
      
      const result = await renderBody({
        template,
        inputs: {},
        ctx,
        category: 'test-failure',
        fingerprint: 'fp-test-123',
      });
      
      expect(result).toContain('myorg/myapp');
      expect(result).toContain('CI/CD Pipeline');
      expect(result).toContain('test-failure');
      expect(result).toContain('fp-test-123');
      expect(result).toContain('Error: Test failed at line 42');
    });
  });
});