'use client'

import { useState } from 'react'

import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import { trackRowAction } from '@/core/analytics/events'

export type RowActionItem = {
  label: string
  actionKey?: string
  icon?: React.ReactNode
  onClick: () => void
  color?: 'error'
  dividerBefore?: boolean
  disabled?: boolean
}

export type RowActionsMenuProps = {
  items?: RowActionItem[]
  module?: string
  entityId?: string

  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDeleteDisabled?: boolean
  onPrint?: () => void
  onCharge?: () => void
  onAssign?: () => void
  onCommission?: () => void
  onPassRest?: () => void
  onChargeCharger?: () => void
  onDeposit?: () => void
  onRefund?: () => void
  onRoles?: () => void
}

export default function RowActionsMenu({
  items,
  module,
  entityId,
  onView,
  onEdit,
  onDelete,
  onDeleteDisabled,
  onPrint,
  onCharge,
  onAssign,
  onCommission,
  onPassRest,
  onChargeCharger,
  onDeposit,
  onRefund,
  onRoles,
}: RowActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const close = () => setAnchorEl(null)
  const trackAction = (actionKey: string) => {
    trackRowAction({ actionKey, module, entityId })
  }

  const hasAccountActions = Boolean(onAssign || onCharge)

  return (
    <>
      <IconButton size="small" onClick={e => setAnchorEl(e.currentTarget)}>
        <i className="ri-more-2-fill" />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        {onView && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('view')
              onView()
            }}
          >
            <ListItemIcon>
              <i className="ri-eye-line" />
            </ListItemIcon>
            <ListItemText>عرض</ListItemText>
          </MenuItem>
        )}

        {onEdit && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('edit')
              onEdit()
            }}
          >
            <ListItemIcon>
              <i className="ri-edit-line" />
            </ListItemIcon>
            <ListItemText>تعديل</ListItemText>
          </MenuItem>
        )}

        {onPrint && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('print')
              onPrint()
            }}
          >
            <ListItemIcon>
              <i className="ri-printer-line" />
            </ListItemIcon>
            <ListItemText>طباعة البطاقة</ListItemText>
          </MenuItem>
        )}

        {items?.flatMap((item, index) => [
          ...(item.dividerBefore ? [<Divider key={`div-${index}`} />] : []),
          <MenuItem
            key={`item-${index}`}
            disabled={item.disabled}
            onClick={() => {
              close()
              trackAction(item.actionKey ?? 'custom_action')
              item.onClick()
            }}
            sx={item.color === 'error' ? { color: 'error.main' } : undefined}
          >
            {item.icon && (
              <ListItemIcon sx={item.color === 'error' ? { color: 'error.main' } : undefined}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText>{item.label}</ListItemText>
          </MenuItem>,
        ])}

        {hasAccountActions && <Divider />}

        {onAssign && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('assign')
              onAssign()
            }}
          >
            <ListItemIcon>
              <i className="ri-id-card-line" />
            </ListItemIcon>
            <ListItemText>إسناد بطاقة</ListItemText>
          </MenuItem>
        )}

        {onCharge && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('charge')
              onCharge()
            }}
          >
            <ListItemIcon>
              <i className="ri-wallet-3-line" />
            </ListItemIcon>
            <ListItemText>تعبئة حساب</ListItemText>
          </MenuItem>
        )}

        {onCommission && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('commission')
              onCommission()
            }}
          >
            <ListItemIcon>
              <i className="ri-wallet-3-line" />
            </ListItemIcon>
            <ListItemText>إضافة العمولة</ListItemText>
          </MenuItem>
        )}
        {onChargeCharger && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('chargeCharger')
              onChargeCharger()
            }}
          >
            <ListItemIcon>
              <i className="ri-flashlight-line" />
            </ListItemIcon>
            <ListItemText>إضافة رصيد</ListItemText>
          </MenuItem>
        )}

        {onDeposit && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('deposit')
              onDeposit()
            }}
          >
            <ListItemIcon>
              <i className="ri-bank-line" />
            </ListItemIcon>
            <ListItemText>تغذية الحساب</ListItemText>
          </MenuItem>
        )}

        {onRefund && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('refund')
              onRefund()
            }}
          >
            <ListItemIcon>
              <i className="ri-arrow-go-back-line" />
            </ListItemIcon>
            <ListItemText>استرجاع عملية</ListItemText>
          </MenuItem>
        )}

        {onRoles && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('roles')
              onRoles()
            }}
          >
            <ListItemIcon>
              <i className="ri-shield-keyhole-line" />
            </ListItemIcon>
            <ListItemText>إدارة الصلاحيات</ListItemText>
          </MenuItem>
        )}
        {onPassRest && (
          <MenuItem
            onClick={() => {
              close()
              trackAction('passRest')
              onPassRest()
            }}
          >
            <ListItemIcon>
              <i className="ri-lock-password-line" />
            </ListItemIcon>
            <ListItemText>تغيير كلمة المرور</ListItemText>
          </MenuItem>
        )}

        {onDelete && <Divider />}
        {onDelete && (
          <MenuItem
            disabled={onDeleteDisabled}
            onClick={() => {
              close()
              trackAction('delete')
              onDelete()
            }}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <i className="ri-delete-bin-line" />
            </ListItemIcon>
            <ListItemText>حذف</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  )
}
