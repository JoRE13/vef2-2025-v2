import { getDatabase, Database } from "./lib/db.js";
import { environment } from "./lib/enviroment.js";
import { logger as loggerSingleton} from "./lib/logger.js";
import { parseIndexFile, parseQuestionCategory } from "./lib/parse.js";
import { readFile } from "./lib/file.js";
import {join} from 'node:path'

const SCHEMA_FILE = './sql/schema.sql';
const DROP_SCHEMA_FILE = './sql/drop.sql';
const INPUT_DIR = './data';
//vantar xss
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

/**
 * @param {Database} db
 * @param {import('./lib/logger.js').Logger} logger
 * @returns {Promise<boolean>}
 */
async function setupDbFromFiles(db, logger) {
    const dropScript = await readFile(DROP_SCHEMA_FILE);
    const createScript = await readFile(SCHEMA_FILE);
  
    if (await db.query(dropScript.toString('utf-8'))) {
      logger.info('schema dropped');
    } else {
      logger.info('schema not dropped, exiting');
      return false;
    }
  
    if (await db.query(createScript.toString('utf-8'))) {
      logger.info('schema created');
    } else {
      logger.info('schema not created');
      return false;
    }  
    return true;
}

/**
 * @param {Database} db
 * @param {import('./lib/logger.js').Logger} logger
 */
async function setupData(db, logger) {
    // Index file
    const indexFileData = await readFile(join(INPUT_DIR, 'index.json'));
    const index = parseIndexFile(indexFileData);
    logger.info('index file read');
    let questionCategoryFiles = [];
    for await (const { title, file } of index) {
        const result = await readAndParseFile({ title, file });
        if (result) {
            questionCategoryFiles.push(result);
        }
    }
    for (const ctg of questionCategoryFiles) {
        const ctgValues = [ctg.title, ctg.file];
        await db.insertCategory(ctgValues);
    }

    // Questions
    const categories = await db.getCategories();
    for (const ctg of questionCategoryFiles) {
        for (const q of ctg.questions) {
            let cat_id;
            for (const x of categories) {
                if (x.name === ctg.title) {
                    cat_id = x.id;
                }
            }
            if(cat_id) {
                await db.insertQuestion([q.question, cat_id]);
            }
        }
    }

    // answers
    const questions = await db.getQuestions();
    for (const ctg of questionCategoryFiles){
        for (const q of ctg.questions) {
            for (const a of q.answers) {
                let quest_id;
                for( const x of questions) {
                    if(x.text === q.question) {
                        quest_id = x.id;
                    }
                }
                if(quest_id){
                    await db.insertAnswer([a.answer, a.correct, quest_id]);
                }
            }
        }
    }

    return true;

}

async function create() {
    const logger = loggerSingleton;
    const env = environment(process.env, logger);

    if(!env) {
        process.exit(1);
    }

    logger.info('starting setup');

    const db = new Database(env.connectionString, logger);
    db.open();

    const resultFromFileSetup = await setupDbFromFiles(db, logger);

  if (!resultFromFileSetup) {
    logger.info('error setting up database from files');
    process.exit(1);
  }

  let resultFromReadingData;
  try {
    resultFromReadingData = await setupData(db, logger);
  } catch (e) {
    // falls through
  }

  if (!resultFromReadingData) {
    logger.info('error reading data from files');
    process.exit(1);
  }

  logger.info('setup complete');
  await db.close();
}

create().catch((err) => {
    console.error('error running setup', err);
  });

