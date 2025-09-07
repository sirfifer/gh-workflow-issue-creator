import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildContext } from '../src/lib/context';

describe('context.ts - GitHub Context Builder', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set up default GitHub Actions environment
    process.env.GITHUB_REPOSITORY = 'test-owner/test-repo';
    process.env.GITHUB_WORKFLOW = 'CI Workflow';
    process.env.GITHUB_JOB = 'test-job';
    process.env.GITHUB_RUN_ID = '123456';
    process.env.GITHUB_RUN_NUMBER = '42';
    process.env.GITHUB_SHA = 'abc123def456';
    process.env.GITHUB_REF = 'refs/heads/main';
    process.env.GITHUB_ACTOR = 'test-user';
    process.env.GITHUB_EVENT_NAME = 'push';
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.RUNNER_OS = 'Linux';
    process.env.RUNNER_ARCH = 'X64';
  });
  
  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });
  
  describe('Basic Context Building', () => {
    it('should extract owner and repo from GITHUB_REPOSITORY', () => {
      const ctx = buildContext({});
      
      expect(ctx.owner).toBe('test-owner');
      expect(ctx.repo).toBe('test-repo');
      expect(ctx.repository).toBe('test-owner/test-repo');
    });
    
    it('should handle missing GITHUB_REPOSITORY', () => {
      delete process.env.GITHUB_REPOSITORY;
      
      const ctx = buildContext({});
      
      expect(ctx.owner).toBe('');
      expect(ctx.repo).toBe('');
      expect(ctx.repository).toBe('');
    });
    
    it('should handle malformed GITHUB_REPOSITORY', () => {
      process.env.GITHUB_REPOSITORY = 'invalid-format';
      
      const ctx = buildContext({});
      
      expect(ctx.owner).toBe('invalid-format');
      expect(ctx.repo).toBe('');
      expect(ctx.repository).toBe('invalid-format');
    });
  });
  
  describe('Workflow Information', () => {
    it('should extract workflow details', () => {
      const ctx = buildContext({});
      
      expect(ctx.workflow).toEqual({
        name: 'CI Workflow',
        job: 'test-job',
        runId: '123456',
        runNumber: '42',
      });
    });
    
    it('should use runId from inputs if provided', () => {
      const ctx = buildContext({ runId: '999999' });
      
      expect(ctx.workflow.runId).toBe('999999');
    });
    
    it('should handle missing workflow environment variables', () => {
      delete process.env.GITHUB_WORKFLOW;
      delete process.env.GITHUB_JOB;
      delete process.env.GITHUB_RUN_ID;
      delete process.env.GITHUB_RUN_NUMBER;
      
      const ctx = buildContext({});
      
      expect(ctx.workflow).toEqual({
        name: '',
        job: '',
        runId: '',
        runNumber: '',
      });
    });
  });
  
  describe('Git Information', () => {
    it('should extract git details', () => {
      const ctx = buildContext({});
      
      expect(ctx.sha).toBe('abc123def456');
      expect(ctx.ref).toBe('refs/heads/main');
      expect(ctx.actor).toBe('test-user');
      expect(ctx.eventName).toBe('push');
    });
    
    it('should extract branch name from ref', () => {
      process.env.GITHUB_REF = 'refs/heads/feature/test-branch';
      
      const ctx = buildContext({});
      
      expect(ctx.branch).toBe('feature/test-branch');
    });
    
    it('should handle tag refs', () => {
      process.env.GITHUB_REF = 'refs/tags/v1.0.0';
      
      const ctx = buildContext({});
      
      expect(ctx.branch).toBe('');
      expect(ctx.tag).toBe('v1.0.0');
    });
    
    it('should handle pull request refs', () => {
      process.env.GITHUB_REF = 'refs/pull/123/merge';
      
      const ctx = buildContext({});
      
      expect(ctx.pullRequest).toBe('123');
    });
  });
  
  describe('URLs', () => {
    it('should build correct URLs', () => {
      const ctx = buildContext({});
      
      expect(ctx.serverUrl).toBe('https://github.com');
      expect(ctx.workflowUrl).toBe('https://github.com/test-owner/test-repo/actions/runs/123456');
      expect(ctx.commitUrl).toBe('https://github.com/test-owner/test-repo/commit/abc123def456');
    });
    
    it('should handle GitHub Enterprise Server URLs', () => {
      process.env.GITHUB_SERVER_URL = 'https://github.enterprise.com';
      
      const ctx = buildContext({});
      
      expect(ctx.serverUrl).toBe('https://github.enterprise.com');
      expect(ctx.workflowUrl).toBe('https://github.enterprise.com/test-owner/test-repo/actions/runs/123456');
    });
    
    it('should handle missing server URL', () => {
      delete process.env.GITHUB_SERVER_URL;
      
      const ctx = buildContext({});
      
      expect(ctx.serverUrl).toBe('https://github.com');
    });
  });
  
  describe('Runner Information', () => {
    it('should extract runner details', () => {
      const ctx = buildContext({});
      
      expect(ctx.runner).toEqual({
        os: 'Linux',
        arch: 'X64',
      });
    });
    
    it('should handle missing runner information', () => {
      delete process.env.RUNNER_OS;
      delete process.env.RUNNER_ARCH;
      
      const ctx = buildContext({});
      
      expect(ctx.runner).toEqual({
        os: '',
        arch: '',
      });
    });
  });
  
  describe('Error Signatures', () => {
    it('should accept error signatures from inputs', () => {
      const errorSignatures = ['Error: Test failed', 'AssertionError: Expected true'];
      
      const ctx = buildContext({ errorSignatures });
      
      expect(ctx.errorSignatures).toEqual(errorSignatures);
    });
    
    it('should default to empty array if not provided', () => {
      const ctx = buildContext({});
      
      expect(ctx.errorSignatures).toEqual([]);
    });
  });
  
  describe('Timestamps', () => {
    it('should include timestamp in context', () => {
      const before = new Date().toISOString();
      const ctx = buildContext({});
      const after = new Date().toISOString();
      
      expect(ctx.timestamp).toBeDefined();
      expect(ctx.timestamp >= before).toBe(true);
      expect(ctx.timestamp <= after).toBe(true);
    });
  });
  
  describe('Target Repository', () => {
    it('should use target owner and repo if provided', () => {
      const ctx = buildContext({
        targetOwner: 'other-owner',
        targetRepo: 'other-repo',
      });
      
      // Original context should remain unchanged
      expect(ctx.owner).toBe('test-owner');
      expect(ctx.repo).toBe('test-repo');
      
      // Target should be stored separately if needed
      expect(ctx.targetOwner).toBe('other-owner');
      expect(ctx.targetRepo).toBe('other-repo');
    });
  });
  
  describe('Complete Context', () => {
    it('should build complete context object', () => {
      const ctx = buildContext({
        runId: '789',
        errorSignatures: ['Error 1', 'Error 2'],
      });
      
      // Verify all expected properties exist
      expect(ctx).toHaveProperty('owner');
      expect(ctx).toHaveProperty('repo');
      expect(ctx).toHaveProperty('repository');
      expect(ctx).toHaveProperty('workflow');
      expect(ctx).toHaveProperty('sha');
      expect(ctx).toHaveProperty('ref');
      expect(ctx).toHaveProperty('actor');
      expect(ctx).toHaveProperty('eventName');
      expect(ctx).toHaveProperty('serverUrl');
      expect(ctx).toHaveProperty('workflowUrl');
      expect(ctx).toHaveProperty('commitUrl');
      expect(ctx).toHaveProperty('runner');
      expect(ctx).toHaveProperty('errorSignatures');
      expect(ctx).toHaveProperty('timestamp');
      
      // Verify overrides work
      expect(ctx.workflow.runId).toBe('789');
      expect(ctx.errorSignatures).toEqual(['Error 1', 'Error 2']);
    });
  });
});