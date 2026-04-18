// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

/**
 * Menu is role-aware.
 * If `acl` is omitted -> public inside protected area (still requires auth).
 */
export type AclMenuItem = VerticalMenuDataType & { acl?: string[] }

const verticalMenuData = (): AclMenuItem[] => [
  {
    label: 'الرئيسية',
    href: '/home',
    icon: 'ri-home-smile-line',
    acl: ['Admin', 'Charger', 'Employee', 'Merchant'],
  },

  {
    label: 'العملاء',
    href: '/employees',
    icon: 'ri-user-3-line',
    acl: ['Employee'],
  },
  {
    label: 'العملاء',
    href: '/clients',
    icon: 'ri-user-3-line',
    acl: ['Admin'],
  },
  {
    label: 'الحسابات الفرعية',
    href: '/merchants',
    icon: 'ri-store-2-line',
    acl: ['Merchant'],
  },

  {
    label: 'تسويات الحساب',
    href: '/merchant-settlements',
    icon: 'ri-hand-coin-line',
    acl: ['Merchant'],
  },
  // {
  //   label: 'العمليات',
  //   href: '/transactions',
  //   icon: 'ri-exchange-dollar-line',
  //   acl: ['Admin', 'Merchant']
  // },
  // {
  //   label: 'الإحصائيات',
  //   href: '/statistics',
  //   icon: 'ri-bar-chart-2-line',
  //   acl: ['Admin']
  // }

  {
    label: 'التسويات',
    href: '/settlements',
    icon: 'ri-hand-coin-line',
    acl: ['Admin'],
  },

  {
    label: 'إدارة المستخدمين',
    href: '/users',
    icon: 'ri-user-settings-line',
    acl: ['Admin'],
  },

  {
    label: 'الدعم الفني',
    href: '/support-ticket',
    icon: 'ri-customer-service-2-line',
    acl: ['Admin'],
  },
  {
    label: 'سجل التدقيق',
    href: '/audit-logs',
    icon: 'ri-file-list-3-line',
    acl: ['Admin'],
  },
]

export default verticalMenuData
