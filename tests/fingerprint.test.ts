import { describe, it, expect } from 'vitest';
import { computeFingerprint } from '../src/lib/fingerprint';

const baseCtx: any = {
  repository: 'acme/repo',
  workflow: { name: 'build', job: 'test' },
};

describe('computeFingerprint', () => {
  it('is stable across dynamic tokens', () => {
    const fp1 = computeFingerprint({ ctx: { ...baseCtx }, category: 'code-quality', errorSignatures: ['Error: foo 123', 'sha abcdef1'] });
    const fp2 = computeFingerprint({ ctx: { ...baseCtx }, category: 'code-quality', errorSignatures: ['Error: foo 456', 'sha 0123abcd'] });
    expect(fp1).toEqual(fp2);
  });

  it('changes when category changes', () => {
    const a = computeFingerprint({ ctx: baseCtx, category: 'code-quality', errorSignatures: [] });
    const b = computeFingerprint({ ctx: baseCtx, category: 'security-scan', errorSignatures: [] });
    expect(a).not.toEqual(b);
  });
});
