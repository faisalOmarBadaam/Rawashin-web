import PageWrapper from '@/shared/components/ui/PageWrapper'
import { Outlet } from 'react-router'

function AuthLayout() {
  return (
    <main>
      <PageWrapper>
        <Outlet />
      </PageWrapper>
    </main>
  )
}

export default AuthLayout