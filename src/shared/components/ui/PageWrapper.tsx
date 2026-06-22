import React from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import AppBreadcrumbs from '../ui/AppBreadcrumbs'

type PageWrapperProps = {
  children: React.ReactNode
  maxWidth?: false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

export default function PageWrapper({ children, maxWidth = false }: PageWrapperProps) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        width: '100%'
      }}
    >
      <Box sx={{ width: '100%' }}>
        <AppBreadcrumbs />
        {children}
      </Box>
    </Container>
  )
}
