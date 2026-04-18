'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import { ClientsVariantPage } from '@/domains/clients'

export default function UsersPageWrapper() {
    return (
        <PageContainer
            title="إدارة المستخدمين"
            breadcrumbs={[
                { label: 'المستخدمين', href: '/ar/users' },
                { label: 'إدارة المستخدمين' }
            ]}
        >
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                }}
            >
                <ClientsVariantPage variant='users' />
            </Box>
        </PageContainer>
    )
}
