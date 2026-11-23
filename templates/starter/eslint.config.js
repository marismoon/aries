import js from "@eslint/js"
import { defineConfig, globalIgnores } from "eslint/config"
import { importX } from "eslint-plugin-import-x"
import jsxA11y from "eslint-plugin-jsx-a11y"
import reactHooks from "eslint-plugin-react-hooks"
import globals from "globals"
import tseslint from "typescript-eslint"

const privateSource = "^@marismoon/(?:ui|shell)/src(?:/|$)"
const publicEntryMessage =
  "Import UI and shell through their public entry points."
const literalSource = `/${privateSource.replaceAll("/", "\\u002F")}/i`

export default defineConfig([
  globalIgnores([
    "dist/**",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    extends: [js.configs.recommended],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ regex: privateSource, message: publicEntryMessage }] },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: `ImportExpression[source.value=${literalSource}], CallExpression[callee.name="require"][arguments.0.value=${literalSource}]`,
          message: publicEntryMessage,
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      importX.flatConfigs.typescript,
    ],
    plugins: { "import-x": importX },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: { "import-x/resolver": { typescript: true } },
    rules: { "import-x/no-cycle": "error" },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["**/*.tsx"],
    extends: [
      reactHooks.configs.flat.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
  },
  {
    files: ["*.{js,ts}", "e2e/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
])
