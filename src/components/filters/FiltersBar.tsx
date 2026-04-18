'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

export type FiltersBarProps = {
  children: ReactNode
  actions?: ReactNode
}

export default function FiltersBar({ children, actions }: FiltersBarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 3
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        flexWrap="wrap"
        useFlexGap
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        {children}
      </Stack>

      {actions && <Box>{actions}</Box>}
    </Box>
  )
}
