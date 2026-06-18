import { CLIENT_TYPE_TABS, type ClientType } from '@/shared/types/ClientType'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'

interface HeaderProps {
  clientType: ClientType
  onTabChange: (type: ClientType) => void
}

export default function DashboardHeader({ clientType, onTabChange }: HeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'col', gap: 3, width: '100%' }}>
      <Card sx={{ width: '100%' }}>
        <Tabs
          value={clientType}
          onChange={(_, value) => onTabChange(value as ClientType)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ px: 2 }}
        >
          {CLIENT_TYPE_TABS.map(tab => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Card>
    </Box>
  )
}