import { useAuditLogsStore } from '@/contexts/audit-logs/auditLogs.store'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useRegisterStore } from '@/contexts/clients/register.store'
import { useNotificationsStore } from '@/contexts/notifications/notifications.store'
import { useRolesStore } from '@/contexts/roles/roles.store'
import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import { useSupportTicketMessagesStore } from '@/contexts/support-ticket/supportTicketMessages.store'
import { useSupportTicketsStore } from '@/contexts/support-ticket/supportTickets.store'
import { useTransactionsStore } from '@/contexts/transactions/transactions.store'
import { tokenStore } from '@/libs/api/tokenStore'
import { queryClient } from '@/libs/react-query/queryClient'

export const secureLogout = () => {
  tokenStore.clear()

  useAuthStore.getState().logout()
  useTransactionsStore.getState().reset()
  useAuditLogsStore.getState().reset()
  useRegisterStore.getState().reset()

  useClientsStore.setState({
    list: [],
    totalCount: 0,
    loading: false,
    error: null,
    selectedClient: null,
    selectedClientContact: null,
  })

  useSettlementsStore.setState({
    list: [],
    totalCount: 0,
    loading: false,
    error: null,
    selectedSettlement: null,
  })

  useSupportTicketsStore.setState({
    list: [],
    totalCount: 0,
    loading: false,
    updatingStatus: false,
    error: null,
    selectedTicket: null,
  })

  useSupportTicketMessagesStore.setState({
    messages: [],
    loading: false,
    sending: false,
    error: null,
  })

  useRolesStore.setState({
    list: [],
    clientRoles: [],
    loading: false,
    error: null,
  })

  useNotificationsStore.setState({
    sendingToAll: false,
    error: null,
  })

  queryClient.clear()
}
