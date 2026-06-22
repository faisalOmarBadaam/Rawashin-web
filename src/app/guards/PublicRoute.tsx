import { Navigate, Outlet } from 'react-router'
import { hasAccessToken } from '@/features/auth/utils/session'
import PageWrapper from '@/shared/components/ui/PageWrapper'

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