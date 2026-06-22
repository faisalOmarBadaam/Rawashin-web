import type { ReactNode } from 'react'
import DashboardIcon from '@mui/icons-material/Dashboard'
import GroupIcon from '@mui/icons-material/Group'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import PointOfSaleIcon from '@mui/icons-material/PointOfSale'
import HandshakeIcon from '@mui/icons-material/Handshake'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import SupportAgentIcon from '@mui/icons-material/SupportAgent'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'

export interface SidebarItem {
  text: string
  path?: string
  icon?: ReactNode
  end?: boolean
  children?: SidebarItem[]
}

export const mainListItems: SidebarItem[] = [
  {
    text: 'لوحة التحكم',
    path: '/',
    icon: <DashboardIcon />,
    end: true,
  },
  {
    text: 'العملاء',
    icon: <GroupIcon />,
    children: [
      {
        text: 'المستفيدون',
        path: '/beneficiaries',
        icon: <PeopleAltIcon />,
        end: true
      },
      {
        text: 'نقاط البيع',
        path: '/merchants',
        icon: <PointOfSaleIcon />,
        end: true
      },
      {
        text: 'الشركاء',
        path: '/partners',
        icon: <HandshakeIcon />,
        end: true
      },
      {
        text: 'الطلبات',
        path: '/requests',
        icon: <ReceiptLongIcon />,
        end: true
      }
    ]
  },
  {
    text: 'التسويات',
    path: '/settlements',
    icon: <AccountBalanceWalletIcon />
  },
  {
    text: 'الدعم الفني',
    path: '/support',
    icon: <SupportAgentIcon />
  },
]

export const secondaryListItems: SidebarItem[] = [
  {
    text: 'إدارة المستخدمين',
    path: '/users',
    icon: <PeopleIcon />
  },
  {
    text: 'الإعدادات',
    path: '/settings',
    icon: <SettingsIcon />
  }
]