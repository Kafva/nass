/* eslint-disable */
module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020
  },
  plugins: ["@typescript-eslint", "svelte3"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],

  rules: {
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "no-case-declarations": "off",
    "indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }

}



/*
{
  "root": true,
  "env": {
    "browser": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "overrides": [
    {
      "files": ["*.svelte"],
      "processor": "svelte3/svelte3"
    }
  ],
  "plugins": ["@typescript-eslint", "svelte3"],
  "rules": {
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "no-case-declarations": "off",
    "indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  }
}
*/
