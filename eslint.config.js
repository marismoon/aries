import js from '@eslint/js'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { importX } from 'eslint-plugin-import-x'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const nonSolarIcons = {
  group: [
    'lucide-react',
    '@tabler/*',
    '@phosphor-icons/*',
    '@hugeicons/*',
    '@remixicon/*',
    'react-icons',
    'react-icons/*',
  ],
  message: 'Marismoon only uses Solar icons: import from @marismoon/ui/icons.',
}

export default defineConfig([
  globalIgnores(['**/dist', '**/coverage', '**/playwright-report', '**/test-results', '**/artifacts']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      importX.flatConfigs.typescript,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { 'import-x': importX },
    settings: {
      'import-x/resolver': { typescript: true },
    },
    rules: {
      'import-x/no-cycle': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      'react-refresh/only-export-components': 'off',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?:lucide-react|@solar-icons/react|@/app/\\(create\\)/components/icon-placeholder)(?:/|$)',
              message: 'Use Solar icons from @/components/icons.',
            },
          ],
        },
      ],
    },
  },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['**/*.tsx'],
  },
  {
    // Layering: packages/ui (ui <- shared) <- apps/demo (layout <- features <- app).
    // packages/ui must never import from apps/demo, and ui must not import shared.
    files: ['packages/ui/src/components/ui/**', 'packages/ui/src/lib/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?:@marismoon/demo|@/)|(?:\\.\\./)+shared(?:/|$)',
              message: 'packages/ui/ui and lib must not import apps/demo or shared.',
            },
            nonSolarIcons,
          ],
        },
      ],
    },
  },
  {
    files: ['packages/ui/src/components/{shared,icons,motion}/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              regex: '^(?:@marismoon/demo|@/)',
              message: 'packages/ui must not import apps/demo.',
            },
            nonSolarIcons,
          ],
        },
      ],
    },
  },
  {
    files: ['apps/demo/src/{features,app}/**', 'apps/demo/src/components/layout/**'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [nonSolarIcons] }],
    },
  },
  {
    // Output of `shadcn add`, kept verbatim so the CLI can diff and update it.
    files: [
      'packages/ui/src/components/ui/{carousel,chart,code-block,input-group}.tsx',
      'packages/ui/src/hooks/use-mobile.ts',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'jsx-a11y/no-noninteractive-tabindex': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
    },
  },
  {
    // Official shadcn examples, kept close to upstream so they can be refreshed.
    files: ['apps/demo/src/features/settings/examples/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      'jsx-a11y/anchor-is-valid': 'off',
      'jsx-a11y/anchor-has-content': 'off',
      'jsx-a11y/img-redundant-alt': 'off',
    },
  },
  {
    files: ['**/*.{js,mjs}', 'apps/demo/e2e/**', 'apps/demo/scripts/**', '**/*.config.ts'],
    ...tseslint.configs.disableTypeChecked,
  },
])
