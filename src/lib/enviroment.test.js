import { describe, expect, it, jest } from '@jest/globals';
import { environment } from './enviroment.js';

describe('environment', () => {
  it('should handle missing env', async () => {
    /** @type import('./logger').Logger */
    const logger = {
      silent: false,
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    /** @type any */
    const env = {};
    const result = environment(env, logger);
    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      'SESSION_SECRET must be defined as string and be at least 32 characters long',
    );
    expect(logger.error).toHaveBeenCalledWith(
      'DATABASE_URL must be defined as a string',
    );
    expect(logger.info).toHaveBeenCalledWith(
      'PORT not defined, using default port',
      3000,
    );
  });

  it('should handle invalid env', async () => {
    /** @type import('./logger').Logger */
    const logger = {
      silent: false,
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    /** @type any */
    const env = {
      SESSION_SECRET: '12345678901234567890123456789012',
      DATABASE_URL: '',
      PORT: 'abc',
    };
    const result = environment(env, logger);
    expect(result).toBeNull();
    expect(logger.error).toHaveBeenCalledWith(
      'PORT must be defined as a number',
      'abc',
    );
  });

  it('should handle valid env', async () => {
    /** @type import('./logger').Logger */
    const logger = {
      silent: false,
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    /** @type any */
    const env = {
      SESSION_SECRET: '12345678901234567890123456789012',
      DATABASE_URL: 'postgres://',
      PORT: '1234',
    };
    const result = environment(env, logger);
    expect(result).toStrictEqual({
      port: 1234,
      sessionSecret: '12345678901234567890123456789012',
      connectionString: 'postgres://',
    });
  });

  it('should use cached value', async () => {
    /** @type import('./logger').Logger */
    const logger = {
      silent: false,
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    /** @type any */
    const env = {
      SESSION_SECRET: '12345678901234567890123456789012',
      DATABASE_URL: 'postgres://',
      PORT: '1234',
    };
    const result1 = environment(env, logger);
    const result2 = environment(env, logger);

    // Ensure that the **same** object is returned
    expect(result1).toStrictEqual(result2);
  });
});