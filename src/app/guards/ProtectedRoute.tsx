import { Navigate } from 'react-router'
import DashboardLayout from '../layout/DashboardLayout'
import { hasAccessToken } from '@/features/auth/utils/session'

export default function ProtectedDashboardLayout() {
  const token = hasAccessToken()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <DashboardLayout />
}
