'use client'

import { useEffect, useMemo } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'

import GenericDataGrid from '@/components/datagrid/GenericDataGrid'
import { supportTicketsModule } from '@/modules/supportTickets/supportTickets.module'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { useSupportTicketsStore } from '@/contexts/support-ticket/supportTickets.store'

import type { SupportTicketDto } from '@/types/api/supportTickets'

import SupportTicketsFiltersBar from './components/SupportTicketsFiltersBar'
import SupportTicketsToolbar from './components/SupportTicketsToolbar'

export default function SupportTicketsPage() {
  const router = useRouter()
  const { clientContactsById, fetchClientContact } = useClientsStore()

  const {
    list,
    totalCount,
    loading,
    error,
    query,
    setQuery,
    fetchSupportTickets,
    cleanupTicketsSubscription,
  } = useSupportTicketsStore()

  useEffect(() => {
    fetchSupportTickets()

    return () => {
      cleanupTicketsSubscription()
    }
  }, [
    cleanupTicketsSubscription,
    fetchSupportTickets,
    query.PageNumber,
    query.PageSize,
    query.SortBy,
    query.SortDir,
    query.Search,
    query.Category,
    query.Status,
  ])

  useEffect(() => {
    const clientIds = Array.from(
      new Set(
        list
          .map(ticket => ticket.clientId)
          .filter((value): value is string => Boolean(value && !clientContactsById[value])),
      ),
    )

    if (clientIds.length === 0) return

    void Promise.allSettled(clientIds.map(clientId => fetchClientContact(clientId)))
  }, [clientContactsById, fetchClientContact, list])

  const columns = useMemo(
    // TODO: legacy adapter - removable after migration verification.
    () => supportTicketsModule.columns.list(),
    [],
  )

  const rows = useMemo(
    () =>
      list.map(ticket => {
        const contact = ticket.clientId ? clientContactsById[ticket.clientId] : undefined

        return {
          ...ticket,
          clientName: contact?.fullName?.trim() || ticket.clientName,
          clientPhoneNumber: contact?.phoneNumber?.trim() || ticket.clientPhoneNumber,
        }
      }),
    [clientContactsById, list],
  )

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <SupportTicketsToolbar onRefresh={fetchSupportTickets} />

          <SupportTicketsFiltersBar />

          <GenericDataGrid<SupportTicketDto>
            rows={rows}
            columns={columns}
            loading={loading}
            totalCount={totalCount}
            query={query}
            setQuery={setQuery}
            getRowId={row => row.id}
            error={error ? 'تعذر تحميل التذاكر. يرجى المحاولة مرة أخرى.' : undefined}
            onRetry={fetchSupportTickets}
            onRowDoubleClick={row => {
              const clientId = row.clientId ? `?clientId=${encodeURIComponent(row.clientId)}` : ''

              router.push(`/support-ticket/${row.id}${clientId}`)
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
