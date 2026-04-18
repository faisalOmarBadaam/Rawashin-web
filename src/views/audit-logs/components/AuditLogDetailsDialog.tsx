'use client'

import { useMemo } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import type { AuditLogDto } from '@/types/api/auditLogs'

type Props = {
  open: boolean
  auditLog: AuditLogDto | null
  onClose: () => void
}

type EffectEntry = {
  field: string
  oldValue: unknown
  newValue: unknown
}

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

const formatDateTime = (value?: string | null) => {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const parseJsonRecord = (value?: string | null): Record<string, unknown> => {
  if (!value?.trim()) return {}

  try {
    const parsed = JSON.parse(value) as unknown

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }

    return {}
  } catch {
    return {}
  }
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value || '—'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

const buildEntries = (auditLog: AuditLogDto | null): EffectEntry[] => {
  if (!auditLog) return []

  const record = parseJsonRecord(auditLog.effectedColumnsJson)

  return Object.entries(record).map(([field, change]) => {
    const normalizedChange =
      change && typeof change === 'object' ? (change as Record<string, unknown>) : {}

    return {
      field,
      oldValue: normalizedChange.old,
      newValue: normalizedChange.new,
    }
  })
}

function ValueBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, minHeight: 120, bgcolor: 'background.default' }}>
      <Stack spacing={1}>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Box
          component="pre"
          sx={{
            m: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {formatValue(value)}
        </Box>
      </Stack>
    </Paper>
  )
}

export default function AuditLogDetailsDialog({ open, auditLog, onClose }: Props) {
  const entries = useMemo(() => buildEntries(auditLog), [auditLog])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>تفاصيل التغييرات</DialogTitle>

      <DialogContent dividers>
        {auditLog ? (
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap">
              <Chip label={`ID: ${auditLog.id}`} variant="outlined" />
              <Chip
                label={`الإجراء: ${auditLog.action ?? '—'}`}
                color="primary"
                variant="outlined"
              />
              <Chip label={`الجدول: ${auditLog.entityName ?? '—'}`} variant="outlined" />
              <Chip label={`الاسم: ${auditLog.fullName ?? '—'}`} variant="outlined" />
              <Chip label={`الوقت: ${formatDateTime(auditLog.eventTime)}`} variant="outlined" />
            </Stack>

            <Divider />

            {entries.length > 0 ? (
              <Stack spacing={2}>
                {entries.map(entry => (
                  <Paper key={entry.field} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {entry.field}
                      </Typography>

                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                          gap: 2,
                        }}
                      >
                        <ValueBlock title="القيمة القديمة" value={entry.oldValue} />
                        <ValueBlock title="القيمة الجديدة" value={entry.newValue} />
                      </Box>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  لا توجد تفاصيل تغييرات قابلة للعرض.
                </Typography>
              </Paper>
            )}
          </Stack>
        ) : null}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          إغلاق
        </Button>
      </DialogActions>
    </Dialog>
  )
}
