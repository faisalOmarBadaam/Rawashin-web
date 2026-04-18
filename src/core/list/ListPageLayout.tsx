'use client'

import type { ReactNode } from 'react'

import Stack from '@mui/material/Stack'

import type { EntityModule } from '@/core/entity/createEntityModule'

type Props = {
  module: EntityModule<Record<string, unknown>, unknown, unknown, unknown, unknown>
  toolbar?: ReactNode
  filters?: ReactNode
  children: ReactNode
}

export default function ListPageLayout({ module, toolbar, filters, children }: Props) {
  return (
    <Stack spacing={3} data-entity-module={module.name}>
      {toolbar}
      {filters}
      {children}
    </Stack>
  )
}
