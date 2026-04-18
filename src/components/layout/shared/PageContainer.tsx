'use client'

import type { ReactNode } from 'react'

import NextLink from 'next/link'

import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Typography
} from '@mui/material'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  title?: string
  breadcrumbs?: BreadcrumbItem[]
  children: ReactNode
  className?: string
}

export default function PageContainer({
  title,
  breadcrumbs = [],
  children,
  className
}: Props) {
  return (
    <Box
      className={className}
      sx={{
        width: '100%',

        /* ✅ Proper responsive widths */
        maxWidth: {
          xs: '100%',      // mobile
          md: '64rem',     // ~1024px
          lg: '80rem',     // ~1280px
          xl: '96rem'      // ~1536px
        },

        mx: 'auto',

        /* spacing scales correctly */
        px: { xs: 2, sm: 3, md: 4, lg: 4 },
        py: { xs: 2, sm: 3, md: 4 },

        bgcolor: 'background.paper',
        borderRadius: { xs: 0, sm: 2 }
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          aria-label="breadcrumb"
          separator="›"
          sx={{
            mb: 3,
            px: 2,
            py: 1,
            bgcolor: 'background.paper',
            borderRadius: 2,
            display: 'inline-flex',
            alignItems: 'center',
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center',
              flexWrap: 'wrap'
            }
          }}
        >
          {breadcrumbs.map((item, index) =>
            item.href ? (
              <MuiLink
                key={`${item.label}-${index}`}
                component={NextLink}
                href={item.href}
                underline="hover"
                sx={{ fontWeight: 600 }}
              >
                {item.label}
              </MuiLink>
            ) : (
              <Typography
                key={`${item.label}-${index}`}
                fontWeight={600}
                color="text.primary"
              >
                {item.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}

      {/* Page Title */}
      {title && (
        <Typography
          variant="h5"
          fontWeight={700}
          color="text.primary"
          sx={{ mb: 3 }}
        >
          {title}
        </Typography>
      )}

      {/* Page Content */}
      <Box sx={{ width: '100%', overflowX: 'auto' }}>
        {children}
      </Box>
    </Box>
  )
}
