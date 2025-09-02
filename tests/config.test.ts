import { describe, it, expect } from 'vitest';
import { getConfig } from '../src/lib/config';
import * as core from '@actions/core';

describe('getConfig', () => {
  it('parses defaults', () => {
    // Vitest doesn't actually read @actions/core inputs, so we rely on defaults
    const cfg = getConfig();
    expect(cfg.mode).toBeDefined();
    expect(typeof cfg.autoDetectCategory).toBe('boolean');
  });
});
