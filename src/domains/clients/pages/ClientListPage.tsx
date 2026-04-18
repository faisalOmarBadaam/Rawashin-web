'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import type { GridRowSelectionModel } from '@mui/x-data-grid'

import { toast } from 'react-toastify'

import AlertDialog from '@/components/dialogs/AlertDialog'
import { getClientTypeRouteKey } from '@/core/policy/clientType.matrix'
import { ClientTable } from '@/domains/clients/components/ClientTable'
import CreateCommissionDialog from '@/domains/clients/components/shared/AddMarchentCommission'
import AdminResetPasswordDialog from '@/domains/clients/components/shared/AdminResetPasswordDialog'
import AssignNewCardDialog from '@/domains/clients/components/shared/AssignNewCardDialog'
import CardPreviewDialog from '@/domains/clients/components/shared/CardPreviewDialog'
import ChargeCardDialog from '@/domains/clients/components/shared/ChargeCardDialog'
import ClientRolesDialog from '@/domains/clients/components/shared/ClientRolesDialog'
import DepositDialog from '@/domains/clients/components/shared/DepositDialog'
import RefillChargerDialog from '@/domains/clients/components/shared/RefillChargerDialog'
import {
  getClientColumns as getClientsColumns,
  getClientColumns as getEmployeesColumns,
} from '@/domains/clients/components/shared/clients.columns'
import { getClientColumns as getUsersColumns } from '@/domains/clients/components/shared/users.columns'
import ClientsFiltersBar from '@/domains/clients/components/toolbars/ClientsFiltersBar'
import ClientsToolbar from '@/domains/clients/components/toolbars/ClientsToolbar'
import EmployeesFiltersBar from '@/domains/clients/components/toolbars/EmployeesFiltersBar'
import EmployeesToolbar from '@/domains/clients/components/toolbars/EmployeesToolbar'
import MerchantsFiltersBar from '@/domains/clients/components/toolbars/MerchantsFiltersBar'
import UsersFiltersBar from '@/domains/clients/components/toolbars/UsersFiltersBar'
import UsersToolbar from '@/domains/clients/components/toolbars/UsersToolbar'
import {
  applyVariantToListQuery,
  type ClientVariant,
} from '@/domains/clients/variants/clientVariants'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useDeleteClient } from '@/hooks/useDeleteClient'
import { ClientType, type ClientDto } from '@/types/api/clients'

const DEFAULT_QUERY_BY_VARIANT: Record<
  ClientVariant,
  Partial<ReturnType<typeof useClientsStore.getState>['query']>
> = {
  clients: {
    ClientType: ClientType.Client,
    Search: undefined,
    ParentClientId: undefined,
    IsActive: undefined,
    IsReceivedCard: undefined,
    ParentsOnly: undefined,
    PageNumber: 1,
  },
  employees: {
    ClientType: ClientType.Client,
    Search: undefined,
    ParentClientId: undefined,
    IsActive: undefined,
    IsReceivedCard: undefined,
    ParentsOnly: undefined,
    PageNumber: 1,
  },
  users: {
    ClientType: ClientType.Admin,
    Search: undefined,
    ParentClientId: undefined,
    IsActive: undefined,
    IsReceivedCard: undefined,
    ParentsOnly: undefined,
    PageNumber: 1,
  },
  merchants: {
    ClientType: ClientType.Merchant,
    Search: undefined,
    ParentClientId: undefined,
    IsActive: undefined,
    IsReceivedCard: undefined,
    ParentsOnly: undefined,
    PageNumber: 1,
  },
}

type Props = {
  variant: ClientVariant
}

