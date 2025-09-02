import { describe, it, expect } from 'vitest';
import { IssueManager } from '../src/lib/issue-manager';

function fakeOctokit(initial: any[] = []) {
  const issues = [...initial];
  return {
    rest: {
      issues: {
        listForRepo: async ({}) => ({ data: issues }),
        create: async ({ title, body, labels }) => {
          const number = issues.length + 1;
          const item = { number, title, body, labels, html_url: `http://example/${number}` };
          issues.push(item);
          return { data: item };
        },
        update: async ({ issue_number, title, body }) => {
          const idx = issues.findIndex((x) => x.number === issue_number);
          if (idx >= 0) {
            issues[idx] = { ...issues[idx], title, body };
            return { data: issues[idx] };
          }
          throw new Error('not found');
        },
        getLabel: async () => ({}),
        createLabel: async () => ({}),
      },
    },
  };
}

const inputs = {
  failureLabel: 'workflow-failure',
  additionalLabels: '',
  alwaysCreateNew: false,
  dedupeStrategy: 'fingerprint',
  targetOwner: '',
  targetRepo: ''
};

const ctx = { owner: 'acme', repo: 'repo' };

describe('IssueManager', () => {
  it('creates when none exists', async () => {
    const m = new IssueManager(fakeOctokit(), inputs, ctx);
    const res = await m.createOrUpdate({
      title: 'My Title fp-123',
      body: 'Body',
      fingerprint: 'fp-123',
      category: 'general'
    });
    expect(res.number).toBe(1);
  });

  it('updates when existing present and dedupe enabled', async () => {
    const existing = { number: 1, title: 'My Title fp-xyz' };
    const ok = fakeOctokit([existing]);
    const m = new IssueManager(ok, inputs, ctx);
    const res = await m.createOrUpdate({
      existing,
      title: 'My Title fp-xyz',
      body: 'Updated',
      fingerprint: 'fp-xyz',
      category: 'general'
    });
    expect(res.number).toBe(1);
    expect(res.body).toBe('Updated');
  });
});
