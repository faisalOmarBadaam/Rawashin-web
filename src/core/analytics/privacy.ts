const SENSITIVE_CAPTURE_PATH_PATTERNS: RegExp[] = [
  /\/login(?:\/|$)/i,
  /\/register(?:\/|$)/i,
  /\/add(?:\/|$)/i,
  /\/edit(?:\/|$)/i,
  /\/charge(?:\/|$)/i,
  /\/deposit(?:\/|$)/i,
  /\/transactions(?:\/|$)/i,
  /\/settlements(?:\/|$)/i
]

const SENSITIVE_RECORDING_PATH_PATTERNS: RegExp[] = [
  /\/login(?:\/|$)/i,
  /\/register(?:\/|$)/i,
  /\/add(?:\/|$)/i,
  /\/edit(?:\/|$)/i,
  /\/charge(?:\/|$)/i,
  /\/deposit(?:\/|$)/i,
  /\/transactions(?:\/|$)/i,
  /\/settlements(?:\/|$)/i,
  /\/support-ticket(?:\/|$)/i
]

export const SENSITIVE_BLOCK_SELECTOR =
  [
    'input[type="password"]',
    'input[name*="password" i]',
    'input[name*="national" i]',
    'input[name*="identity" i]',
    'input[name*="phone" i]',
    'input[name*="email" i]',
    'input[name*="card" i]',
    'textarea[name*="note" i]',
    '[data-private="true"]'
  ].join(', ')

const matchesAnyPattern = (pathname: string, patterns: RegExp[]): boolean => {
  return patterns.some(pattern => pattern.test(pathname))
}

export const shouldDisableRecordingForPath = (pathname: string): boolean => {
  return matchesAnyPattern(pathname, SENSITIVE_RECORDING_PATH_PATTERNS)
}

export const shouldDisableCaptureForPath = (pathname: string): boolean => {
  return matchesAnyPattern(pathname, SENSITIVE_CAPTURE_PATH_PATTERNS)
}

export const canRecordForRoles = (roles: string[]): boolean => {
  if (!roles.length) return false

  return roles.some(role => role === 'Admin' || role === 'Employee')
}
