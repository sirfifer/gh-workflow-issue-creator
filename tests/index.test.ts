import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as core from '@actions/core';
import * as github from '@actions/github';

// Mock all dependencies
vi.mock('@actions/core');
vi.mock('@actions/github');
vi.mock('../src/lib/config');
vi.mock('../src/lib/context');
vi.mock('../src/lib/category');
vi.mock('../src/lib/fingerprint');
vi.mock('../src/lib/render');
vi.mock('../src/lib/issue-manager');
vi.mock('../src/lib/redact');

describe('index.ts - Main Action Entry Point', () => {
  let mockGetInput: any;
  let mockSetOutput: any;
  let mockSetFailed: any;
  let mockInfo: any;
  let mockGetOctokit: any;
  
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup core mocks
    mockGetInput = vi.fn();
    mockSetOutput = vi.fn();
    mockSetFailed = vi.fn();
    mockInfo = vi.fn();
    
    (core as any).getInput = mockGetInput;
    (core as any).setOutput = mockSetOutput;
    (core as any).setFailed = mockSetFailed;
    (core as any).info = mockInfo;
    
    // Setup github mocks
    mockGetOctokit = vi.fn().mockReturnValue({
      rest: {
        issues: {
          listForRepo: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
        },
      },
    });
    (github as any).getOctokit = mockGetOctokit;
    
    // Default input values
    mockGetInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        'github-token': 'test-token',
        'mode': 'create',
        'category': 'general',
      };
      return inputs[name] || '';
    });
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Initialization', () => {
    it('should get GitHub token from input', async () => {
      const { getConfig } = await import('../src/lib/config');
      const { buildContext } = await import('../src/lib/context');
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        category: 'general',
        autoDetectCategory: false,
        dedupeStrategy: 'fingerprint',
        snoozeUntil: undefined,
      });
      
      (buildContext as any).mockReturnValue({
        owner: 'test-owner',
        repo: 'test-repo',
        workflow: { name: 'CI', job: 'test' },
      });
      
      // Import and run the main module
      await import('../src/index');
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockGetInput).toHaveBeenCalledWith('github-token', { required: true });
      expect(mockGetOctokit).toHaveBeenCalledWith('test-token');
    });
    
    it('should load configuration', async () => {
      const { getConfig } = await import('../src/lib/config');
      const getConfigMock = vi.fn().mockReturnValue({
        mode: 'create',
        category: 'general',
        autoDetectCategory: false,
      });
      (getConfig as any) = getConfigMock;
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(getConfigMock).toHaveBeenCalled();
    });
  });
  
  describe('Category Detection', () => {
    it('should auto-detect category when enabled', async () => {
      const { getConfig } = await import('../src/lib/config');
      const { buildContext } = await import('../src/lib/context');
      const { autoDetectCategory } = await import('../src/lib/category');
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        category: 'general',
        autoDetectCategory: true,
        additionalLabels: 'bug,help-wanted',
      });
      
      (buildContext as any).mockReturnValue({
        workflow: { name: 'Deploy', job: 'production' },
      });
      
      const mockAutoDetect = vi.fn().mockReturnValue('deployment');
      (autoDetectCategory as any) = mockAutoDetect;
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockAutoDetect).toHaveBeenCalledWith({
        workflow: 'Deploy',
        jobName: 'production',
        additionalLabels: 'bug,help-wanted',
      });
      
      expect(mockSetOutput).toHaveBeenCalledWith('detected-category', 'deployment');
    });
    
    it('should use provided category when auto-detect is disabled', async () => {
      const { getConfig } = await import('../src/lib/config');
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        category: 'custom-category',
        autoDetectCategory: false,
      });
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockSetOutput).toHaveBeenCalledWith('detected-category', 'custom-category');
    });
  });
  
  describe('Close-on-Success Mode', () => {
    it('should close issue when mode is close-on-success', async () => {
      const { getConfig } = await import('../src/lib/config');
      const { buildContext } = await import('../src/lib/context');
      const { IssueManager } = await import('../src/lib/issue-manager');
      const { computeFingerprint } = await import('../src/lib/fingerprint');
      
      (getConfig as any).mockReturnValue({
        mode: 'close-on-success',
        category: 'general',
      });
      
      (buildContext as any).mockReturnValue({
        workflow: { name: 'CI', job: 'test' },
      });
      
      (computeFingerprint as any).mockReturnValue('fp-12345');
      
      const mockCloseIfOpen = vi.fn().mockResolvedValue(true);
      (IssueManager as any).mockImplementation(() => ({
        closeIfOpenByFingerprint: mockCloseIfOpen,
      }));
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockCloseIfOpen).toHaveBeenCalledWith('fp-12345');
      expect(mockSetOutput).toHaveBeenCalledWith('fingerprint', 'fp-12345');
      expect(mockSetOutput).toHaveBeenCalledWith('resolved', 'true');
    });
  });
  
  describe('Snooze Feature', () => {
    it('should skip issue creation when snoozed', async () => {
      const { getConfig } = await import('../src/lib/config');
      const { IssueManager } = await import('../src/lib/issue-manager');
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        snoozeUntil: futureDate.toISOString(),
      });
      
      const mockCreateOrUpdate = vi.fn();
      (IssueManager as any).mockImplementation(() => ({
        createOrUpdate: mockCreateOrUpdate,
      }));
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockInfo).toHaveBeenCalledWith(
        expect.stringContaining('Snoozed until')
      );
      expect(mockCreateOrUpdate).not.toHaveBeenCalled();
    });
    
    it('should create issue when snooze period has passed', async () => {
      const { getConfig } = await import('../src/lib/config');
      
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        snoozeUntil: pastDate.toISOString(),
      });
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Should not see snooze message
      expect(mockInfo).not.toHaveBeenCalledWith(
        expect.stringContaining('Snoozed until')
      );
    });
  });
  
  describe('Issue Creation', () => {
    it('should create new issue when none exists', async () => {
      const { getConfig } = await import('../src/lib/config');
      const { buildContext } = await import('../src/lib/context');
      const { IssueManager } = await import('../src/lib/issue-manager');
      const { computeFingerprint } = await import('../src/lib/fingerprint');
      const { renderBody } = await import('../src/lib/render');
      const { redactText } = await import('../src/lib/redact');
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        category: 'general',
      });
      
      (buildContext as any).mockReturnValue({
        workflow: { name: 'CI', job: 'test' },
        errorSignatures: ['Error: Test failed'],
      });
      
      (computeFingerprint as any).mockReturnValue('fp-12345');
      (renderBody as any).mockResolvedValue('Issue body content');
      (redactText as any).mockReturnValue('Redacted body content');
      
      const mockFindExisting = vi.fn().mockResolvedValue(null);
      const mockLoadTemplate = vi.fn().mockResolvedValue('template content');
      const mockCreateOrUpdate = vi.fn().mockResolvedValue({
        number: 42,
        html_url: 'https://github.com/test/repo/issues/42',
      });
      
      (IssueManager as any).mockImplementation(() => ({
        findExistingByFingerprint: mockFindExisting,
        loadTemplate: mockLoadTemplate,
        createOrUpdate: mockCreateOrUpdate,
      }));
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockFindExisting).toHaveBeenCalledWith('fp-12345');
      expect(mockCreateOrUpdate).toHaveBeenCalledWith({
        existing: null,
        title: '[CI] failed — general — fp-12345',
        body: 'Redacted body content',
        fingerprint: 'fp-12345',
        category: 'general',
      });
      
      expect(mockSetOutput).toHaveBeenCalledWith('issue-number', 42);
      expect(mockSetOutput).toHaveBeenCalledWith('issue-url', 'https://github.com/test/repo/issues/42');
      expect(mockSetOutput).toHaveBeenCalledWith('deduped', 'false');
    });
    
    it('should update existing issue when found', async () => {
      const { IssueManager } = await import('../src/lib/issue-manager');
      
      const existingIssue = { number: 10, title: 'Existing issue' };
      
      const mockFindExisting = vi.fn().mockResolvedValue(existingIssue);
      const mockCreateOrUpdate = vi.fn().mockResolvedValue({
        number: 10,
        html_url: 'https://github.com/test/repo/issues/10',
      });
      
      (IssueManager as any).mockImplementation(() => ({
        findExistingByFingerprint: mockFindExisting,
        loadTemplate: vi.fn().mockResolvedValue('template'),
        createOrUpdate: mockCreateOrUpdate,
      }));
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockCreateOrUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          existing: existingIssue,
        })
      );
      
      expect(mockSetOutput).toHaveBeenCalledWith('deduped', 'true');
    });
  });
  
  describe('Error Handling', () => {
    it('should set failed status on error', async () => {
      const { getConfig } = await import('../src/lib/config');
      
      const testError = new Error('Test error message');
      (getConfig as any).mockImplementation(() => {
        throw testError;
      });
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockSetFailed).toHaveBeenCalledWith('Test error message');
    });
    
    it('should handle non-Error exceptions', async () => {
      const { getConfig } = await import('../src/lib/config');
      
      (getConfig as any).mockImplementation(() => {
        throw 'String error';
      });
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(mockSetFailed).toHaveBeenCalledWith('String error');
    });
  });
  
  describe('Output Generation', () => {
    it('should set all expected outputs', async () => {
      const { getConfig } = await import('../src/lib/config');
      const { buildContext } = await import('../src/lib/context');
      const { IssueManager } = await import('../src/lib/issue-manager');
      const { computeFingerprint } = await import('../src/lib/fingerprint');
      
      (getConfig as any).mockReturnValue({
        mode: 'create',
        category: 'deployment',
        autoDetectCategory: true,
      });
      
      (buildContext as any).mockReturnValue({
        workflow: { name: 'Deploy', job: 'prod' },
      });
      
      (computeFingerprint as any).mockReturnValue('fp-deploy-123');
      
      const mockCreateOrUpdate = vi.fn().mockResolvedValue({
        number: 99,
        html_url: 'https://github.com/test/repo/issues/99',
      });
      
      (IssueManager as any).mockImplementation(() => ({
        findExistingByFingerprint: vi.fn().mockResolvedValue(null),
        loadTemplate: vi.fn().mockResolvedValue('template'),
        createOrUpdate: mockCreateOrUpdate,
      }));
      
      await import('../src/index');
      await new Promise(resolve => setTimeout(resolve, 10));
      
      // Check all outputs are set
      expect(mockSetOutput).toHaveBeenCalledWith('detected-category', 'deployment');
      expect(mockSetOutput).toHaveBeenCalledWith('fingerprint', 'fp-deploy-123');
      expect(mockSetOutput).toHaveBeenCalledWith('issue-number', 99);
      expect(mockSetOutput).toHaveBeenCalledWith('issue-url', 'https://github.com/test/repo/issues/99');
      expect(mockSetOutput).toHaveBeenCalledWith('deduped', 'false');
    });
  });
});