import { readFile, readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = new URL('../', import.meta.url).pathname
const appRoots = ['src/App.tsx', 'src/app', 'src/design-system', '.storybook']
const errors = []

async function walk(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const target = join(path, entry.name)
      if (entry.isDirectory()) files.push(...await walk(target))
      else if (/\.(tsx?|css)$/.test(entry.name)) files.push(target)
    }
    return files
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

const appFiles = (await Promise.all(appRoots.map(async (path) => {
  const target = join(root, path)
  if (!path.endsWith('.tsx')) return walk(target)
  await stat(target)
  return [target]
}))).flat().filter((file) => !file.endsWith('tokens.css'))
for (const file of appFiles) {
  const source = await readFile(file, 'utf8')
  const path = relative(root, file)
  const rules = [
    [/from\s+['"](?:@\/components\/ui|\.\.\/components\/ui)/, 'import public components from the design-system entry point'],
    [/\bstyle\s*=\s*\{/, 'do not use inline visual styles; define a token or use a token utility'],
    [/#(?:[\da-f]{3,8})\b|\b(?:rgb|hsl|oklch)a?\s*\(/i, 'move literal colors into src/design-system/tokens.css'],
    [/(?:^|\s)(?:-?(?:m|p|gap|w|h|min-w|min-h|max-w|max-h|text|bg|border|rounded|shadow)-\[[^\]]+\])/m, 'replace arbitrary Tailwind values with a named token utility'],
    [/\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw)\b/, 'move literal dimensions into src/design-system/tokens.css'],
  ]
  for (const [pattern, message] of rules) if (pattern.test(source)) errors.push(`${path}: ${message}`)
}

if (errors.length) {
  console.error(errors.map((error) => `✗ ${error}`).join('\n'))
  process.exitCode = 1
} else {
  console.log(`Design system token rules passed for ${appFiles.length} consuming app file(s).`)
}
