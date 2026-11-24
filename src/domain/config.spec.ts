import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadConfigFromEnv } from './config.ts';

describe('loadConfigFromEnv verbose', () => {
  beforeEach(() => {
    vi.stubEnv('CLOCKIFY_API_KEY', 'key');
    vi.stubEnv('CLOCKIFY_WORKSPACE_ID', 'workspace');
    vi.stubEnv('CONGE_MOBILE_DAYS', '3');
    vi.stubEnv('VACANCES_DAYS', '25');
    vi.stubEnv('VACANCES_BANK_CAD', '5000');
    vi.stubEnv('HOURLY_RATE_CAD', '50');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is off when VERBOSE is unset', () => {
    vi.stubEnv('VERBOSE', undefined);
    expect(loadConfigFromEnv().verbose).toBe(false);
  });

  it.each(['false', '0', 'no', 'off'])('is off when VERBOSE=%s', (value) => {
    vi.stubEnv('VERBOSE', value);
    expect(loadConfigFromEnv().verbose).toBe(false);
  });

  it.each(['true', '1', 'yes', 'on'])('is on when VERBOSE=%s', (value) => {
    vi.stubEnv('VERBOSE', value);
    expect(loadConfigFromEnv().verbose).toBe(true);
  });

  it('rejects an unrecognised VERBOSE value', () => {
    vi.stubEnv('VERBOSE', 'maybe');
    expect(() => loadConfigFromEnv()).toThrow();
  });
});
