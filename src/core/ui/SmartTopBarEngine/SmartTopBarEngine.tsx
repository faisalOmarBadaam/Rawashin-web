'use client'

import { useMemo } from 'react'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { Icon } from '@iconify/react'
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material'

import { deriveModuleFromPath, trackTopbarAction } from '@/core/analytics/events'
import { resolveEntityActions } from '@/core/engine/action.engine'
import { resolveAddPath } from '@/core/engine/route.engine'
import type { SmartTopBarConfig } from '@/core/topbar/smart-topbar.types'

type Props = {
  config: SmartTopBarConfig
}

export default function SmartTopBarEngine({ config }: Props) {
  const router = useRouter()
  const pathnameFromHook = usePathname()
  const searchParams = useSearchParams()

  const pathname = config.pathname ?? pathnameFromHook ?? '/'
  const typeParam = searchParams?.get('type')

  const actions = useMemo(
    () =>
      resolveEntityActions(
        {
          mode: config.mode,
          roles: config.roles,
          resource: config.resource,
          permissionsMap: config.permissionsMap,
          disabledActions: config.disabledActions,
          dirty: config.dirty,
          loading: config.loading,
          status: config.status,
          clientType: config.clientType,
          handlers: config.actions,
        },
        {
          defaultAddHandler: () => {
            const addPath = resolveAddPath(pathname)

            if (typeParam) {
              router.push(`${addPath}?type=${encodeURIComponent(typeParam)}`)

              return
            }

            router.push(addPath)
          },
        },
      ),
    [config, pathname, router, typeParam],
  )

  const moduleName = useMemo(() => deriveModuleFromPath(pathname), [pathname])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {actions.map(action => (
        <Tooltip key={action.key} title={action.label}>
          <span>
            <IconButton
              color={
                action.tone === 'danger'
                  ? 'error'
                  : action.tone === 'primary'
                    ? 'primary'
                    : 'inherit'
              }
              onClick={() => {
                trackTopbarAction({
                  actionKey: action.key,
                  mode: config.mode,
                  module: moduleName,
                  resource: config.resource,
                  clientType: config.clientType,
                })

                action.onClick()
              }}
              disabled={action.disabled || action.loading}
            >
              {action.loading ? (
                <CircularProgress size={18} />
              ) : (
                <Icon icon={action.icon} width={20} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Box>
  )
}
