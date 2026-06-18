import { Navigate, Outlet } from 'react-router'
import PageWrapper from '../components/layout/PageWrapper'
import { hasAccessToken } from '@/features/auth/utils/session'

export default function PublicLayout() {
  const token = hasAccessToken()

  if (token) {
    return <Navigate to="/" replace />
  }

  return (
    <main>
      <PageWrapper>
        <Outlet />
      </PageWrapper>
    </main>
  )
}