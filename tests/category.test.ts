import { describe, it, expect } from 'vitest';
import { autoDetectCategory } from '../src/lib/category';

describe('autoDetectCategory', () => {
  it('detects terraform', () => {
    expect(autoDetectCategory({ workflow: 'terraform-validate', jobName: '', additionalLabels: ''})).toBe('terraform-validation');
  });
  it('falls back to general', () => {
    expect(autoDetectCategory({ workflow: 'build', jobName: '', additionalLabels: ''})).toBe('general');
  });
});
