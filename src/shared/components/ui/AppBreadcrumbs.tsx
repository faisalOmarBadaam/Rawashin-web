import Breadcrumbs from '@mui/material/Breadcrumbs'
import MuiLink from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'

import { appRoutes } from '@/app/routes/routes.config'
import { Link as RouterLink, useLocation } from 'react-router'
import type { AppRouteChild } from '@/app/routes/routes.config'

type BreadcrumbItem = {
  text: string
  path: string
  clickable: boolean
}

function normalizePath(path: string) {
  if (path === '/') return '/'

  return '/' + path.split('/').filter(Boolean).join('/')
}

const routeLabels = new Map<string, string>([
  ['/', 'لوحة التحكم'],
  ['/login', 'تسجيل الدخول'],
  ['/beneficiaries', 'المستفيدون'],
  ['/beneficiaries/new', 'إضافة مستفيد'],
  ['/merchants', 'التجار'],
  ['/merchants/new', 'إضافة تاجر'],
  ['/partners', 'الشركاء'],
  ['/partners/new', 'إضافة شريك'],
  ['/requests', 'الطلبات'],
  ['/settlements', 'التسويات المالية'],
  ['/support', 'الدعم الفني'],
  ['/audit-logs', 'سجل المراجعة'],
  ['/users', 'إدارة المستخدمين'],
  ['/settings', 'الإعدادات'],

])

function joinRoutePath(parentPath: string, childPath: string) {
  if (childPath.startsWith('/')) return normalizePath(childPath)

  return normalizePath(`${parentPath}/${childPath}`)
}

function getChildLabel(path: string) {
  if (path.endsWith('/new')) {
    if (path.startsWith('/beneficiaries')) return 'إضافة مستفيد'
    if (path.startsWith('/merchants')) return 'إضافة تاجر'
    if (path.startsWith('/partners')) return 'إضافة شريك'
  }

  if (path.startsWith('/beneficiaries/')) return 'تفاصيل المستفيد'
  if (path.startsWith('/merchants/')) return 'تفاصيل التاجر'
  if (path.startsWith('/partners/')) return 'تفاصيل الشريك'
  if (path.startsWith('/settlements/')) return 'تفاصيل التسوية'

  return undefined
}

function collectChildRoutes(
  parentPath: string,
  children: AppRouteChild[] | undefined,
  map: Map<string, BreadcrumbItem>,
) {
  if (!children?.length) return

  children.forEach(child => {
    if (!('path' in child)) return

    const childPath = joinRoutePath(parentPath, child.path)
    const childLabel = routeLabels.get(childPath) ?? getChildLabel(childPath)

    if (childLabel) {
      map.set(childPath, {
        text: childLabel,
        path: childPath,
        clickable: true,
      })
    }

    collectChildRoutes(childPath, child.children, map)
  })
}

function buildBreadcrumbMap() {
  const map = new Map<string, BreadcrumbItem>()

  appRoutes.forEach(route => {
    const routePath = normalizePath(route.path)
    const label = routeLabels.get(routePath)

    if (label) {
      map.set(routePath, {
        text: label,
        path: routePath,
        clickable: routePath !== '/',
      })
    }

    collectChildRoutes(routePath, route.children, map)
  })

  return map
}

const breadcrumbMap = buildBreadcrumbMap()

function getFallbackText(path: string) {
  const lastSegment = path.split('/').filter(Boolean).at(-1)

  if (!lastSegment) return '—'
  if (/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(lastSegment)) return 'تفاصيل'
  if (/^\d+$/.test(lastSegment)) return 'تفاصيل'

  return decodeURIComponent(lastSegment ?? '').replace(/-/g, ' ')
}

export default function AppBreadcrumbs() {
  const location = useLocation()

  const currentPath = normalizePath(location.pathname)

  if (
    currentPath === '/' ||
    currentPath === '/login' ||
    currentPath === '/register'
  ) {
    return null
  }

  const segments = currentPath.split('/').filter(Boolean)

  const paths = segments.map((_, index) => {
    return '/' + segments.slice(0, index + 1).join('/')
  })

  const homeRoute = breadcrumbMap.get('/')

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{ mb: 2 }}
    >
      <MuiLink
        component={RouterLink}
        to="/"
        underline="hover"
        color="inherit"
      >
        {homeRoute?.text ?? 'لوحة التحكم'}
      </MuiLink>

      {paths.map((path) => {
        const item = breadcrumbMap.get(path)
        const isLast = path === currentPath

        const text = item?.text ?? getFallbackText(path)

        const canClick = Boolean(item?.clickable) && !isLast

        if (!canClick) {
          return (
            <Typography
              key={path}
              color={isLast ? 'text.primary' : 'text.secondary'}
            >
              {text}
            </Typography>
          )
        }

        return (
          <MuiLink
            key={path}
            component={RouterLink}
            to={path}
            underline="hover"
            color="inherit"
          >
            {text}
          </MuiLink>
        )
      })}
    </Breadcrumbs>
  )
}