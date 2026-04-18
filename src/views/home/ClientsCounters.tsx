import Box from '@mui/material/Box'

import { ClientType } from '@/types/api/clients'
import { StatCard } from './StatCard'
import { useClientCounters } from './useClientsStore'

export default function ClientsCounters() {
  const clients = useClientCounters(ClientType.Client)
  const merchants = useClientCounters(ClientType.Merchant)
  const partners = useClientCounters(ClientType.Partner)
  const chargers = useClientCounters(ClientType.Charger)
  const profitAccounts = useClientCounters(ClientType.ProfitAccount)
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
        value={clients.count}
        loading={clients.loading}
        icon="mdi:account-group-outline"
        color="primary"
      />

      <StatCard
        title="نقاط البيع"
        value={merchants.count}
        loading={merchants.loading}
        icon="mdi:storefront-outline"
        color="success"
      />

      <StatCard
        title="الشركاء"
        value={partners.count}
        loading={partners.loading}
        icon="mdi:handshake-outline"
        color="warning"
      />

      <StatCard
        title="حسابات الشحن"
        value={chargers.count}
        loading={chargers.loading}
        icon="mdi:ev-station"
        color="info"
      />

      <StatCard
        title="حسابات الموظفين"
        value={employees.count}
        loading={employees.loading}
        icon="mdi:account-tie-outline"
        color="warning"
      />
      <StatCard
        title="حسابات الادارة"
        value={admins.count}
        loading={admins.loading}
        icon="mdi:shield-account-outline"
        color="secondary"
      />
    </Box>
  )
}
