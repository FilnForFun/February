import { describe, expect, test } from 'vitest';
import { loadConfig, validateConfig, DEFAULT_CONFIG } from '../src/config';

describe('config module', () => {
  test('validateConfig returns true for valid config', () => {
    const validConfig = { ...DEFAULT_CONFIG, enabled: true, apiKey: 'test-key' };
    expect(validateConfig(validConfig)).toBe(true);
  });
  
  test('validateConfig returns false for invalid config', () => {
    const invalidConfig = { ...DEFAULT_CONFIG, enabled: true, apiKey: '' };
    expect(validateConfig(invalidConfig)).toBe(false);
  });
  
  test('loadConfig merges user config with defaults', () => {
    const userConfig = { logLevel: 'debug', enabled: true, apiKey: 'test-key' };
    const config = loadConfig(userConfig);
    expect(config.logLevel).toBe('debug');
    expect(config.endpoint).toBe(DEFAULT_CONFIG.endpoint);
  });
});
