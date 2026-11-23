import { defineConfig, globalIgnores } from 'eslint/config'
import { disableTypeChecked, typeChecked, typescript } from '@marismoon/config/eslint/base'
import { accessibility, exampleRules, react, shadcnRules } from '@marismoon/config/eslint/react'
import { demoImports, publicImports, shellImports, sourceImports, uiImports, uiPrimitiveImports, uiSharedImports, uiSourceImports } from '@marismoon/config/eslint/boundaries'

export default defineConfig([
  globalIgnores(['**/dist', '**/coverage', '**/playwright-report', '**/test-results', '**/artifacts']),
  { rules: publicImports },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [typescript, react, typeChecked(import.meta.dirname)],
    rules: sourceImports,
  },
  { files: ['**/*.tsx'], extends: [accessibility] },
  { files: ['packages/ui/**'], rules: uiImports },
  { files: ['packages/ui/**/*.{ts,tsx}'], rules: uiSourceImports },
  {
    files: ['packages/ui/src/components/ui/**', 'packages/ui/src/lib/**'],
    rules: uiPrimitiveImports,
  },
  {
    files: ['packages/ui/src/components/{shared,icons,motion}/**'],
    rules: uiSharedImports,
  },
  {
    files: ['apps/demo/src/{features,app}/**'],
    rules: demoImports,
  },
  { files: ['packages/shell/**'], rules: shellImports },
  {
    files: [
      'packages/ui/src/components/ui/{carousel,chart,code-block,input-group}.tsx',
      'packages/ui/src/hooks/use-mobile.ts',
    ],
    rules: shadcnRules,
  },
  { files: ['apps/demo/src/features/settings/examples/**'], rules: exampleRules },
  {
    files: ['**/*.{js,mjs}', 'apps/demo/e2e/**', 'apps/demo/scripts/**', '**/*.config.ts'],
    ...disableTypeChecked,
  },
])
