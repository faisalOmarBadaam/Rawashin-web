import { useState } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { Outlet } from 'react-router'
import NavBar from './components/NavBar'
import PageWrapper from '@/shared/components/ui/PageWrapper'

function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <Box className="app-shell">
      <NavBar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((current) => !current)} />
      <Stack className={`app-shell__content${sidebarCollapsed ? ' app-shell__content--collapsed' : ''}`} spacing={3}>
        <PageWrapper>
          <Outlet />
        </PageWrapper>
      </Stack>
    </Box>
  )
}

export default DashboardLayout