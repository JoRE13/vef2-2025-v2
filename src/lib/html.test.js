import assert from 'node:assert';
import { describe, it } from 'node:test';
import {
  answerTemplate,
  indexTemplate,
  replaceHtmlEntities,
  stringToHtml,
  template,
} from './html.js';
import './quiet-io.js';

describe('html', () => {
  describe('template', () => {
    it('should return correct HTML', () => {
      const title = 'title';
      const body = 'body';
      const result = template(title, body);

      assert.ok(result.includes(title));
      assert.ok(result.includes(body));
    });
  });

  describe('indexTemplate', () => {
    it('should not include li for empty categories', () => {
      const result = indexTemplate([]);

      assert.ok(!result.includes('<li>'));
    });
  });

  describe('answerTemplate', () => {
    it('should return correct HTML', () => {
      const answer = { correct: true, answer: 'svar' };
      const questionIndex = 1;
      const answerIndex = 1;
      const result = answerTemplate(answer, questionIndex, answerIndex);

      assert.ok(result.includes('svar'));
      assert.ok(result.includes('answer__input'));
      assert.ok(result.includes('data-correct="true"'));
    });
  });

  describe('replaceHtmlEntities', () => {
    it('should replace & with &amp;', () => {
      const result = replaceHtmlEntities('&');

      assert.strictEqual(result, '&amp;');
    });
  });

  describe('stringToHtml', () => {
    it('should replace newlines with br', () => {
      const result = stringToHtml('foo\nbar');

      assert.ok(result.includes('<br>'));
    });
  });
});
