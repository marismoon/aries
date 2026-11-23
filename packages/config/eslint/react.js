import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export const react = [
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  { rules: { 'react-refresh/only-export-components': 'off' } },
]

export const accessibility = jsxA11y.flatConfigs.recommended

// Output of `shadcn add`, kept verbatim so the CLI can diff and update it.
export const shadcnRules = {
  'react-hooks/set-state-in-effect': 'off',
  'jsx-a11y/no-noninteractive-tabindex': 'off',
  'jsx-a11y/click-events-have-key-events': 'off',
  'jsx-a11y/no-noninteractive-element-interactions': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/no-unnecessary-type-assertion': 'off',
}

// Official shadcn examples, kept close to upstream so they can be refreshed.
export const exampleRules = {
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
}
