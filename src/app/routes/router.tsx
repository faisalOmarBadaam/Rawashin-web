import { createBrowserRouter } from 'react-router'
import type { RouteObject } from 'react-router'

import NotFoundPage from '@/pages/NotFoundPage'

import { appRoutes } from './routes.config'
import type { AppRoute, AppRouteChild } from './routes.config'

import PublicLayout from '@/app/guards/PublicRoute'
import ProtectedDashboardLayout from '@/app/guards/ProtectedRoute'

const mapChildrenToRouteObjects = (
  children?: AppRouteChild[]
): RouteObject[] | undefined => {
  if (!children?.length) return undefined

  return children.map((child): RouteObject => {
    if ('path' in child) {
      return {
        path: child.path,
        element: child.element,
        children: mapChildrenToRouteObjects(child.children)
      }
    }

    return {
      index: true,
      element: child.element
    }
  })
}

const mapAppRouteToRouteObject = (route: AppRoute): RouteObject => ({
  path: route.path,
  element: route.element,
  children: mapChildrenToRouteObjects(route.children)
})

const publicRoutes: RouteObject[] = appRoutes
  .filter(route => route.access === 'public')
  .map(mapAppRouteToRouteObject)

const privateRoutes: RouteObject[] = appRoutes
  .filter(route => route.access === 'private')
  .map(mapAppRouteToRouteObject)

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: publicRoutes
  },
  {
    element: <ProtectedDashboardLayout />,
    children: privateRoutes
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
])