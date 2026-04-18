/* global process, console */
import { spawnSync } from 'node:child_process'

const result = spawnSync('pnpm', ['build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    ANALYZE: 'true'
  }
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('Bundle analyze build finished (ANALYZE=true).')
