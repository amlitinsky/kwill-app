import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    // These files/directories will be ignored by ESLint:
    ignores: ["tsconfig.json", ".eslintrc.js", ".next/", "node_modules/"],
  },
  {
    // This configuration applies to all JavaScript, TypeScript, and JSX/TSX files.
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsEslintPlugin,
    },
    rules: {
      "no-unused-vars": [
        "error",
        { vars: "all", args: "after-used", ignoreRestSiblings: false },
      ],
      // Additional rules can be added here.
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]; 