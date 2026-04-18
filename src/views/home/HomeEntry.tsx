'use client'

import { useMemo, useState } from 'react'

import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'

import { AppRole } from '@/configs/roles'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { hasRole } from '@/utils/rbac'

import ChargerHome from './ChargerHome'
import EmployeeHome from './EmployeeHome'
import HomeAnalytics from './HomeAnalytics'
import MarchentHome from './MarchentHome'

const EMPTY_ROLES: string[] = []

const HomeEntry = () => {
  const roles = useAuthStore(state => state.session?.roles ?? EMPTY_ROLES)
  const [activeTab, setActiveTab] = useState<'employee' | 'charger'>('employee')

  const isAdmin = useMemo(() => hasRole(roles, AppRole.Admin), [roles])

  const isEmployee = useMemo(() => hasRole(roles, AppRole.Employee), [roles])

  const isCharger = useMemo(() => hasRole(roles, AppRole.Charger), [roles])

  const isMerchant = useMemo(() => hasRole(roles, AppRole.Merchant), [roles])

  const handleChange = (event: React.SyntheticEvent, newValue: 'employee' | 'charger') => {
    setActiveTab(newValue)
  }

  // 1. Admin gets highest priority - sees everything via Analytics dashboard
  if (isAdmin) return <HomeAnalytics />

  // 2. Dual Role: Employee + Charger -> Tabbed View
  if (isEmployee && isCharger) {
    return (
      <TabContext value={activeTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="role dashboard tabs">
            <Tab label="لوحة الموظف" value="employee" />
            <Tab label="لوحة الشحن" value="charger" />
          </TabList>
        </Box>
        <TabPanel value="employee" sx={{ p: 0, pt: 3 }}>
          {activeTab === 'employee' ? <EmployeeHome /> : null}
        </TabPanel>
        <TabPanel value="charger" sx={{ p: 0, pt: 3 }}>
          {activeTab === 'charger' ? <ChargerHome /> : null}
        </TabPanel>
      </TabContext>
    )
  }

  // 3. Single Role Checks
  if (isEmployee) return <EmployeeHome />
  if (isCharger) return <ChargerHome />
  if (isMerchant) return <MarchentHome />

  // 4. Fallback
  return null
}

export default HomeEntry
