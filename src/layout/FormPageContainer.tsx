'use client'

import type { ReactNode } from 'react'

import NextLink from 'next/link'

import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Typography,
  Paper
} from '@mui/material'

import FormTopbar from './FormTopbar'

export type BreadcrumbItem = {
  label: string
  href?: string
}

type Mode = 'view' | 'edit' | 'add'

type Props = {
  title?: string
  mode?: Mode
  breadcrumbs?: BreadcrumbItem[]

  isDirty?: boolean
  loading?: boolean

  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  onDelete?: () => void

  children: ReactNode
}

export default function FormPageContainer({
  title,
  mode = 'view',
  breadcrumbs = [],
  isDirty = false,
  loading = false,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  children
}: Props) {
  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { md: '64rem', lg: '80rem' },
        mx: 'auto',
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 4 }
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs separator="›" sx={{ mb: 2 }}>
          {breadcrumbs.map((item, index) =>
            item.href ? (
              <MuiLink
                key={index}
                component={NextLink}
                href={item.href}
                underline="hover"
                color="text.secondary"
                fontSize={14}
              >
                {item.label}
              </MuiLink>
            ) : (
              <Typography
                key={index}
                fontSize={14}
                fontWeight={600}
              >
                {item.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}

      {/* Title */}
      {title && (
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ mb: 3 }}
        >
          {title}
          {isDirty && (
            <Box
              component="span"
              sx={{
                ml: 1,
                color: 'warning.main',
                fontSize: 14
              }}
            >
              •
            </Box>
          )}
        </Typography>
      )}

      {/* Card */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <FormTopbar
          mode={mode}
          isDirty={isDirty}
          loading={loading}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
        />

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Paper>
    </Box>
  )
}
