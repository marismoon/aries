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

export const sourceImports = {
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
}

export const uiPrimitiveImports = {
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
}

export const uiSharedImports = {
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
}

export const demoImports = {
  'no-restricted-imports': ['error', { patterns: [nonSolarIcons] }],
}

// Existing color literals are checked manually under AGENTS.md §3 and §9.
// The exemptions for existing declarations apply only to these files:
// apps/demo/src/components/layout/layout.css
// apps/demo/src/features/copilot/copilot.css
// apps/demo/src/features/overview/components/overview-workflow.css
// apps/demo/src/features/settings/motion-demos.css
// apps/demo/src/features/settings/interaction-demos.css
// apps/demo/src/features/settings/aceternity-demos.css
// apps/demo/src/features/settings/base-pages/base-pages.css
