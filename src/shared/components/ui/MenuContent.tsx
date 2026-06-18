import type { ElementType } from 'react'
import * as React from 'react'

import { NavLink } from 'react-router'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Collapse from '@mui/material/Collapse'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

import { mainListItems, secondaryListItems, type SidebarItem } from '@/app/routes/navigation'

interface MenuContentProps {
  collapsed?: boolean
}

export default function MenuContent({ collapsed = false }: MenuContentProps) {
  const [openSubMenus, setOpenSubMenus] = React.useState<Record<string, boolean>>({})

  const handleSubMenuToggle = (path: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenSubMenus(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const renderItem = (item: SidebarItem, index: number) => {
    const itemKey = item.path ?? `${item.text}-${index}`
    const hasChildren = item.children && item.children.length > 0
    const isSubMenuOpen = !!openSubMenus[item.path!]

    return (
      <React.Fragment key={itemKey}>
        <Tooltip title={collapsed ? item.text : ''} placement="right">
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
  component={hasChildren ? 'div' : (NavLink as ElementType)}
  {...(!hasChildren
    ? {
        to: item.path,
        ...(item.end || item.path === '/' ? { end: true } : {})
      }
    : {})}
  onClick={hasChildren ? (e: React.MouseEvent) => handleSubMenuToggle(item.path!, e) : undefined}
              sx={{
                minHeight: 48,
                px: collapsed ? 1.5 : 2,
                mb: 0.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 3,
                color: 'text.secondary',

                '&.active': {
                  bgcolor: 'action.selected',
                  color: 'primary.main',

                  '& .MuiListItemIcon-root': {
                    color: 'primary.main'
                  }
                },

                '&:hover': {
                  bgcolor: 'action.hover'
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 40,
                  ml: collapsed ? 0 : 1, // Changed mr to ml for correct RTL icon-text spacing
                  justifyContent: 'center',
                  color: 'inherit'
                }}
              >
                {item.icon as React.ReactNode}
              </ListItemIcon>

              {!collapsed && <ListItemText primary={item.text} />}

              {!collapsed && hasChildren && (
                isSubMenuOpen ? <ExpandLess /> : <ExpandMore />
              )}
            </ListItemButton>
          </ListItem>
        </Tooltip>

        {hasChildren && !collapsed && (
          <Collapse in={isSubMenuOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 0, pr: 2 }}>
              {item.children!.map((child) => (
                <ListItem key={child.path} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    component={NavLink as ElementType}
                    to={child.path}
                    sx={{
                      minHeight: 40,
                      px: 2,
                      mb: 0.5,
                      borderRadius: 2,
                      color: 'text.secondary',
                      '&.active': {
                        bgcolor: 'action.selected',
                        color: 'primary.main',
                        '& .MuiListItemIcon-root': {
                          color: 'primary.main'
                        }
                      },
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        ml: 1, // Changed from mr to ml for correct RTL layout
                        justifyContent: 'center',
                        color: 'inherit'
                      }}
                    >
                      {child.icon as React.ReactNode}
                    </ListItemIcon>
                    <ListItemText primary={child.text} sx={{ '& .MuiTypography-root': { fontSize: '0.85rem' } }} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    )
  }

  return (
    <Stack sx={{ flexGrow: 1, p: 1, justifyContent: 'space-between' }}>
      <List dense>{mainListItems.map((item, index) => renderItem(item, index))}</List>

      <List dense>{secondaryListItems.map((item, index) => renderItem(item, index))}</List>
    </Stack>
  )
}