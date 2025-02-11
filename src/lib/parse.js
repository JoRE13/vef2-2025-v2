/**
 * @typedef {import('../types.js').FileItem} FileItem
 * @typedef {import('../types.js').Question} Question
 * @typedef {import('../types.js').QuestionCategory} QuestionCategory
 */

/**
 * Parse a potential file item, return null if invalid.
 * @param {unknown} potentialItem Potential file item.
 * @returns {FileItem | null} File item or null if invalid.
 */
export function parseIndexFileItem(potentialItem) {
  if (typeof potentialItem !== 'object' || potentialItem === null) {
    return null;
  }

  if (!('title' in potentialItem) || !('file' in potentialItem)) {
    return null;
  }

  const { title, file } = potentialItem;

  if (typeof title !== 'string' || typeof file !== 'string') {
    return null;
  }

  return { title, file };
}

/**
 * Parse index data into an array of file items.
 * Skips any invalid items and logs an error.
 * @param {string} indexFileData Stringified JSON data
 * @returns {FileItem[]} Parsed array of file items
 */
export function parseIndexFile(indexFileData) {
  /** @type unknown */
  let json;
  try {
    json = JSON.parse(indexFileData);
  } catch (e) {
    console.error('unable to parse index file', e);
    return [];
  }

  if (!Array.isArray(json)) {
    console.error('index file is not an array');
    return [];
  }

  const items = json
    .map((item, index) => {
      const parsed = parseIndexFileItem(item);

      if (!parsed) {
        console.error(`invalid item at index`, index, item);
      }

      return parsed;
    })
    .filter((i) => i !== null);

  return items;
}

/**
 * Parse data into answers.
 * @param {unknown} data Potential answers to parse.
 * @returns Parsed answers or empty array if invalid.
 */
export function parseAnswers(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  const parsedAnswers = data
    .map((item) => {
      if (typeof item !== 'object' || item === null) {
        return null;
      }

      if (!('answer' in item) || !('correct' in item)) {
        return null;
      }

      const { answer, correct } = item;

      if (typeof answer !== 'string' || typeof correct !== 'boolean') {
        return null;
      }

      return { answer, correct };
    })
    .filter((a) => a !== null);

  return parsedAnswers;
}

/**
 * Parse data into a questions.
 * @param {unknown} questions Potential questions to parse.
 * @returns {Question[]} Parsed questions or empty if invalid.
 */
export function parseQuestions(questions) {
  if (!Array.isArray(questions)) {
    return [];
  }

  const parsedQuestions = questions
    .map((question) => {
      if (typeof question !== 'object' || question === null) {
        return null;
      }

      if (!('question' in question) || !('answers' in question)) {
        return null;
      }

      const { question: questionText, answers } = question;

      if (typeof questionText !== 'string' || !Array.isArray(answers)) {
        return null;
      }

      const parsedAnswers = parseAnswers(answers);

      if (parsedAnswers.length === 0) {
        return null;
      }

      return { question: questionText, answers: parsedAnswers };
    })
    .filter((q) => q !== null);

  return parsedQuestions;
}

/**
 * Parse data into a question category.
 * @param {string} data Stringified JSON data
 * @returns {QuestionCategory | null} Parsed answer or null if invalid
 */
export function parseQuestionCategory(data) {
  /** @type unknown */
  let json;
  try {
    json = JSON.parse(data);
  } catch (e) {
    console.error('unable to parse question category', e);
    return null;
  }

  if (typeof json !== 'object' || json === null) {
    return null;
  }

  if (
    !('title' in json) ||
    typeof json.title !== 'string' ||
    !('questions' in json)
  ) {
    return null;
  }

  const questionCategory = {
    title: json.title,
    questions: parseQuestions(json.questions),
  };

  if (questionCategory.questions.length === 0) {
    return null;
  }

  return questionCategory;
}
