import Box from '@mui/material/Box'

import { ClientType } from '@/shared/types/ClientType'
import { useClientCounters } from '../hooks'
import { StatCard } from '@/shared/components/ui/StatCard'

export default function ClientsCounters() {
  const clients = useClientCounters(ClientType.Client)
  const merchants = useClientCounters(ClientType.Merchant)
  const partners = useClientCounters(ClientType.Partner)
  const chargers = useClientCounters(ClientType.Charger)
  const employees = useClientCounters(ClientType.Employee)
  const admins = useClientCounters(ClientType.Admin)
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3, 1fr)',
        },
        gap: 2,
      }}
    >
      <StatCard
        title="عدد المستفيدين"
        value={clients.data ?? 0}
        loading={clients.isLoading}
        icon="mdi:account-group-outline"
        color="primary"
      />

      <StatCard
        title="نقاط البيع"
        value={merchants.data ?? 0}
        loading={merchants.isLoading}
        icon="mdi:storefront-outline"
        color="success"
      />

      <StatCard
        title="الشركاء"
        value={partners.data ?? 0}
        loading={partners.isLoading}
        icon="mdi:handshake-outline"
        color="warning"
      />

      <StatCard
        title="حسابات الشحن"
        value={chargers.data ?? 0}
        loading={chargers.isLoading}
        icon="mdi:ev-station"
        color="info"
      />

      <StatCard
        title="حسابات الموظفين"
        value={employees.data ?? 0}
        loading={employees.isLoading}
        icon="mdi:account-tie-outline"
        color="warning"
      />
      <StatCard
        title="حسابات الادارة"
        value={admins.data ?? 0}
        loading={admins.isLoading}
        icon="mdi:shield-account-outline"
        color="secondary"
      />
    </Box>
  )
}
