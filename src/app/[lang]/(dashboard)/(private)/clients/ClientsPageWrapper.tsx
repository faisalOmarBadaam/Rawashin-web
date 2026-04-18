'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import { ClientsVariantPage } from '@/domains/clients'

export default function ClientsPageWrapper() {
    return (
        <PageContainer
            title="تفاصيل العملاء"
            breadcrumbs={[
                { label: 'العملاء', href: '/ar/clients' },
                { label: 'إدارة العملاء' }
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
                <ClientsVariantPage variant='clients' />
            </Box>
        </PageContainer>
    )
}
