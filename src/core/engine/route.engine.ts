const RESERVED_TERMINALS = new Set(['add', 'edit', 'view'])

const MODULE_ROOTS = new Set([
  'clients',
  'merchants',
  'employees',
  'users',
  'recharge',
  'transactions',
  'settlements',
  'support-ticket',
  'audit-logs',
])

const sanitizePathname = (pathname: string): string => {
  const [withoutQuery] = pathname.split('?')
  const [withoutHash] = withoutQuery.split('#')

  return withoutHash.trim()
}

export const resolveAddPath = (currentPathname: string): string => {
  const safePathname = sanitizePathname(currentPathname)
  const segments = safePathname.split('/').filter(Boolean)

  if (segments.length === 0) return '/add'

  const tail = segments[segments.length - 1]

  if (RESERVED_TERMINALS.has(tail)) {
    segments.pop()
  }

  if (segments.length >= 3) {
    const last = segments[segments.length - 1]
    const beforeLast = segments[segments.length - 2]
    const beforeBeforeLast = segments[segments.length - 3]

    const looksLikeEntitySubPage =
      MODULE_ROOTS.has(beforeBeforeLast) &&
      !MODULE_ROOTS.has(beforeLast) &&
      !RESERVED_TERMINALS.has(last)

    if (looksLikeEntitySubPage) {
      segments.pop()
    }
  }

  if (segments.length >= 2) {
    const last = segments[segments.length - 1]
    const beforeLast = segments[segments.length - 2]

    if (!MODULE_ROOTS.has(last) && MODULE_ROOTS.has(beforeLast)) {
      segments.pop()
    }
  }

  if (segments.length === 0) return '/add'

  return `/${segments.join('/')}/add`.replace(/\/+/g, '/')
}
