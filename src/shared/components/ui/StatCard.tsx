import { useTheme, alpha } from "@mui/material/styles"
import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material"
import { useMemo } from "react"
import { Icon as IconifyIcon } from '@iconify/react';
import { useAnimatedNumber } from "../../hooks";

type StatCardProps = {
  title: string
  value?: number
  icon: string
  iconLabel?: string
  trendPercent?: number
  precision?: number
  durationMs?: number
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  subtitle?: string
  loading?: boolean
}

export function StatCard({
  title,
  value = 0,
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
  const animatedValue = useAnimatedNumber(value, {
    durationMs,
    precision,
  })

  const formattedValue = useMemo(
    () => new Intl.NumberFormat('en-US', { maximumFractionDigits: precision }).format(animatedValue),
    [animatedValue, precision],
  )

  // Use the corresponding theme palette color
  const statusColor = theme.palette[color]?.main || theme.palette.primary.main

  return (
    <Card
      sx={{
        height: '100%',
        backgroundColor: alpha(statusColor, 0.05), // Soft background tint based on color
        borderRadius: '16px', // Rounded corners like the screenshot
        border: `1px solid ${alpha(statusColor, 0.12)}`, // Extremely soft color matching border
        boxShadow: 'none',
        transition: theme.transitions.create(['transform', 'box-shadow'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 24px ${alpha(statusColor, 0.08)}`,
        },
      }}
    >
      <CardContent
        sx={{
          p: '20px !important', // Spacious padding but clean
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center', // Align vertically center like the screenshot
            gap: 2,
          }}
        >
          <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontWeight: 700, 
                fontSize: '0.875rem',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {title}
            </Typography>
            
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}

            {loading ? (
              <Skeleton width={100} height={32} />
            ) : (
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  lineHeight: 1.1,
                  fontSize: '1.75rem',
                  color: theme.palette.text.primary
                }} 
              >
                {formattedValue}
              </Typography>
            )}

            {typeof trendPercent === 'number' && !loading && (
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: trendPercent > 0 ? 'success.main' : trendPercent < 0 ? 'error.main' : 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <IconifyIcon
                  icon={trendPercent > 0 ? "mdi:trending-up" : trendPercent < 0 ? "mdi:trending-down" : "mdi:trending-neutral"}
                  fontSize={14}
                />
                {trendPercent > 0 ? '+' : ''}
                {new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(trendPercent)}%
              </Typography>
            )}
          </Stack>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: alpha(statusColor, 0.15), // Semi-transparent matching color
              color: statusColor, // Fully opaque matching color
              flexShrink: 0,
            }}
            aria-label={iconLabel ?? title}
          >
            <IconifyIcon icon={icon} fontSize={24} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}