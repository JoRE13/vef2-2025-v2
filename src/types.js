/**
 * @typedef {Object} FileItem
 * @property {string} title Title of the file
 * @property {string} file File name
 */

/**
 * @typedef {Object} Answer
 * @property {string} answer Answer text
 * @property {boolean} correct Is the answer correct or not
 */

/**
 * @typedef {Object} Question
 * @property {string} question Question text
 * @property {Answer[]} answers Answers to the question
 */

/**
 * @typedef {Object} QuestionCategory
 * @property {string} title Title of the category
 * @property {string} [file] File name
 * @property {Question[]} questions Questions in the category
 */

export default {};
