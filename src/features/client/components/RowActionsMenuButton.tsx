import { useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import MoreVertIcon from '@mui/icons-material/MoreVert'

export type RowAction<TRow> = {
  label: string
  onClick: (row: TRow) => void | Promise<void>
  icon?: ReactNode
  disabled?: boolean | ((row: TRow) => boolean)
  hidden?: boolean | ((row: TRow) => boolean)
  dividerBefore?: boolean
  color?: 'default' | 'error'
}

type RowActionsMenuButtonProps<TRow> = {
  row: TRow
  actions: RowAction<TRow>[]
}

export default function RowActionsMenuButton<TRow>({
  row,
  actions,
}: RowActionsMenuButtonProps<TRow>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const open = Boolean(anchorEl)

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const visibleActions = actions.filter((action) => {
    if (typeof action.hidden === 'function') {
      return !action.hidden(row)
    }

    return !action.hidden
  })

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        disableScrollLock
        onClose={handleClose}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {visibleActions.map((action) => {
          const isDisabled =
            typeof action.disabled === 'function'
              ? action.disabled(row)
              : action.disabled

          const handleClick = async () => {
            await action.onClick(row)
            handleClose()
          }

          return (
            <div key={action.label}>
              {action.dividerBefore && <Divider />}

              <MenuItem onClick={handleClick} disabled={isDisabled} sx={{ color: action.color === 'error' ? 'error.main' : 'inherit' }}>
                {action.icon && (
                  <ListItemIcon>
                    {action.icon}
                  </ListItemIcon>
                )}

                <ListItemText>
                  {action.label}
                </ListItemText>
              </MenuItem>
            </div>
          )
        })}
      </Menu>
    </>
  )
}