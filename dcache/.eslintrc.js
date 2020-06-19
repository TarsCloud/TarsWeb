module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    "import/no-dynamic-require": 0,
    "no-console": 0,
    "camelcase": 0,
    "func-names": 0,
    "max-len": ["error", 300],
    "no-param-reassign": ["error", { "props": false }],
    "prefer-const": ["error", {
      "destructuring": "all",
      "ignoreReadBeforeAssign": false
    }],
    "no-underscore-dangle": ["error", { "allow": ["__return"] }],
    "no-shadow": ["error", { "allow": ["path"] }],
    "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
    "object-curly-newline": 0
  },
};
