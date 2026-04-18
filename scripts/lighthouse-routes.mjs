/* global process, console */
import { spawnSync } from 'node:child_process'

const routes = ['/ar/home', '/ar/clients', '/ar/employees', '/ar/users', '/ar/transactions']
const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? 'http://localhost:3000'

const hasLighthouse = spawnSync('npx', ['lighthouse', '--version'], {
  stdio: 'pipe',
  shell: process.platform === 'win32'
})

if (hasLighthouse.status !== 0) {
  console.error('lighthouse is not available. Install it with: pnpm add -D lighthouse')
  process.exit(1)
}

let hasError = false

for (const route of routes) {
  const url = `${baseUrl}${route}`
  const outputFile = `./.lighthouse-${route.replace(/[^a-zA-Z0-9]/g, '_')}.json`

  console.log(`Running lighthouse for ${url}`)

  const result = spawnSync(
    'npx',
    [
      'lighthouse',
      url,
      '--quiet',
      '--chrome-flags=--headless --no-sandbox --disable-gpu',
      '--output=json',
      `--output-path=${outputFile}`
    ],
    {
      stdio: 'inherit',
      shell: process.platform === 'win32'
    }
  )

  if (result.status !== 0) {
    hasError = true
  }
}

if (hasError) {
  process.exit(1)
}

console.log('Lighthouse completed for all configured routes.')
