import { parseAnswers, parseIndexFile, parseIndexFileItem, parseQuestionCategory } from './parse.js';
import './quiet-io.js';

describe('parse', () => {
  
  describe('parseIndexFileItem', () => {
    test('should fail on non-object input', () => {
      const data = 'not an object';
      const result = parseIndexFileItem(data);
      expect(result).toBeNull();
    });

    test('should fail on null input', () => {
      const data = null;
      const result = parseIndexFileItem(data);
      expect(result).toBeNull();
    });

    test('should fail on missing title', () => {
      const data = { file: 'file' };
      const result = parseIndexFileItem(data);
      expect(result).toBeNull();
    });

    test('should fail on missing file', () => {
      const data = { title: 'title' };
      const result = parseIndexFileItem(data);
      expect(result).toBeNull();
    });

    test('should fail on non-string title', () => {
      const data = { title: 42, file: 'file' };
      const result = parseIndexFileItem(data);
      expect(result).toBeNull();
    });

    test('should fail on non-string file', () => {
      const data = { title: 'title', file: 42 };
      const result = parseIndexFileItem(data);
      expect(result).toBeNull();
    });

    test('should pass on valid input', () => {
      const data = { title: 'title', file: 'file' };
      const result = parseIndexFileItem(data);
      expect(result).toEqual(data);
    });
  });

  describe('parseIndexFile', () => {
    test('should fail on invalid JSON', () => {
      const data = 'not json';
      const result = parseIndexFile(data);
      expect(result).toEqual([]);
    });

    test('should fail on non-array input', () => {
      const data = '"not an array"';
      const result = parseIndexFile(data);
      expect(result).toEqual([]);
    });

    test('should skip invalid items', () => {
      const data = JSON.stringify([
        { title: 'title', file: 'file' },
        'not an object',
        { title: 42, file: 'file' },
        { title: 'title', file: 42 },
      ]);
      const result = parseIndexFile(data);
      expect(result).toEqual([{ title: 'title', file: 'file' }]);
    });
  });

  describe('parseAnswers', () => {
    test('should not parse invalid answers', () => {
      const result = parseAnswers('not an array');
      expect(result).toEqual([]);
    });

    test('should skip invalid answers', () => {
      const data = [
        { answer: 'answer', correct: true },
        'not an object',
        { foo: 'bar' },
        { answer: 42, correct: true },
        { answer: 'answer', correct: 42 },
      ];
      const result = parseAnswers(data);
      expect(result).toEqual([{ answer: 'answer', correct: true }]);
    });
  });

  describe('parseQuestionCategory', () => {
    test('should return null on invalid input', () => {
      const data = 'not json';
      const result = parseQuestionCategory(data);
      expect(result).toBeNull();
    });

    test('should return null on missing title', () => {
      const data = JSON.stringify({ questions: [] });
      const result = parseQuestionCategory(data);
      expect(result).toBeNull();
    });

    test('should return null on missing questions', () => {
      const data = JSON.stringify({ title: 'title' });
      const result = parseQuestionCategory(data);
      expect(result).toBeNull();
    });

    test('should parse a valid question category with extra data', () => {
      const input = {
        title: 'title',
        questions: [
          {
            question: 'question',
            answers: [{ answer: 'answer', correct: true }],
          },
        ],
      };
      const data = JSON.stringify(input);
      const result = parseQuestionCategory(data);
      expect(result).toEqual(input);
    });
  });

});
