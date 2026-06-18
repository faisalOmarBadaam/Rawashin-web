import type { ReactNode } from 'react'
import { Outlet } from 'react-router'

import SettingsPage from '@/pages/SettingsPage'
import Login from '@/features/auth/pages/Login'
import StatisticsDashboard from '@/features/statistics/pages/StatisticsDashboard'

import SupportPage from '@/features/support/pages'
import SettlementsPage from '@/features/settlements/pages'
import SettlementDetailsPage from '@/features/settlements/pages/SettlementDetails'
import AuditLogPage from '@/pages/AuditLogPage'
import UserManagementPage from '@/pages/UserManagementPage'

import BeneficiaryPage from '@/features/client/pages/Beneficiary'
import BeneficiaryDetailsPage from '@/features/client/pages/Beneficiary/BeneficiaryDetails'
import BeneficiaryFormPage from '@/features/client/pages/Beneficiary/BeneficiaryForm'
import MerchantPage from '@/features/client/pages/merchant/pages'
import MerchantDetailsPage from '@/features/client/pages/merchant/pages/MerchantDetails'
import MerchantFormPage from '@/features/client/pages/merchant/pages/MerchantForm'
import CreateCashierPage from '@/features/client/pages/merchant/pages/CashierFormPage'
import PartnerFormPage from '@/features/client/pages/partner/pages/PartnerForm'
import PartnerPage from '@/features/client/pages/partner/pages'
import PartnerDetailsPage from '@/features/client/pages/partner/pages/PartnerDetails'

export type RouteAccess = 'public' | 'private'

export type AppRouteChild =
  | {
      index: true
      element: ReactNode
    }
  | {
      path: string
      element: ReactNode
      children?: AppRouteChild[]
    }

export type AppRoute = {
  path: string
  element: ReactNode
  access: RouteAccess
  children?: AppRouteChild[]
}



export const appRoutes: AppRoute[] = [
  {
    path: '/login',
    element: <Login />,
    access: 'public'
  },
  {
    path: '/',
    element: <StatisticsDashboard />,
    access: 'private'
  },
  {
    path: '/beneficiaries',
    element: <Outlet />,
    access: 'private',
    children: [
      {
        index: true,
        element: <BeneficiaryPage />
      },
      {
        path: 'new',
        element: <BeneficiaryFormPage />
      },
      {
        path: ':id',
        element: <BeneficiaryDetailsPage />
      },
      {
        path: ':id/edit',
        element: <BeneficiaryFormPage />
      }
    ]
  },
  {
    path: '/merchants',
    element: <Outlet />,
    access: 'private',
    children: [
      {
        index: true,
        element: <MerchantPage />
      },
      {
        path: 'new',
        element: <MerchantFormPage />
      },
      {
        path: ':id',
        element: <MerchantDetailsPage />,
      },
      {
        path: ':id/edit',
        element: <MerchantFormPage />
      },
      {
            path: ':id/cashiers/new',
            element: <CreateCashierPage />
      },
      {
            path: ':id/cashiers/:cashierId/edit',
            element: <CreateCashierPage />
      }

    ]
  },
  {
    path: '/partners',
    element: <Outlet />,
    access: 'private',
    children: [
      {
        index: true,
        element: <PartnerPage />
      },
      {
        path: 'new',
        element: <PartnerFormPage />
      },
      {
        path: ':id',
        element: <PartnerDetailsPage />
      },
      {
        path: ':id/edit',
        element: <PartnerFormPage />
      }
    ]
  },
  {
    path: '/settlements',
    element: <Outlet />,
    access: 'private',
    children: [
      {
        index: true,
        element: <SettlementsPage />
      },
      {
        path: ':id',
        element: <SettlementDetailsPage />
      }
    ]
  },
  {
    path: '/support',
    element: <SupportPage />,
    access: 'private'
  },
  {
    path: '/audit-logs',
    element: <AuditLogPage />,
    access: 'private'
  },
  {
    path: '/users',
    element: <UserManagementPage />,
    access: 'private'
  },
  {
    path: '/settings',
    element: <SettingsPage />,
    access: 'private'
  }
]