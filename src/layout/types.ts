import type { ReactNode } from 'react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export type LayoutActionVariant = 'default' | 'primary' | 'danger'

export interface LayoutAction {
  id: string
  label: string
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  permission?: string
  title?: string
  variant?: LayoutActionVariant
}

export interface LayoutState {
  actions: LayoutAction[]
  breadcrumbs: BreadcrumbItem[]
  editMode: boolean
  dirty: boolean
  permissions: string[]
}

export interface LayoutContextType extends LayoutState {
  setActions: (actions: LayoutAction[]) => void
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  toggleEditMode: () => void
  setEditMode: (value: boolean) => void
  setDirty: (dirty: boolean) => void
  hasPermission: (permission: string) => boolean
}
