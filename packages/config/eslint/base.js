import js from '@eslint/js'
import { importX } from 'eslint-plugin-import-x'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export const typescript = [
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  importX.flatConfigs.typescript,
]

export function typeChecked(tsconfigRootDir) {
  return {
    languageOptions: {
      globals: globals.browser,
      parserOptions: { projectService: true, tsconfigRootDir },
    },
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver': { typescript: true },
    },
    rules: {
      'import-x/no-cycle': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
    },
  }
}

export const disableTypeChecked = tseslint.configs.disableTypeChecked
