import assert from 'node:assert';

import { before, describe, it, mock } from 'node:test';

describe('file', (t) => {
  let direxists, createDirIfNotExists, readFile;
  before(async () => {
    await import('node:fs/promises');

    mock.module('node:fs/promises', {
      namedExports: {
        async stat(dir) {
          return dir === 'exists'
            ? { isDirectory: () => true }
            : Promise.reject(new Error('ENOENT'));
        },
        async readFile(file) {
          return file === 'exists' ? 'exists' : Promise.reject();
        },
        async mkdir(dir) {
          return dir === 'does-not-exist'
            ? Promise.resolve()
            : Promise.reject(new Error('EEXIST'));
        },
      },
    });
    ({ direxists, createDirIfNotExists, readFile } = await import('./file.js'));
  });

  describe('direxists', () => {
    it('should return false if dir is falsy', async (t) => {
      const result = await direxists('');
      assert.strictEqual(result, false);
    });

    it('should return true if dir exists', async (t) => {
      const result = await direxists('exists');
      assert.strictEqual(result, true);
    });

    it('should return false if dir does not exist', async (t) => {
      const result = await direxists('does-not-exist');
      assert.strictEqual(result, false);
    });
  });

  describe('createDirIfNotExists', () => {
    it('should create directory if it does not exist', async () => {
      const result = await createDirIfNotExists('does-not-exist');
      assert.strictEqual(result, true);
    });
  });
});
