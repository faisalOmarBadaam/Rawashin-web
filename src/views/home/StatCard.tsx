import { useEffect, useMemo, useState } from 'react'

import { Icon } from '@iconify/react'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'

type StatCardProps = {
  title: string
  value?: number
  locale?: string
  icon: string
  iconLabel?: string
  trendPercent?: number
  precision?: number
  durationMs?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  subtitle?: string
  loading?: boolean
}

const useAnimatedNumber = (
  target: number,
  options: { durationMs?: number; precision?: number } = {},
) => {
  const { durationMs = 900, precision = 0 } = options
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    let rafId = 0

    const tick = (time: number) => {
      const progress = Math.min((time - start) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = target * eased

      setDisplayValue(Number(next.toFixed(precision)))

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [target, durationMs, precision])

  return displayValue
}

export function StatCard({
  title,
  value = 0,
  locale = 'en-US',
  icon,
  iconLabel,
  trendPercent,
  precision = 0,
  durationMs = 900,
  color = 'primary',
  subtitle,
  loading = false,
}: StatCardProps) {
  const theme = useTheme()
  const mainColor = theme.palette[color].main

  const animatedValue = useAnimatedNumber(value, {
    durationMs,
    precision,
  })

  const formattedValue = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: precision }).format(animatedValue),
    [animatedValue, locale, precision],
  )

  const trendColor =
    trendPercent && trendPercent < 0 ? theme.palette.error.main : theme.palette.success.main

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: alpha(mainColor, theme.palette.mode === 'dark' ? 0.18 : 0.08),
        border: `1px solid ${alpha(mainColor, 0.16)}`,
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-2px) scale(1.01)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent
        sx={{
          p: theme.spacing(2.25),
          '&:last-child': {
            pb: theme.spacing(2.25),
          },
        }}
      >
        <Stack spacing={1.75}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <Box>
              <Typography variant="h6" color="text.secondary" fontWeight={800} lineHeight={1.2}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                bgcolor: alpha(mainColor, theme.palette.mode === 'dark' ? 0.28 : 0.2),
                color: mainColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label={iconLabel ?? title}
            >
              <Icon icon={icon} fontSize={22} />
            </Box>
          </Box>

          <Box>
            {loading ? (
              <Skeleton width={140} height={36} />
            ) : (
              <Typography variant="h4" fontWeight={700} lineHeight={1.2}>
                {formattedValue}
              </Typography>
            )}
          </Box>

          {typeof trendPercent === 'number' && !loading && (
            <Typography variant="caption" sx={{ color: trendColor, fontWeight: 600 }}>
              {trendPercent > 0 ? '+' : ''}
              {new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(trendPercent)}%
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
