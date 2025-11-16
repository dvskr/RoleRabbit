module.exports = {
  // TypeScript/JavaScript files
  '**/*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'npm run type-check --workspaces --if-present',
  ],

  // JSON, YAML, Markdown files
  '**/*.{json,yaml,yml,md}': ['prettier --write'],

  // CSS files
  '**/*.{css,scss}': ['prettier --write'],

  // Run tests for changed files (optional - can be slow)
  // '**/*.{ts,tsx}': ['npm run test:affected --'],
};
