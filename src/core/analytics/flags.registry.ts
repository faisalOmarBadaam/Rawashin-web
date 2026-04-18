export const analyticsFlags = [
  'ui.new_topbar',
  'perf.prefetch_clients',
  'feature.attachments_v2'
] as const

export type AnalyticsFlagKey = (typeof analyticsFlags)[number]
