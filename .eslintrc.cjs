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
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    extraFileExtensions: [".svelte"]
  },
  plugins: ["@typescript-eslint", "svelte3"],
  overrides: [{ files: ["*.svelte"], processor: "svelte3/svelte3" }],
  settings: {
    "svelte3/typescript": require("typescript")
  },
  rules: {
    "prefer-arrow-callback": "warn",
    "prefer-const": "warn",
    "no-case-declarations": "off",
    "indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off"
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "vite.config.ts",
    "public"
  ]
}
