import pluginJs from '@eslint/js';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    ...pluginJs.configs.recommended,
    rules: {
      // Disallow console.log
      'no-console': [
        'error',
        { allow: ['info', 'group', 'groupEnd', 'error'] },
      ],
    },
  },
];
