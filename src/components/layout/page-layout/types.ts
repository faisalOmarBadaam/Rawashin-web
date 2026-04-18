import type { ReactNode } from 'react'

export type BreadcrumbItem = {
  label: string
  href?: string
}

export type TopbarAction = {
  id: string
  label: string
  icon: ReactNode
  onClick?: () => void
  disabled?: boolean
  /** Tooltip text */
  title?: string
  /** Variant for potential future styling (default, danger, primary) */
  variant?: 'default' | 'danger' | 'primary'
}

export type ResponsiveColumns = {
  sm?: number
  md?: number
  lg?: number
  xl?: number
}

export type PageLayoutProps = {
  /**
   * Breadcrumb items to display in the topbar.
   * If not provided, no breadcrumbs will be rendered.
   */
  breadcrumbs?: BreadcrumbItem[]

  /**
   * Action buttons to display in the topbar (right side).
   */
  actions?: TopbarAction[]

  /**
   * Number of grid columns for the content area.
   * Defaults to 1.
   */
  columns?: number

  /**
   * Responsive column configuration.
   * Overrides `columns` for specific breakpoints.
   * Example: { sm: 1, md: 2, lg: 3 }
   */
  responsiveColumns?: ResponsiveColumns

  /**
   * Gap between grid items.
   * Defaults to 4 (1rem).
   */
  gap?: number

  /**
   * Loading state for the entire page content.
   */
  loading?: boolean

  /**
   * Page content.
   */
  children: ReactNode
}
