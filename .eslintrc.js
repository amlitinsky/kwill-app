module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  ignorePatterns: ["tsconfig.json"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    // Explicitly point to your tsconfig.json and set the root dir
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-unused-vars": [
      "error",
      { vars: "all", args: "after-used", ignoreRestSiblings: false }
    ]
  }
};