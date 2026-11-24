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
  message: 'Aries only uses Solar icons: import from @marismoon/ui/icons.',
}

const sourceIcons = {
  regex: '^(?:lucide-react|@solar-icons/react|@/app/\\(create\\)/components/icon-placeholder)(?:/|$)',
  message: 'Use Solar icons from @/components/icons.',
}

const primitiveLayers = {
  regex: '^(?:@marismoon/demo|@/)|(?:\\.\\./)+shared(?:/|$)',
  message: 'packages/ui/ui and lib must not import apps/demo or shared.',
}

const sharedLayers = {
  regex: '^(?:@marismoon/demo|@/)',
  message: 'packages/ui must not import apps/demo.',
}

const privateSources = {
  regex: '^@marismoon/(?:ui|shell)/src(?:/|$)',
  message: 'Use a public entry point of the workspace package.',
}

const appImports = {
  regex: '^(?:@marismoon/demo(?:/|$)|/?(?:\\.\\.?/)*apps/)',
  message: 'Import application code only from its own application.',
}

const starterAndAppAliases = {
  regex: '^(?:@/|@marismoon/starter(?:/|$)|/?(?:\\.\\.?/)*templates/starter(?:/|$))',
  message: 'Shared packages must not import the starter or an application alias.',
}

const shellFromUi = {
  regex: '^(?:@marismoon/shell|/?packages/shell|(?:\\.\\./)+(?:packages/)?shell)(?:/|$)',
  message: 'The UI package must not depend on the shell.',
}

const hostDependencies = {
  regex: '^(?:react-router(?:-dom)?|i18next|react-i18next|@marismoon/core|motion)(?:/|$)',
  message: 'The shell receives routing, translated text and host integrations through its public API.',
}

// ESLint replaces rule options per matching config. Compose each directory's full policy.
function restrictImports(oldPatterns, boundaries = []) {
  const limits = [privateSources, ...boundaries]
  return {
    'no-restricted-imports': ['error', { patterns: [...oldPatterns, ...limits] }],
    // Apply the package boundaries to literal lazy imports and CommonJS loads as well.
    'no-restricted-syntax': ['error', ...limits.map(({ regex, message }) => {
      const match = `/${regex.replaceAll('/', '\\u002F')}/i`
      return {
        selector: `ImportExpression[source.value=${match}], CallExpression[callee.name="require"][arguments.0.value=${match}]`,
        message,
      }
    })],
  }
}

const uiBoundaries = [appImports, starterAndAppAliases, shellFromUi]

export const publicImports = restrictImports([])
export const sourceImports = restrictImports([sourceIcons])
export const uiImports = restrictImports([], uiBoundaries)
export const uiSourceImports = restrictImports([sourceIcons], uiBoundaries)
export const uiPrimitiveImports = restrictImports([primitiveLayers, nonSolarIcons], uiBoundaries)
export const uiSharedImports = restrictImports([sharedLayers, nonSolarIcons], uiBoundaries)
export const demoImports = restrictImports([nonSolarIcons])
export const shellImports = restrictImports([nonSolarIcons], [appImports, starterAndAppAliases, hostDependencies])
export const starterImports = restrictImports([sourceIcons], [appImports])

// Existing color literals are checked manually under AGENTS.md §3 and §9.
// The exemptions for existing declarations apply only to these files:
// packages/shell/src/styles/layout.css
// apps/demo/src/features/copilot/copilot.css
// apps/demo/src/features/overview/components/overview-workflow.css
// apps/demo/src/features/settings/motion-demos.css
// apps/demo/src/features/settings/interaction-demos.css
// apps/demo/src/features/settings/aceternity-demos.css
// apps/demo/src/features/settings/base-pages/base-pages.css
