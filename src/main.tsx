import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import rtlPlugin from 'stylis-plugin-rtl'
import { prefixer } from 'stylis'
import './index.css'
import AppProviders from './app/providers/AppProviders'
import App from './app/App'

document.documentElement.lang = 'ar'
document.documentElement.dir = 'rtl'

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={rtlCache}>
      <AppProviders>
        <App />
      </AppProviders>
    </CacheProvider>
  </StrictMode>,
)
