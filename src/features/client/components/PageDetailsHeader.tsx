import type { ReactNode } from 'react'

import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'

type PageHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  avatar?: ReactNode
  actions?: ReactNode
  status?: ReactNode
  extraContent?: ReactNode
  avatarSize?: number
}

export default function PageHeader({
  title,
  subtitle,
  avatar,
  actions,
  status,
  extraContent,
  avatarSize = 64,
}: PageHeaderProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
          gap: 2,
          alignItems: {
            xs: 'stretch',
            md: 'center',
          },
          justifyContent: 'space-between',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          {avatar && (
            <Avatar
              sx={{
                width: avatarSize,
                height: avatarSize,
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            >
              {avatar}
            </Avatar>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Typography
                variant="h5"
                component="h1"
                sx={{
                  fontWeight: 800,
                  overflowWrap: 'anywhere',
                }}
              >
                {title}
              </Typography>

              {status}
            </Box>

            {subtitle && (
              <>
                {typeof subtitle === 'string' ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    {subtitle}
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      mt: 0.75,
                      color: 'text.secondary',
                    }}
                  >
                    {subtitle}
                  </Box>
                )}
              </>
            )}

            {extraContent && (
              <Box sx={{ mt: 1 }}>
                {extraContent}
              </Box>
            )}
          </Box>
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              gap: 1,
              justifyContent: 'flex-end',
              flexWrap: 'wrap',

              '& > *': {
                width: {
                  xs: '100%',
                  sm: 'auto',
                },
              },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Paper>
  )
}