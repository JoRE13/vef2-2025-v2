import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Database } from './db';

describe('db', () => {
  /** @type import('./logger').Logger */
  let mockLogger;

  beforeEach(() => {
    mockLogger = {
      silent: false,
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
  });

  it('should create a new db connection', () => {
    const db = new Database('connectionString', mockLogger);

    expect(db.connectionString).toBe('connectionString');
  });

  it('should open a new db connection', () => {
    const db = new Database('connectionString', mockLogger);

    db.open();
    expect(db.pool).not.toBeNull();
  });

  it('should log if error occurs in db connection', () => {
    const db = new Database('connectionString', mockLogger);

    db.open();
    db.pool?.emit('error', 'error');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'error in database pool',
      'error',
    );
  });

  it('should close a db connection', async () => {
    const db = new Database('connectionString', mockLogger);

    db.open();
    await db.close();
    expect(db.pool).toBeNull();
  });

  it('should not close a undefined db connection', () => {
    const db = new Database('connectionString', mockLogger);

    db.close();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'unable to close database connection that is not open',
    );
  });

  it('should not connect to a undefined db', async () => {
    const db = new Database('connectionString', mockLogger);

    db.open();
    const client = await db.connect();
    expect(client).toBeNull();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'error connecting to db',
      expect.anything(),
    );
  });

  it('should connect to a mock db pool', async () => {
    const db = new Database('connectionString', mockLogger);

    db.open();
    // switch pool out for mock
    /** @type any */
    const mockPool = {
      connect: jest.fn(),
    };
    db.pool = mockPool;

    const client = await db.connect();
    expect(client).not.toBeNull();
    expect(mockLogger.error).not.toHaveBeenCalled();
    expect(mockPool.connect).toHaveBeenCalled();
  });

  it('should not query if no connection', async () => {
    const db = new Database('connectionString', mockLogger);

    const result = await db.query('SELECT * FROM test');
    expect(result).toBeNull();
  });

  it('should query if connection', async () => {
    const db = new Database('connectionString', mockLogger);

    db.open();
    // switch pool out for mock
    /** @type any */
    const mockPool = {
      connect: jest.fn().mockReturnValue({
        query: jest.fn().mockReturnValue({ rows: [] }),
        release: jest.fn(),
      }),
    };
    db.pool = mockPool;

    const result = await db.query('SELECT * FROM test');
    expect(result).toStrictEqual({ rows: [] });
  });
});