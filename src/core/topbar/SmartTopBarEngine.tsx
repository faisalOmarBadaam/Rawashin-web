'use client'

import { useMemo } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material'
import { Icon } from '@iconify/react'

import { resolveTopbarActions } from './smart-topbar.resolver'
import type { SmartTopBarConfig } from './smart-topbar.types'
import { deriveModuleFromPath, trackTopbarAction } from '@/core/analytics/events'

type Props = {
  config: SmartTopBarConfig
}

const ROUTE_ROOTS = new Set(['clients', 'employees', 'users', 'transactions', 'settlements', 'support-ticket'])

const buildAddPath = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return '/add'

  if (segments[segments.length - 1] === 'add' || segments[segments.length - 1] === 'edit' || segments[segments.length - 1] === 'view') {
    segments.pop()
  }

  if (segments.length >= 2 && ROUTE_ROOTS.has(segments[segments.length - 2])) {
    segments.pop()
  }

  return `/${segments.join('/')}/add`.replace(/\/+/g, '/')
}

export default function SmartTopBarEngine({ config }: Props) {
  const router = useRouter()
  const pathnameFromHook = usePathname()
  const searchParams = useSearchParams()
  const pathname = config.pathname ?? pathnameFromHook ?? '/'
  const typeParam = searchParams?.get('type')

  const actions = useMemo(
    () =>
      resolveTopbarActions(config, {
        defaultAddHandler: () => {
          const addPath = buildAddPath(pathname)

          if (typeParam) {
            router.push(`${addPath}?type=${encodeURIComponent(typeParam)}`)

            return
          }

          router.push(addPath)
        }
      }),
    [config, pathname, router, typeParam]
  )

  const moduleName = useMemo(() => deriveModuleFromPath(pathname), [pathname])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {actions.map(action => (
        <Tooltip key={action.key} title={action.label}>
          <span>
            <IconButton
              color={action.tone === 'danger' ? 'error' : action.tone === 'primary' ? 'primary' : 'inherit'}
              onClick={() => {
                trackTopbarAction({
                  actionKey: action.key,
                  mode: config.mode,
                  module: moduleName,
                  resource: config.resource,
                  clientType: config.clientType
                })

                action.onClick()
              }}
              disabled={action.disabled || action.loading}
            >
              {action.loading ? <CircularProgress size={18} /> : <Icon icon={action.icon} width={20} />}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Box>
  )
}
