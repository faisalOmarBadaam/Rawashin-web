import { Outlet } from 'react-router'
import PageWrapper from './PageWrapper'

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