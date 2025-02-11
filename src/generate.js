import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createDirIfNotExists, readFile } from './lib/file.js';
import { indexTemplate, questionCategoryTemplate } from './lib/html.js';
import { parseIndexFile, parseQuestionCategory } from './lib/parse.js';

/**
 * @typedef {import('./types.js').FileItem} FileItem
 * @typedef {import('./types.js').QuestionCategory} QuestionCategory
 */

/** Mappa sem geymir JSON skrár. */
const INPUT_DIR = './data';

/** Mappa sem geymir skrár fyrir vef. */
const OUTPUT_DIR = './dist';

/**
 *
 * @param {FileItem} fileItem File item to process
 * @returns {Promise<QuestionCategory|null>} Parsed question category or null if invalid
 */
async function readAndParseFile(fileItem) {
  const content = await readFile(join(INPUT_DIR, fileItem.file));

  if (!content) {
    console.error('unable to read file', fileItem);
    return null;
  }
  const parsed = parseQuestionCategory(content);

  if (!parsed) {
    console.error('unable to parse file', fileItem);
    return null;
  }

  parsed.file = fileItem.file;

  return parsed;
}

async function createAndWriteCategoryFile(questionCategory) {
  if (!questionCategory.file) {
    console.error('missing file for category', questionCategory);
    return;
  }
  const filename = questionCategory.file.replace('.json', '.html');
  const categoryFileOutput = join(OUTPUT_DIR, filename);
  await writeFile(
    categoryFileOutput,
    questionCategoryTemplate(questionCategory),
    { flag: 'w+' }
  );
  console.info('category file written to', categoryFileOutput);
}

/**
 * Býr til HTML skrár úr JSON skrám:
 *
 * 1. Býr til OUTPUT_DIR möppuna ef hún er ekki til
 * 2. Les og þáttar `index.json` skránna úr INPUT_DIR möppu
 * 3. Les og þáttar allar JSON skrár (flokka) í index
 * 4. Útbýr HTML skrár fyrir hvern flokk í OUTPUT_DIR
 * 5. Útbýr HTML skrá fyrir forsíðu í OUTPUT_DIR
 */
async function main() {
  console.group('starting to generate');

  // 1.
  await createDirIfNotExists(OUTPUT_DIR);

  // 2.
  console.group('reading and parsing index file');
  const indexFile = await readFile(join(INPUT_DIR, 'index.json'));

  if (!indexFile) {
    console.error('unable to read index file');
    return;
  }
  const index = parseIndexFile(indexFile);
  console.info('index file length:', index.length);
  console.groupEnd();

  // 3.
  /** @type QuestionCategory[] */
  let questionCategoryFiles = [];
  for await (const { title, file } of index) {
    console.group('processing file', file);
    const result = await readAndParseFile({ title, file });

    if (result) {
      questionCategoryFiles.push(result);
    }
    console.groupEnd();
  }

  // 4.
  console.group('create and write index file');
  const indexFileOutput = join(OUTPUT_DIR, 'index.html');
  await writeFile(indexFileOutput, indexTemplate(questionCategoryFiles), {
    flag: 'w+',
  });
  console.info('index file written to', indexFileOutput);
  console.groupEnd();

  // 5.
  console.group('create and write category files');
  for await (const questionCategory of questionCategoryFiles) {
    await createAndWriteCategoryFile(questionCategory);
  }
  console.groupEnd();

  console.groupEnd();
  console.info('finished generating');
}

main().catch((error) => {
  console.error('error generating', error);
});
