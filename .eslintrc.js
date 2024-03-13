module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-param-reassign': 'off',
    'no-shadow': 'off',
    'no-console': 'off',
    camelcase: 'off',
    'max-len': [1, 150, 2, { ignoreComments: true }],
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: true },
    ],
    'import/extensions': [
      'error',
      'always',
    ],
  },
};
