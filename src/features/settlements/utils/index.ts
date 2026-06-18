import dayjs from 'dayjs'

export function formatSettlementDate(
  value?: string | null,
  fallback = '—',
) {
  if (!value) return fallback

  const parsed = dayjs(value)
  if (!parsed.isValid()) return value

  return parsed.format('YYYY/MM/DD HH:mm')
}

export function formatSettlementCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}