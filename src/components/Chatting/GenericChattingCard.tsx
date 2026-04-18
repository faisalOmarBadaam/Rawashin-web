'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

import { alpha } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'

export type GenericChatMessage = {
  id: string
  senderName: string
  message: string
  createdAt?: string | null
  [key: string]: unknown
}

type Props<TMessage extends GenericChatMessage> = {
  title?: React.ReactNode
  subtitle?: React.ReactNode

  error?: string | null
  onRetry?: () => void

  loading?: boolean
  sending?: boolean
  disableSend?: boolean

  messages: TMessage[]
  emptyText?: string

  height?: { xs: number; md: number } | number
  sx?: SxProps<Theme>

  inputLabel?: string
  sendButtonText?: string

  autoScroll?: boolean
  getIsRightAligned?: (message: TMessage) => boolean
  formatTimestamp?: (createdAt?: string | null, message?: TMessage) => string

  renderMessage?: (message: TMessage) => React.ReactNode

  onSend: (text: string) => Promise<void>
  onSendError?: (error: unknown) => void
  onSendSuccess?: () => void
}

const defaultFormatTimestamp = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—')

function DefaultBubble({
  senderName,
  message,
  createdAt,
  isRightAligned,
  formatTimestamp
}: {
  senderName: string
  message: string
  createdAt?: string | null
  isRightAligned: boolean
  formatTimestamp: (createdAt?: string | null) => string
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isRightAligned ? 'flex-end' : 'flex-start',
        gap: 0.5
      }}
    >
      <Typography variant='caption' color='text.secondary' sx={{ px: 0.5 }}>
        {senderName}
      </Typography>

      <Box
        sx={theme => {
          const baseColor = isRightAligned ? theme.palette.primary.main : theme.palette.grey[600]
          const bg = isRightAligned
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.22 : 0.12)
            : alpha(theme.palette.grey[500], theme.palette.mode === 'dark' ? 0.18 : 0.1)

          return {
            maxWidth: 'min(680px, 100%)',
            p: 1.5,
            borderRadius: 2,
            bgcolor: bg,
            border: `1px solid ${alpha(baseColor, 0.25)}`,
            boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 1px 0 rgba(0,0,0,0.03)'
          }
        }}
      >
        <Typography variant='body2' sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.9 }}>
          {message}
        </Typography>
      </Box>

      <Typography variant='caption' color='text.disabled' sx={{ px: 0.5 }}>
        {formatTimestamp(createdAt)}
      </Typography>
    </Box>
  )
}

export default function GenericChattingCard<TMessage extends GenericChatMessage>({
  title,
  subtitle,
  error,
  onRetry,
  loading = false,
  sending = false,
  disableSend = false,
  messages,
  emptyText = 'لا توجد رسائل بعد.',
  height = { xs: 360, md: 420 },
  sx,
  inputLabel = 'اكتب رسالة',
  sendButtonText = 'إرسال',
  autoScroll = true,
  getIsRightAligned,
  formatTimestamp,
  renderMessage,
  onSend,
  onSendError,
  onSendSuccess
}: Props<TMessage>) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const normalizedHeight = useMemo(() => {
    if (typeof height === 'number') return { xs: height, md: height }
    return height
  }, [height])

  const resolveIsRightAligned = (m: TMessage) => (getIsRightAligned ? getIsRightAligned(m) : false)

  const resolveTimestamp = (value?: string | null, m?: TMessage) =>
    formatTimestamp ? formatTimestamp(value, m) : defaultFormatTimestamp(value)

  useEffect(() => {
    if (!autoScroll) return
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [autoScroll, loading, messages.length])

  const submit = async () => {
    const text = draft.trim()
    if (!text || sending) return

    try {
      await onSend(text)
      setDraft('')
      onSendSuccess?.()
    } catch (e) {
      onSendError?.(e)
    }
  }

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          {title || subtitle ? (
            <Box>
              {title ? (
                <Typography variant='h6' fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {title}
                </Typography>
              ) : null}

              {subtitle ? (
                <Typography variant='body2' color='text.secondary'>
                  {subtitle}
                </Typography>
              ) : null}
            </Box>
          ) : null}

          <Divider />

          {error ? (
            <Alert
              severity='error'
              action={
                onRetry ? (
                  <Button color='inherit' size='small' onClick={onRetry}>
                    إعادة المحاولة
                  </Button>
                ) : undefined
              }
            >
              {error}
            </Alert>
          ) : null}

          <Box
            ref={scrollRef}
            sx={theme => ({
              height: normalizedHeight,
              overflowY: 'auto',
              p: 2,
              borderRadius: 2,
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'grey.50',
              border: `1px solid ${theme.palette.divider}`
            })}
          >
            {loading ? (
              <Box display='flex' justifyContent='center' py={6}>
                <CircularProgress size={24} />
              </Box>
            ) : messages.length === 0 ? (
              <Typography variant='body2' color='text.secondary' textAlign='center' py={6}>
                {emptyText}
              </Typography>
            ) : (
              <Stack spacing={2}>
                {messages.map(m => (
                  <Box key={m.id}>
                    {renderMessage ? (
                      renderMessage(m)
                    ) : (
                      <DefaultBubble
                        senderName={m.senderName}
                        message={m.message}
                        createdAt={m.createdAt}
                        isRightAligned={resolveIsRightAligned(m)}
                        formatTimestamp={value => resolveTimestamp(value, m)}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }}>
            <TextField
              fullWidth
              minRows={2}
              maxRows={6}
              multiline
              label={inputLabel}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={async e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  if (disableSend) {
                    return
                  }
                  e.preventDefault()
                  await submit()
                }
              }}
            />

            <Button
              variant='contained'
              disabled={!draft.trim() || sending || disableSend}
              startIcon={
                sending ? <CircularProgress size={18} color='inherit' /> : <i className='ri-send-plane-2-line' />
              }
              onClick={submit}
            >
              {sendButtonText}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
