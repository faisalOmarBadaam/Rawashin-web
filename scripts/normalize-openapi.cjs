/* global require, console */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs')

const inputPath = 'swagger.json'
const outputPath = 'swagger.corrected.json'
const reportPath = 'swagger.corrections.report.json'

const spec = JSON.parse(fs.readFileSync(inputPath, 'utf8'))

const issues = []
const fixes = []

function addIssue(issue, fix) {
  issues.push(issue)
  fixes.push(fix)
}

function normalizeContent(content, where) {
  if (!content || typeof content !== 'object') return content

  const keys = Object.keys(content)

  if (content['multipart/form-data']) {
    const out = { 'multipart/form-data': content['multipart/form-data'] }

    if (!(keys.length === 1 && keys[0] === 'multipart/form-data')) {
      addIssue(
        where + ': redundant content types (' + keys.join(', ') + ')',
        where + ': kept multipart/form-data only'
      )
    }

    return out
  }

  let chosen = null
  if (content['application/json']) chosen = content['application/json']
  else if (content['application/*+json']) chosen = content['application/*+json']
  else if (content['text/json']) chosen = content['text/json']
  else if (content['text/plain']) chosen = content['text/plain']

  if (chosen) {
    if (!(keys.length === 1 && keys[0] === 'application/json')) {
      addIssue(
        where + ': redundant/nonstandard content types (' + keys.join(', ') + ')',
        where + ': normalized to application/json'
      )
    }

    return { 'application/json': chosen }
  }

  return content
}

const paths = spec.paths || {}

for (const pathKey of Object.keys(paths)) {
  const operations = paths[pathKey] || {}

  for (const methodKey of Object.keys(operations)) {
    const operation = operations[methodKey]
    if (!operation || typeof operation !== 'object') continue

    if (Array.isArray(operation.parameters)) {
      const seen = new Set()
      const deduped = []

      for (const param of operation.parameters) {
        if (!param || typeof param !== 'object') {
          deduped.push(param)
          continue
        }

        const unique = String(param.name) + '|' + String(param.in)
        if (seen.has(unique)) {
          addIssue(
            methodKey.toUpperCase() + ' ' + pathKey + ': duplicate parameter ' + unique,
            methodKey.toUpperCase() + ' ' + pathKey + ': removed duplicate parameter ' + unique
          )
          continue
        }

        seen.add(unique)

        if (param.in === 'path' && param.required !== true) {
          addIssue(
            methodKey.toUpperCase() + ' ' + pathKey + ': path param ' + param.name + ' required mismatch',
            methodKey.toUpperCase() + ' ' + pathKey + ': set path param ' + param.name + ' required=true'
          )
          param.required = true
        }

        deduped.push(param)
      }

      operation.parameters = deduped
    }

    if (operation.requestBody && operation.requestBody.content) {
      operation.requestBody.content = normalizeContent(
        operation.requestBody.content,
        methodKey.toUpperCase() + ' ' + pathKey + ' requestBody'
      )
    }

    const responses = operation.responses
    if (!responses || typeof responses !== 'object') continue

    for (const code of Object.keys(responses)) {
      const response = responses[code]
      if (!response || typeof response !== 'object') continue

      if (pathKey.endsWith('/download') && methodKey.toLowerCase() === 'get') {
        const desired = {
          'application/octet-stream': {
            schema: {
              type: 'string',
              format: 'binary'
            }
          }
        }

        response.content = desired
        addIssue(
          methodKey.toUpperCase() + ' ' + pathKey + ' ' + code + ': binary response schema missing/unspecified',
          methodKey.toUpperCase() + ' ' + pathKey + ' ' + code + ': set application/octet-stream binary schema'
        )
        continue
      }

      if (response.content) {
        response.content = normalizeContent(
          response.content,
          methodKey.toUpperCase() + ' ' + pathKey + ' ' + code + ' response'
        )
      } else {
        response.content = {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/ObjectApiResponse'
            }
          }
        }

        addIssue(
          methodKey.toUpperCase() + ' ' + pathKey + ' ' + code + ': response content missing',
          methodKey.toUpperCase() + ' ' + pathKey + ' ' + code + ': set application/json ObjectApiResponse'
        )
      }
    }
  }
}

spec.components = spec.components || {}
spec.components.securitySchemes = spec.components.securitySchemes || {}

if (spec.components.securitySchemes.Bearer) {
  const current = spec.components.securitySchemes.Bearer

  if (current.type !== 'http' || current.scheme !== 'bearer') {
    spec.components.securitySchemes.Bearer = {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        current.description ||
        'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
    }

    addIssue(
      'components.securitySchemes.Bearer: invalid bearer scheme typing',
      'components.securitySchemes.Bearer: normalized to http bearer JWT'
    )
  }
}

const schemas = spec.components.schemas || {}

if (
  schemas.ObjectApiResponse &&
  schemas.ObjectApiResponse.properties &&
  schemas.ObjectApiResponse.properties.data &&
  typeof schemas.ObjectApiResponse.properties.data === 'object' &&
  !schemas.ObjectApiResponse.properties.data.type
) {
  schemas.ObjectApiResponse.properties.data.type = 'object'
  schemas.ObjectApiResponse.properties.data.additionalProperties = true

  addIssue(
    'components.schemas.ObjectApiResponse.properties.data: missing explicit type with nullable=true',
    'components.schemas.ObjectApiResponse.properties.data: set type=object, additionalProperties=true'
  )
}

fs.writeFileSync(outputPath, JSON.stringify(spec, null, 2), 'utf8')
fs.writeFileSync(reportPath, JSON.stringify({ issues, fixes }, null, 2), 'utf8')

console.log('WROTE', outputPath)
console.log('ISSUES', issues.length)
console.log('FIXES', fixes.length)
