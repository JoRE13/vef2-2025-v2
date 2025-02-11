import { readFile as fsReadFile, mkdir, stat } from 'node:fs/promises';

/**
 * Check if a directory exists.
 * @param {string} dir Directory to check
 * @returns `true` if dir exists, `false` otherwise
 */
export async function direxists(dir) {
  if (!dir) {
    return false;
  }

  try {
    const info = await stat(dir);
    return info.isDirectory();
  } catch (e) {
    console.error('unable to check if directory exists', dir, e.message);
    return false;
  }
}

/**
 * Create a directory if it does not exist.
 * @param {string} dir Directory to create if it does not exist
 */
export async function createDirIfNotExists(dir) {
  try {
    if (!(await direxists(dir))) {
      await mkdir(dir);
    }
    return true;
  } catch (e) {
    console.error('unable to create directory', dir, e.message);
    return false;
  }
}

/**
 * Read a file and return its content.
 * @param {string} file File to read
 * @param {object} options.encoding asdf
 * @returns {Promise<string | null>} Content of file or `null` if unable to read.
 */
export async function readFile(file, { encoding = 'utf8' } = {}) {
  try {
    const content = await fsReadFile(file, { encoding });

    return content.toString(encoding);
  } catch (e) {
    console.error('unable to read file', file, e.message);
    return null;
  }
}
