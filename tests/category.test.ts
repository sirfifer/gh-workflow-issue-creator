import { describe, it, expect } from 'vitest';
import { autoDetectCategory } from '../src/lib/category';

describe('autoDetectCategory', () => {
  it('detects terraform', () => {
    expect(autoDetectCategory({ workflow: 'terraform-validate', jobName: '', additionalLabels: ''})).toBe('terraform-validation');
  });
  it('detects code-quality for build workflows', () => {
    expect(autoDetectCategory({ workflow: 'build', jobName: '', additionalLabels: ''})).toBe('code-quality');
  });
  it('falls back to general for unknown workflows', () => {
    expect(autoDetectCategory({ workflow: 'random-workflow', jobName: '', additionalLabels: ''})).toBe('general');
  });
});