export default function ClientListPage({ variant }: Props) {
  const router = useRouter()
  const loggedUserId = useAuthStore(state => state.session?.userId)

  const { list, totalCount, loading, error, query, setQuery, fetchClients } = useClientsStore()

  useEffect(() => {
    const defaults =
      variant === 'merchants' && loggedUserId
        ? {
            ...DEFAULT_QUERY_BY_VARIANT[variant],
            ParentClientId: loggedUserId,
          }
        : DEFAULT_QUERY_BY_VARIANT[variant]

    setQuery(defaults, { resetPage: true })
  }, [setQuery, variant, loggedUserId])

  const { deleteTarget, deleteTargetName, deleting, requestDelete, cancelDelete, confirmDelete } =
    useDeleteClient({
      variant,
      merchantId: loggedUserId,
    })

  const activeClientType =
    query.ClientType ??
    (variant === 'users'
      ? ClientType.Admin
      : variant === 'merchants'
        ? ClientType.Merchant
        : ClientType.Client)

  const goToView = useCallback(
    (client: ClientDto) => {
      if (variant === 'users') {
        const typeKey =
          activeClientType === ClientType.Admin
            ? 'admin'
            : activeClientType === ClientType.Charger
              ? 'charger'
              : activeClientType === ClientType.Employee
                ? 'employee'
                : 'profit'

        router.push(`/users/${client.id}?mode=view&type=${typeKey}`)
        return
      }

      const typeKey = getClientTypeRouteKey('clients', activeClientType)

      if (variant === 'employees') {
        router.push(`/employees/${client.id}/view?type=${typeKey}`)
        return
      }

      if (variant === 'merchants') {
        router.push(`/merchants/${client.id}/view?type=merchant`)
        return
      }

      router.push(`/clients/${client.id}/view?type=${typeKey}`)
    },
    [router, activeClientType, variant],
  )

  const goToEdit = useCallback(
    (client: ClientDto) => {
      if (variant === 'users') {
        const typeKey =
          activeClientType === ClientType.Admin
            ? 'admin'
            : activeClientType === ClientType.Charger
              ? 'charger'
              : activeClientType === ClientType.Employee
                ? 'employee'
                : 'profit'

        router.push(`/users/${client.id}/edit?type=${typeKey}`)
        return
      }

      const typeKey = getClientTypeRouteKey('clients', activeClientType)

      if (variant === 'employees') {
        router.push(`/employees/${client.id}/edit?type=${typeKey}`)
        return
      }

      if (variant === 'merchants') {
        router.push(`/merchants/${client.id}/edit?type=merchant`)
        return
      }

      router.push(`/clients/${client.id}/edit?type=${typeKey}`)
    },
    [router, activeClientType, variant],
  )

  const [openCardDialog, setOpenCardDialog] = useState(false)
  const [openChargeDialog, setOpenChargeDialog] = useState(false)
  const [openAssignCardDialog, setOpenAssignCardDialog] = useState(false)
  const [openCommissionDialog, setOpenCommissionDialog] = useState(false)
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false)
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openRefillDialog, setOpenRefillDialog] = useState(false)
  const [openRolesDialog, setOpenRolesDialog] = useState(false)

  const [selectedClient, setSelectedClient] = useState<ClientDto | null>(null)
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>({
    type: 'include',
    ids: new Set(),
  })
  const [selectedClientsMap, setSelectedClientsMap] = useState<Record<string, ClientDto>>({})

  const updateSelectedClients = useCallback(
    (ids: (string | number)[]) => {
      const idSet = new Set(ids.map(id => String(id)))

      setSelectedClientsMap(prev => {
        const next: Record<string, ClientDto> = {}

        Object.entries(prev).forEach(([key, value]) => {
          if (idSet.has(key)) {
            next[key] = value
          }
        })

        list.forEach(row => {
          const key = String(row.id)
          if (idSet.has(key)) {
            next[key] = row
          }
        })

        return next
      })
    },
    [list],
  )

  const selectedIds = useMemo(() => Array.from(selectionModel.ids), [selectionModel])

  const selectedClients = useMemo(
    () =>
      selectedIds
        .map(id => selectedClientsMap[String(id)])
        .filter((client): client is ClientDto => Boolean(client)),
    [selectedClientsMap, selectedIds],
  )

  const handlePrint = useCallback((client: ClientDto) => {
    if (client.clientType !== ClientType.Client) return
    setSelectedClient(client)
    setOpenCardDialog(true)
  }, [])

  const handleCharge = useCallback((client: ClientDto) => {
    if (client.clientType !== ClientType.Client) return
    if (!client.creditAccount?.cardNumber) {
      toast.error('المستفيد لا يمتلك بطاقة')
      return
    }
    setSelectedClient(client)
    setOpenChargeDialog(true)
  }, [])

  const handleAssign = useCallback((client: ClientDto) => {
    if (client.clientType !== ClientType.Client) return
    setSelectedClient(client)
    setOpenAssignCardDialog(true)
  }, [])

  const handleAddCommission = useCallback((client: ClientDto) => {
    if (client.clientType !== ClientType.Merchant) return
    setSelectedClient(client)
    setOpenCommissionDialog(true)
  }, [])

  const handleResetPassword = useCallback((client: ClientDto) => {
    setSelectedClient(client)
    setOpenResetPasswordDialog(true)
  }, [])

  const handleDeposit = useCallback((client: ClientDto) => {
    setSelectedClient(client)
    setOpenDepositDialog(true)
  }, [])

  const handleChargeCharger = useCallback((client: ClientDto) => {
    setSelectedClient(client)
    setOpenRefillDialog(true)
  }, [])

  const handleRoles = useCallback((client: ClientDto) => {
    setSelectedClient(client)
    setOpenRolesDialog(true)
  }, [])

  const columns = useMemo(() => {
    if (variant === 'users') {
      return getUsersColumns(activeClientType, {
        onView: goToView,
        onEdit: goToEdit,
        onDelete: requestDelete,
        onRoles: handleRoles,
        onDeposit: handleDeposit,
        onChargeCharger: handleChargeCharger,
        onPassRest: handleResetPassword,
      })
    }

    const columnBuilder = variant === 'employees' ? getEmployeesColumns : getClientsColumns

    const builtColumns = columnBuilder(activeClientType, {
      onView: goToView,
      onEdit: goToEdit,
      onPrint: handlePrint,
      onDelete: requestDelete,
      onAssign: handleAssign,
      onCommission: handleAddCommission,
      onPassRest: handleResetPassword,
    })

    if (variant === 'merchants') {
      return builtColumns.map(column =>
        column.field === 'organizationName'
          ? {
              ...column,
              field: 'fullName',
              headerName: 'الاسم الكامل',
            }
          : column,
      )
    }

    return builtColumns
  }, [
    variant,
    activeClientType,
    goToView,
    goToEdit,
    requestDelete,
    handleRoles,
    handleDeposit,
    handleChargeCharger,
    handleResetPassword,
    handlePrint,
    handleAssign,
    handleAddCommission,
  ])

  useEffect(() => {
    let effectiveQuery = applyVariantToListQuery(variant, query)

    if (variant === 'merchants' && loggedUserId) {
      effectiveQuery = {
        ...effectiveQuery,
        ClientType: ClientType.Merchant,
        ParentClientId: loggedUserId,
      }
    }

    const changed =
      effectiveQuery.ClientType !== query.ClientType ||
      effectiveQuery.ParentClientId !== query.ParentClientId

    if (changed) {
      setQuery(effectiveQuery)
      return
    }

    if (variant === 'merchants' && !loggedUserId) {
      return
    }

    fetchClients()
  }, [
    variant,
    loggedUserId,
    fetchClients,
    setQuery,
    query,
    query.PageNumber,
    query.PageSize,
    query.SortBy,
    query.SortDir,
    query.Search,
    query.ClientType,
    query.IsActive,
    query.IsReceivedCard,
  ])

  useEffect(() => {
    updateSelectedClients(selectedIds)
  }, [selectedIds, updateSelectedClients])

  const Filters =
    variant === 'users'
      ? UsersFiltersBar
      : variant === 'merchants'
        ? MerchantsFiltersBar
        : variant === 'employees'
          ? EmployeesFiltersBar
          : ClientsFiltersBar
  const Toolbar =
    variant === 'users' ? UsersToolbar : variant === 'employees' ? EmployeesToolbar : ClientsToolbar

  const isMerchantsQueryReady =
    variant !== 'merchants' || (Boolean(loggedUserId) && query.ParentClientId === loggedUserId)

  const visibleRows = isMerchantsQueryReady ? list : []
  const visibleTotalCount = isMerchantsQueryReady ? totalCount : 0

  return (
    <>
      <Card>
        <CardContent>
          <Filters />

          <Toolbar
            activeClientType={activeClientType}
            selectedClients={selectedClients}
            onRefresh={fetchClients}
          />

          <ClientTable
            rows={visibleRows}
            columns={columns}
            loading={loading}
            totalCount={visibleTotalCount}
            query={query}
            setQuery={q => setQuery(q)}
            error={error}
            onRetry={fetchClients}
            onRowDoubleClick={client => goToView(client)}
            selectionModel={selectionModel}
            defaultDescFields={['fullName', 'organizationName']}
            onSelectionModelChange={model => {
              if (model.type === 'exclude') {
                const allIds = list.map(row => row.id)
                setSelectionModel({
                  type: 'include',
                  ids: new Set(allIds),
                })
                updateSelectedClients(allIds)
                return
              }

              setSelectionModel(model)
              updateSelectedClients(Array.from(model.ids))
            }}
          />
        </CardContent>
      </Card>

      <CardPreviewDialog
        open={openCardDialog}
        onClose={() => {
          setOpenCardDialog(false)
          setSelectedClient(null)
        }}
        clients={selectedClient ? [selectedClient] : []}
      />

      <ChargeCardDialog
        open={openChargeDialog}
        onClose={() => {
          setOpenChargeDialog(false)
          setSelectedClient(null)
        }}
        CardNumber={selectedClient?.creditAccount?.cardNumber ?? ''}
        clientName={selectedClient?.fullName ?? ''}
      />

      <AssignNewCardDialog
        open={openAssignCardDialog}
        onClose={() => {
          setOpenAssignCardDialog(false)
          setSelectedClient(null)
        }}
        clientId={selectedClient?.id as string}
        clientName={selectedClient?.fullName as string}
      />

      <CreateCommissionDialog
        open={openCommissionDialog}
        onClose={() => {
          setOpenCommissionDialog(false)
          setSelectedClient(null)
        }}
        clientId={selectedClient?.id as string}
        clientName={selectedClient?.organizationName as string}
      />

      {selectedClient && (
        <DepositDialog
          open={openDepositDialog}
          onClose={() => {
            setOpenDepositDialog(false)
            setSelectedClient(null)
          }}
          clientId={selectedClient.id}
          clientName={selectedClient.fullName || selectedClient.organizationName || ''}
        />
      )}

      {selectedClient && (
        <RefillChargerDialog
          open={openRefillDialog}
          onClose={() => {
            setOpenRefillDialog(false)
            setSelectedClient(null)
          }}
          clientId={selectedClient.id}
          clientName={selectedClient.fullName || selectedClient.organizationName || ''}
        />
      )}

      {selectedClient && (
        <ClientRolesDialog
          open={openRolesDialog}
          onClose={() => {
            setOpenRolesDialog(false)
            setSelectedClient(null)
          }}
          clientId={selectedClient.id}
          clientName={selectedClient.fullName || selectedClient.organizationName || ''}
        />
      )}

      {selectedClient && (
        <AdminResetPasswordDialog
          open={openResetPasswordDialog}
          onClose={() => {
            setOpenResetPasswordDialog(false)
            setSelectedClient(null)
          }}
          clientId={selectedClient.id}
          clientName={
            selectedClient.clientType === ClientType.Merchant ||
            selectedClient.clientType === ClientType.Partner
              ? selectedClient.organizationName || ''
              : selectedClient.fullName || ''
          }
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        title="حذف"
        description={
          <>
            هل أنت متأكد من حذف:
            <strong> {deleteTargetName}</strong>؟
            <br />
            لا يمكن التراجع عن هذا الإجراء.
          </>
        }
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </>
  )
}
