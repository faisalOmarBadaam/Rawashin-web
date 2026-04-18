import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const SWAGGER_URL = process.env.SWAGGER_URL ?? 'https://rwashnpreproduction.runasp.net/swagger/v1/swagger.json'

const OUT_DIR = process.env.GEN_OUT_DIR ?? 'src/libs/api/__generated__'
const OPENAPI_TYPES_OUT = path.join(OUT_DIR, 'openapi.generated.ts')
const ENDPOINTS_OUT = path.join(OUT_DIR, 'endpoints.generated.ts')

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true })
}

function isUrl(v) {
  return /^https?:\/\//i.test(v)
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch swagger: ${res.status} ${res.statusText}`)
  return await res.json()
}

function extractPathParams(p) {
  return (p.match(/{([^}]+)}/g) ?? []).map(m => m.slice(1, -1))
}

function sanitizeIdentifier(id) {
  let v = id.replace(/[^A-Za-z0-9_]/g, '_')
  if (/^\d/.test(v)) v = '_' + v
  const reserved = new Set(['delete', 'default', 'class', 'function', 'var', 'let', 'const', 'new'])
  if (reserved.has(v)) v = v + '_'
  return v
}

function normalizeTag(tag) {
  const cleaned = String(tag ?? 'Default').replace(/[^\w]/g, '')
  return cleaned ? cleaned[0].toLowerCase() + cleaned.slice(1) : 'default'
}

function opKey(op, p, method) {
  // يفضل operationId لو موجود
  if (op?.operationId) {
    const s = String(op.operationId)
    return sanitizeIdentifier(s[0].toLowerCase() + s.slice(1))
  }

  // fallback: name from path + method
  const parts = p
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean)
    .map(x => (x.startsWith('{') ? 'by_' + x.slice(1, -1) : x))

  const raw = parts.join('_') + '_' + method.toUpperCase()
  const camel = raw.toLowerCase().replace(/_([a-z0-9])/g, (_, c) => String(c).toUpperCase())

  return sanitizeIdentifier(camel)
}

function emitValue(p) {
  const params = extractPathParams(p)
  if (params.length === 0) return JSON.stringify(p)

  const args = params.map(x => `${sanitizeIdentifier(x)}: string`).join(', ')
  const tpl = '`' + p.replace(/{([^}]+)}/g, '${$1}') + '`'
  const safeTpl = tpl.replace(/\$\{([^}]+)\}/g, (_, x) => '${' + sanitizeIdentifier(x) + '}')

  return `(${args}) => ${safeTpl}`
}

function generateEndpoints(swagger) {
  const collected = []

  for (const [p, methods] of Object.entries(swagger.paths ?? {})) {
    for (const [method, op] of Object.entries(methods ?? {})) {
      const tag = normalizeTag((op?.tags?.[0] ?? 'Default').trim?.() ?? op?.tags?.[0] ?? 'Default')
      const key = opKey(op, p, method)
      collected.push({ tag, key, method, path: p, value: emitValue(p) })
    }
  }

  // group by tag
  const byTag = new Map()
  for (const it of collected) {
    if (!byTag.has(it.tag)) byTag.set(it.tag, [])
    byTag.get(it.tag).push(it)
  }

  const tags = [...byTag.keys()].sort((a, b) => a.localeCompare(b))

  const lines = []
  lines.push('/* eslint-disable */')
  lines.push('/** AUTO-GENERATED — DO NOT EDIT */')
  lines.push(`/** Source: ${SWAGGER_URL} */`)
  lines.push(`/** Generated: ${new Date().toISOString()} */`)
  lines.push('')
  lines.push('export type EndpointValue = string | ((...args: any[]) => string);')
  lines.push('export const endpoints = {')

  for (const tag of tags) {
    lines.push(`  ${sanitizeIdentifier(tag)}: {`)

    const items = byTag.get(tag).sort((a, b) => (a.path + '::' + a.method).localeCompare(b.path + '::' + b.method))

    const used = new Map()

    for (const it of items) {
      const base = sanitizeIdentifier(it.key)
      const count = used.get(base) ?? 0
      used.set(base, count + 1)
      const finalKey = count === 0 ? base : `${base}_${count + 1}`

      lines.push(`    /** ${it.method.toUpperCase()} ${it.path} */`)
      lines.push(`    ${finalKey}: ${it.value},`)
      lines.push('')
    }

    lines.push('  },')
  }

  lines.push('} as const;')
  lines.push('')
  lines.push('export function resolveEndpoint<T extends EndpointValue>(')
  lines.push('  endpoint: T,')
  lines.push('  ...args: T extends (...a: infer A) => any ? A : []')
  lines.push('): string {')
  lines.push("  return typeof endpoint === 'function' ? (endpoint)(...args) : endpoint;")
  lines.push('}')
  lines.push('')

  return lines.join('\n')
}

async function main() {
  ensureDir(OUT_DIR)

  // 1) Generate OpenAPI Types (openapi-typescript CLI)
  // ملاحظة: هذا يعطيك type Paths وغيره
  execSync(`pnpm -s openapi-typescript "${SWAGGER_URL}" -o "${OPENAPI_TYPES_OUT}"`, { stdio: 'inherit' })

  // 2) Fetch swagger json for endpoints generation
  const swagger = isUrl(SWAGGER_URL) ? await fetchJson(SWAGGER_URL) : JSON.parse(fs.readFileSync(SWAGGER_URL, 'utf8'))

  // 3) Generate endpoints file
  const endpointsCode = generateEndpoints(swagger)
  fs.writeFileSync(ENDPOINTS_OUT, endpointsCode, 'utf8')

  console.log('✅ Generated:')
  console.log(' -', OPENAPI_TYPES_OUT)
  console.log(' -', ENDPOINTS_OUT)
}

main().catch(e => {
  console.error('❌ gen failed:', e)
  process.exit(1)
})
