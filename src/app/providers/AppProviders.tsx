import { CssBaseline, ThemeProvider } from '@mui/material'
import type { ReactNode } from 'react'
import theme from '../../shared/theme/appTheme'
import { QueryClientProvider } from '@tanstack/react-query'
import  queryClientConfig  from '../../lib/reactQueryConfig'



type Props = {
  children: ReactNode
}

function AppProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClientConfig}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default AppProviders