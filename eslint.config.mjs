import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // React & Next.js
      "@next/next/no-img-element": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/no-unescaped-entities": "error",
      "react/jsx-key": "error",
      
      // TypeScript
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-const": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      
      // General
      "no-console": "warn",
      "no-debugger": "error",
      "prefer-const": "error",
      "no-var": "error",
      
      // Styling
      "react/no-unknown-property": "error",
      "@next/next/no-page-custom-font": "error",
    },
  },
];

export default eslintConfig;
