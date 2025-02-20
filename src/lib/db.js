import pg from 'pg';
import { environment } from './enviroment.js';
import { logger as loggerSingleton } from './logger.js';

export class Database {
  /**
   * Create a new database connection.
   * @param {string} connectionString
   * @param {import('./logger').Logger} logger
   */
  constructor(connectionString, logger) {
    this.connectionString = connectionString;
    this.logger = logger;
  }

  /**@type {pg.Pool | null} */
  pool = null;

  open() {
    this.pool = new pg.Pool({ connectionString: this.connectionString });

    this.pool.on('error', (err) => {
      this.logger.error('error in database pool', err);
      this.close();
    });
  }

  /**
   * Close the database connection.
   * @returns {Promise<boolean>}
   */
  async close() {
    if (!this.pool) {
      this.logger.error('unable to close database connection that is not open');
      return false;
    }

    try {
      await this.pool.end();
      return true;
    } catch (e) {
      this.logger.error('error closing database pool', { error: e });
      return false;
    } finally {
      this.pool = null;
    }
  }

  /**
   * Connect to the database via the pool.
   * @returns {Promise<pg.PoolClient | null>}
   */
  async connect() {
    if (!this.pool) {
      this.logger.error('Reynt að nota gagnagrunn sem er ekki opinn');
      return null;
    }

    try {
      const client = await this.pool.connect();
      return client;
    } catch (e) {
      this.logger.error('error connecting to db', { error: e });
      return null;
    }
  }

  /**
   * Run a query on the database.
   * @param {string} query SQL query.
   * @param {Array<string>} values Parameters for the query.
   * @returns {Promise<pg.QueryResult | null>} Result of the query.
   */
  async query(query, values = []) {
    const client = await this.connect();

    if (!client) {
      return null;
    }

    try {
      const result = await client.query(query, values);
      return result;
    } catch (e) {
      this.logger.error('Error running query', e);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Inserts a category into the database
   * @param {*} ctgValues name value and file value
   * @returns true if succsessfull and null otherwise
   */
  async insertCategory(ctgValues) {
    const result = await this.query(
      'INSERT INTO categories (name, file) VALUES ($1 , $2)',
      ctgValues
    );
    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to insert category', { result, categories });
      return false;
    }
    return true;
  }

  /**
   * Gets an array containing all rows in categories table
   * @returns an array containing all rows in categories table null otherwoise
   */
  async getCategories() {
    const result = await this.query('SELECT * FROM categories');
    if (result && (result.rows?.length ?? 0) > 0) {
      return result.rows;
    }
    return null;
  }

  async insertQuestion(questionValues) {
    const result = await this.query(
      'INSERT INTO questions (text, categories_id) VALUES ($1 , $2)',
      questionValues
    );
    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to insert question', { result, categories });
      return false;
    }
    return true;
  }

  async getQuestions() {
    const result = await this.query('SELECT id, text FROM questions');
    if (result && (result.rows?.length ?? 0) > 0) {
      return result.rows;
    }
    return null;
  }

  async insertAnswer(answerValues) {
    const result = await this.query(
      'INSERT INTO answers (answer, correct, questions_id) VALUES ($1, $2, $3)',
      answerValues
    );
    if (!result || result.rowCount !== 1) {
      this.logger.warn('unable to insert question', { result, categories });
      return false;
    }
    return true;
  }

  async getQuestionsAnswers(category) {
    const qa = [];
    const result = await this.query(
      `SELECT T1.*, T2.name
        FROM public.questions AS T1 LEFT JOIN public.categories AS T2 ON T2.id = T1.categories_id
        WHERE name = $1`,
      category
    );
    if (result && (result.rows?.length ?? 0) > 0) {
      const questions = result.rows;
      for (const q of questions) {
        const ans = [];
        const result = await this.query(
          `
                SELECT T1.*
                FROM public.answers AS T1 LEFT JOIN public.questions AS T2 ON T2.id = T1.questions_id
                WHERE T2.id = $1
                `,
          [q.id]
        );
        if (result && (result.rows?.length ?? 0) > 0) {
          const answers = result.rows;
          for (const a of answers) {
            const ansData = {
              answer: a.answer,
              correct: a.correct,
            };
            ans.push(ansData);
          }
          const qData = {
            question: q.text,
            answers: ans,
          };
          qa.push(qData);
        }
      }
      return qa;
    }
    return null;
  }

  async getCategoryID(name) {
    const result = await this.query(
      'SELECT id FROM categories WHERE name = $1',
      [name]
    );
    if (result && (result.rows?.length ?? 0) > 0) {
      return result.rows;
    }
    return null;
  }

  async getQuestionID(text) {
    const result = await this.query(
      'SELECT id FROM questions WHERE text = $1',
      [text]
    );
    if (result && (result.rows?.length ?? 0) > 0) {
      return result.rows;
    }
    return null;
  }
}

/** @type {Database | null} */
let db = null;

/**
 * Return a singleton database instance.
 * @returns {Database | null}
 */
export function getDatabase() {
  if (db) {
    return db;
  }

  const env = environment(process.env, loggerSingleton);

  if (!env) {
    return null;
  }
  db = new Database(env.connectionString, loggerSingleton);
  db.open();

  return db;
}
