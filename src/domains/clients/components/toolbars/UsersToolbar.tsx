'use client'

import NextLink from 'next/link'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import { ClientType, type ClientDto } from '@/types/api/clients'

const CLIENT_TYPE_CONFIG = [
  {
    value: ClientType.Admin,
    label: 'ادارة النظام',
    addLabel: 'إضافة حساب الإدارة',
    typeKey: 'admin',
  },
  {
    value: ClientType.ProfitAccount,
    label: 'حساب الإرباح',
    addLabel: 'اضافة حساب  الإرباح',
    typeKey: 'profit',
  },
  {
    value: ClientType.Charger,
    label: 'ادارة الشحن',
    addLabel: 'اضافة حساب  الشحن',
    typeKey: 'charger',
  },

  {
    value: ClientType.Employee,
    label: 'ادارة المدخلين',
    addLabel: 'اضافة حساب  المدخلين',
    typeKey: 'employee',
  },
] as const

type Props = {
  activeClientType: ClientType
  selectedClients: ClientDto[]
  onRefresh: () => void
}

export default function UsersToolbar({ activeClientType }: Props) {
  const activeConfig =
    CLIENT_TYPE_CONFIG.find(c => c.value === activeClientType) ?? CLIENT_TYPE_CONFIG[0]

  return (
    <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
      <Box className="flex flex-wrap gap-3 justify-between items-center">
        <Typography variant="h5">إدارة {activeConfig.label}</Typography>

        <Box className="flex gap-2 flex-wrap">
          <Button
            component={NextLink}
            href={`/users/add?type=${activeConfig.typeKey}`}
            variant="contained"
            startIcon={<i className="ri-add-line" />}
          >
            {activeConfig.addLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
