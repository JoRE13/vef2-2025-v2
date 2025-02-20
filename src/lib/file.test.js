import { describe, expect, it } from '@jest/globals';
import { join } from 'path';
import { direxists, readFile } from './file';

const testDir = './src/test/data';

describe('file', () => {
  describe('direxists', () => {
    it('returns false if dir does not exist', async () => {
      const result = await direxists('./does-not-exist');
      expect(result).toBe(false);
    });

    it('returns true if dir does exist', async () => {
      const result = await direxists(testDir);
      expect(result).toBe(true);
    });

    it('returns false if no input', async () => {
      const result = await direxists('');
      expect(result).toBe(false);
    });
  });

  describe('readFile', () => {
    it('should return null for file that does not exist', async () => {
      const result = await readFile('./does-not-exist');

      expect(result).toEqual(null);
    });

    it('should return content of known file that does exist', async () => {
      const result = await readFile(`${testDir}/1`);
      expect(result).toContain('asdf');
    });
  });
});