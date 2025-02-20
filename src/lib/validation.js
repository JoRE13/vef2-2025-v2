import { body } from 'express-validator';
import xss from 'xss';
import { getDatabase } from './db.js';

export function createQuestionValidationMiddleware() {
    return [
      body('categories').custom(async (value) => {
        const categories = (await getDatabase()?.getCategories()) ?? [];
  
        if (!categories.find((c) => c.id.toString() === value)) {
          throw new Error('Flokkur verður að vera gildur');
        }
        return true;
      }),
  
      body('question')
        .trim()
        .notEmpty()
        .isLength({ min: 5, max: 500 })
        .withMessage('Spurning verður að vera strengur á bilinu 5 til 50 stafir'),
  
      body('answer')
        .isArray({ min: 4, max: 4 })
        .withMessage('Það verða að vera 4 svör')
        .custom((value) => {
          if (!value.every((ans) => typeof ans === 'string' && ans.trim() !== '')) {
            throw new Error('Öll svör verða að vera strengir og ekki vera tómir');
          }
          return true;
        }),
  
      body('correct')
        .isArray({ min: 4, max: 4 })
        .withMessage('Það verða að vera 4 rétt svör')
        .custom((value) => {
          if (!value.every((ans) => ans === '0' || ans === '1')) {
            throw new Error('Svör verða að vera sönn eða ósönn');
          }
          const ones = value.filter((v) => v === '1').length;
          const zeros = value.filter((v) => v === '0').length;
  
          if (ones !== 1 || zeros !== 3) {
            throw new Error('Það verða aðvera þrjú ósönn og eitt satt svar.');
          }
          return true;
        }),
    ];
  }

// Viljum keyra sér og með validation, ver gegn „self XSS“
export function xssSanitizationMiddleware() {
  return [
    body('categories').customSanitizer((v) => xss(v)),
    body('question').customSanitizer((v) => xss(v)),
    body('answer').customSanitizer((v) =>
      Array.isArray(v) ? v.map((item) => xss(item)) : xss(v)
    ),
    body('correct').customSanitizer((v) =>
      Array.isArray(v) ? v.map((item) => xss(item)) : xss(v)
    ),
  ];
}

export function sanitizationMiddleware() {
  return [
    body('categories').trim().escape(),
    body('question').trim().escape(),
    body('answer').customSanitizer((v) =>
      Array.isArray(v)
        ? v.map((item) =>
            item.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
          )
        : v
    ),
    body('correct').customSanitizer((v) =>
      Array.isArray(v)
        ? v.map((item) =>
            item.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')
          )
        : v
    ),
  ];
}
