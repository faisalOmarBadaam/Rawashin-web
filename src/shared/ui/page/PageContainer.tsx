'use client'

import type { ReactNode } from 'react'

import NextLink from 'next/link'

import { Box, Breadcrumbs, Divider, Grid, Link as MuiLink, Paper, Typography } from '@mui/material'

import AlertDialog from '@/components/dialogs/AlertDialog'
import { useEntityPage } from '@/core/hooks/useEntityPage'
import type { ResourceKey } from '@/core/rbac/policy'
import type { SmartActionKey, SmartActionPermissionMap } from '@/core/topbar/smart-topbar.types'
import SmartTopBarEngine from '@/core/ui/SmartTopBarEngine'
import type { ClientType } from '@/types/api/clients'

export type PageMode = 'add' | 'edit' | 'view'

type GridSize = number | 'auto' | 'grow' | false

export type BreadcrumbItem = {
  label: string
  href?: string
}

type GridColProps = {
  children: ReactNode
  xs?: GridSize
  sm?: GridSize
  md?: GridSize
  lg?: GridSize
  xl?: GridSize
}

type GridWrapProps = {
  children: ReactNode
  spacing?: number
  rowSpacing?: number
  columnSpacing?: number
}

type PageContainerProps = {
  title?: string
  mode?: PageMode
  breadcrumbs?: BreadcrumbItem[]
  loading?: boolean
  dirty?: boolean
  className?: string
  children: ReactNode
  headerRight?: ReactNode
  footer?: ReactNode
  roles?: string[]
  resource?: ResourceKey
  permissions?: SmartActionPermissionMap
  disabledActions?: Partial<Record<SmartActionKey, boolean>>
  status?: string
  clientType?: ClientType
  onAdd?: () => void
  onAttachments?: () => void
  onEdit?: () => void
  onSave?: () => void
  onDelete?: () => void
  onUndo?: () => void
  onCancel?: () => void
  onPrint?: () => void
  onExport?: () => void
  onReprint?: () => void
  onApprove?: () => void
  onReject?: () => void
  onPost?: () => void
  onCharge?: () => void
  onAssign?: () => void
  onCommission?: () => void
  onPassRest?: () => void
  onChargeCharger?: () => void
  onDeposit?: () => void
  onDebt?: () => void
  onRoles?: () => void
  xs?: GridSize
  sm?: GridSize
  md?: GridSize
  lg?: GridSize
  xl?: GridSize
}

const PageContainerGrid = ({ children, spacing = 3, rowSpacing, columnSpacing }: GridWrapProps) => (
  <Grid container spacing={spacing} rowSpacing={rowSpacing} columnSpacing={columnSpacing}>
    {children}
  </Grid>
)

const toGridSize = (xs: GridSize, sm?: GridSize, md?: GridSize, lg?: GridSize, xl?: GridSize) => ({
  xs,
  ...(sm !== undefined ? { sm } : {}),
  ...(md !== undefined ? { md } : {}),
  ...(lg !== undefined ? { lg } : {}),
  ...(xl !== undefined ? { xl } : {}),
})

const PageContainerCol = ({ children, xs = 12, sm, md, lg, xl }: GridColProps) => (
  <Grid size={toGridSize(xs, sm, md, lg, xl)}>{children}</Grid>
)

function PageContainerComponent({
  title,
  mode = 'view',
  breadcrumbs = [],
  loading = false,
  dirty,
  className,
  children,
  headerRight,
  footer,
  roles,
  resource,
  permissions,
  disabledActions,
  status,
  clientType,
  onAdd,
  onAttachments,
  onEdit,
  onSave,
  onDelete,
  onUndo,
  onCancel,
  onPrint,
  onExport,
  onReprint,
  onApprove,
  onReject,
  onPost,
  onCharge,
  onAssign,
  onCommission,
  onPassRest,
  onChargeCharger,
  onDeposit,
  onDebt,
  onRoles,
  xs,
  sm,
  md,
  lg,
  xl,
}: PageContainerProps) {
  const safeBreadcrumbs = Array.isArray(breadcrumbs) ? breadcrumbs : []
  const { confirmDialogConfig, requestDelete, requestUndo, requestCancel, closeConfirm, confirm } =
    useEntityPage({
      mode,
      dirty,
      loading,
      onDelete,
      onUndo,
      onCancel,
    })

  const content = (
    <Box
      className={className}
      sx={{
        width: '100%',
        maxWidth: {
          xs: '100%',
          md: '64rem',
          lg: '80rem',
          xl: '96rem',
        },
        mx: 'auto',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {safeBreadcrumbs.length > 0 && (
        <Breadcrumbs aria-label="breadcrumb" separator="›" sx={{ mb: 2 }}>
          {safeBreadcrumbs.map((item, index) =>
            item.href ? (
              <MuiLink
                key={`${item.label}-${index}`}
                component={NextLink}
                href={item.href}
                underline="hover"
                color="text.secondary"
                fontSize={14}
              >
                {item.label}
              </MuiLink>
            ) : (
              <Typography key={`${item.label}-${index}`} fontSize={14} fontWeight={600}>
                {item.label}
              </Typography>
            ),
          )}
        </Breadcrumbs>
      )}

      <Paper
        elevation={0}
        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}
      >
        <Box
          sx={{
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            bgcolor: 'grey.50',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography variant="h6" fontWeight={700} noWrap>
                {title}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {headerRight}
            <SmartTopBarEngine
              config={{
                mode,
                roles,
                resource,
                permissionsMap: permissions,
                disabledActions,
                dirty,
                loading,
                status,
                clientType,
                actions: {
                  add: onAdd,
                  attachments: onAttachments,
                  edit: onEdit,
                  save: onSave,
                  delete: onDelete ? requestDelete : undefined,
                  undo: onUndo ? requestUndo : undefined,
                  cancel: onCancel ? requestCancel : undefined,
                  print: onPrint,
                  export: onExport,
                  reprint: onReprint,
                  approve: onApprove,
                  reject: onReject,
                  post: onPost,
                  charge: onCharge,
                  assign: onAssign,
                  commission: onCommission,
                  passRest: onPassRest,
                  chargeCharger: onChargeCharger,
                  deposit: onDeposit,
                  debt: onDebt,
                  roles: onRoles,
                },
              }}
            />
          </Box>
        </Box>

        <Divider />

        <Box sx={{ p: { xs: 2, md: 4 } }}>{children}</Box>

        {footer && (
          <>
            <Divider />
            <Box sx={{ p: { xs: 2, md: 3 } }}>{footer}</Box>
          </>
        )}

        {confirmDialogConfig && (
          <AlertDialog
            open
            title={confirmDialogConfig.title}
            description={confirmDialogConfig.description}
            confirmText={confirmDialogConfig.confirmText}
            cancelText="إلغاء"
            loading={loading}
            onClose={closeConfirm}
            onConfirm={confirm}
          />
        )}
      </Paper>
    </Box>
  )

  const hasGridItemProps =
    xs !== undefined || sm !== undefined || md !== undefined || lg !== undefined || xl !== undefined

  if (!hasGridItemProps) return content

  return <Grid size={toGridSize(xs ?? 12, sm, md, lg, xl)}>{content}</Grid>
}

type CompoundPageContainer = typeof PageContainerComponent & {
  Grid: typeof PageContainerGrid
  Col: typeof PageContainerCol
}

const PageContainer = PageContainerComponent as CompoundPageContainer

PageContainer.Grid = PageContainerGrid
PageContainer.Col = PageContainerCol

export default PageContainer
