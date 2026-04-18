'use client'

import type { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

type Props = {
  title?: ReactNode
  actions?: ReactNode
}

export default function ListToolbar({ title, actions }: Props) {
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
      <Box>{title}</Box>
      <Stack direction="row" spacing={1}>
        {actions}
      </Stack>
    </Box>
  )
}
