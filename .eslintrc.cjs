module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: ["dist", ".eslintrc.cjs", "node_modules"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: { version: "18.2" },
  },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "react/prop-types": "off",
    "no-unused-vars": [
      "error",
      {
        vars: "all",
        args: "after-used",
        ignoreRestSiblings: true,
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrors: "all",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-undef": "error",
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "error",
    "no-alert": "warn",
    "no-unused-expressions": [
      "error",
      {
        allowShortCircuit: true,
        allowTernary: true,
        allowTaggedTemplates: true,
      },
    ],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: false,
      },
    ],
    "no-var": "error",
    "object-shorthand": ["error", "always"],
    "quote-props": ["error", "as-needed"],
    "react/jsx-no-target-blank": [
      "error",
      {
        allowReferrer: false,
        enforceDynamicLinks: "always",
      },
    ],
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
};

