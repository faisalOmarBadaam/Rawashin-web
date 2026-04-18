'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'

import MuiAlert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { toast } from 'react-toastify'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { useSupportTicketMessagesStore } from '@/contexts/support-ticket/supportTicketMessages.store'
import { useSupportTicketsStore } from '@/contexts/support-ticket/supportTickets.store'

import { SupportTicketMessageSenderType, SupportTicketStatus } from '@/types/api/supportTickets'

import GenericChattingCard from '@/components/Chatting/GenericChattingCard'
import AlertDialog from '@/components/dialogs/AlertDialog'

import SupportTicketCategoryChip, {
  getSupportTicketCategoryLabel,
} from './components/SupportTicketCategoryChip'
import SupportTicketStatusChip from './components/SupportTicketStatusChip'

type Props = {
  ticketId: string
  clientId?: string
}

const formatDateTime = (value?: string | null) => (value ? new Date(value).toLocaleString() : '—')

const normalizeSenderType = (value: unknown): SupportTicketMessageSenderType | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    if (value === SupportTicketMessageSenderType.Support)
      return SupportTicketMessageSenderType.Support
    if (value === SupportTicketMessageSenderType.Client)
      return SupportTicketMessageSenderType.Client
    return null
  }

  const normalized = value.toString().trim().toLowerCase()

  if (normalized === 'support' || normalized === 'admin' || normalized === 'staff') {
    return SupportTicketMessageSenderType.Support
  }

  if (normalized === 'client' || normalized === 'customer' || normalized === 'user') {
    return SupportTicketMessageSenderType.Client
  }

  return null
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function SupportTicketDetailsView({ ticketId, clientId }: Props) {
  const { selectedClientContact, fetchClientContact, clearClientContact } = useClientsStore()

  const {
    selectedTicket,
    loading,
    updatingStatus,
    error,
    fetchSupportTicketById,
    updateSupportTicketStatus,
    cleanupSelectedTicketSubscription,
  } = useSupportTicketsStore()

  const {
    messages,
    loading: loadingMessages,
    sending: sendingMessage,
    error: messagesError,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    cleanupMessagesSubscription,
  } = useSupportTicketMessagesStore()

  const [statusDraft, setStatusDraft] = useState<SupportTicketStatus | null>(null)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const resolvedClientId = clientId ?? selectedTicket?.clientId ?? undefined

  useEffect(() => {
    fetchSupportTicketById(ticketId, clientId)

    return () => {
      cleanupSelectedTicketSubscription()
    }
  }, [cleanupSelectedTicketSubscription, clientId, fetchSupportTicketById, ticketId])

  useEffect(() => {
    fetchMessages(ticketId, clientId)

    return () => {
      cleanupMessagesSubscription()
    }
  }, [cleanupMessagesSubscription, clientId, fetchMessages, ticketId])

  useEffect(() => {
    if (!resolvedClientId) {
      clearClientContact()
      return
    }

    void fetchClientContact(resolvedClientId)

    return () => {
      clearClientContact()
    }
  }, [clearClientContact, fetchClientContact, resolvedClientId])

  const isThisTicket = selectedTicket?.id === ticketId
  const subject = useMemo(() => selectedTicket?.subject ?? '—', [selectedTicket])
  const requesterName = useMemo(
    () => selectedClientContact?.fullName?.trim() || selectedTicket?.clientName || 'العميل',
    [selectedClientContact?.fullName, selectedTicket?.clientName],
  )
  const requesterPhone = useMemo(
    () => selectedClientContact?.phoneNumber?.trim() || selectedTicket?.clientPhoneNumber || '—',
    [selectedClientContact?.phoneNumber, selectedTicket?.clientPhoneNumber],
  )

  useEffect(() => {
    if (!selectedTicket || !isThisTicket) return
    setStatusDraft((selectedTicket.status ?? null) as SupportTicketStatus | null)
  }, [isThisTicket, selectedTicket])

  useEffect(() => {
    if (!isThisTicket || loadingMessages) return

    const hasUnreadClientMessages = (messages ?? []).some(
      message =>
        normalizeSenderType(message.senderType) === SupportTicketMessageSenderType.Client &&
        !message.seenAt,
    )

    if (!hasUnreadClientMessages) return

    void markMessagesAsRead(ticketId, clientId)
  }, [clientId, isThisTicket, loadingMessages, markMessagesAsRead, messages, ticketId])

  const chatItems = useMemo(() => {
    const items: Array<{
      id: string
      senderName: string
      senderType: SupportTicketMessageSenderType | null
      message: string
      createdAt?: string | null
    }> = []

    if (selectedTicket && isThisTicket && selectedTicket.description) {
      items.push({
        id: 'initial-description',
        senderName: requesterName,
        senderType: SupportTicketMessageSenderType.Client,
        message: selectedTicket.description,
        createdAt: selectedTicket.createdAt,
      })
    }

    for (const m of messages ?? []) {
      items.push({
        id: m.id,
        senderName:
          (m.senderName && m.senderName.trim()) ||
          (normalizeSenderType(m.senderType) === SupportTicketMessageSenderType.Support
            ? 'الدعم الفني'
            : requesterName),
        senderType: normalizeSenderType(m.senderType),
        message: m.message,
        createdAt: m.createdAt,
      })
    }

    items.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return ta - tb
    })

    return items
  }, [isThisTicket, messages, requesterName, selectedTicket])

  if (loading && !isThisTicket) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    )
  }

  if (!selectedTicket || !isThisTicket) {
    return <MuiAlert severity="error">{error || 'تعذر تحميل بيانات التذكرة.'}</MuiAlert>
  }

  const canUpdateStatus =
    statusDraft !== null &&
    statusDraft !== undefined &&
    statusDraft !== SupportTicketStatus.Complete

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              justifyContent="space-between"
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <i className="ri-customer-service-2-line" />
                  {subject}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <SupportTicketStatusChip status={selectedTicket.status ?? null} />
                <SupportTicketCategoryChip category={selectedTicket.category ?? null} />
              </Stack>
            </Stack>

            <Divider />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                gap: 2.5,
              }}
            >
              <InfoItem label="مقدم الطلب" value={requesterName} />
              <InfoItem label="رقم هاتف مقدم الطلب" value={requesterPhone} />
              <InfoItem
                label="التصنيف"
                value={getSupportTicketCategoryLabel(selectedTicket.category ?? null)}
              />
              <InfoItem label="تاريخ الإنشاء" value={formatDateTime(selectedTicket.createdAt)} />
            </Box>
          </Stack>
        </CardContent>
      </Card>
      {selectedTicket!.status === SupportTicketStatus.Complete && (
        <MuiAlert severity="info">هذه التذكرة مغلقة، لا يمكنك إرسال رسائل جديدة.</MuiAlert>
      )}

      <GenericChattingCard
        title={
          <>
            <i className="ri-chat-3-line" /> المحادثة
          </>
        }
        error={messagesError}
        disableSend={selectedTicket.status === SupportTicketStatus.Complete}
        onRetry={() => fetchMessages(ticketId, clientId)}
        loading={loadingMessages}
        sending={sendingMessage}
        messages={chatItems}
        getIsRightAligned={m => m.senderType === SupportTicketMessageSenderType.Support}
        onSend={async text => {
          await sendMessage(
            ticketId,
            {
              senderType: SupportTicketMessageSenderType.Support,
              message: text,
            },
            clientId,
          )
        }}
        onSendError={() => toast.error('تعذر إرسال الرسالة')}
      />

      <AlertDialog
        open={closeDialogOpen}
        title="تأكيد إغلاق التذكرة"
        description="عند إغلاق التذكرة لن تتمكن من إعادة فتحها مرة أخرى. هل أنت متأكد؟"
        confirmText="إغلاق التذكرة"
        cancelText="إلغاء"
        loading={updatingStatus}
        onClose={() => {
          if (updatingStatus) return
          setCloseDialogOpen(false)
        }}
        onConfirm={async () => {
          try {
            await updateSupportTicketStatus(ticketId, SupportTicketStatus.Complete, clientId)
            toast.success('تم اغلاق التذكرة')
            setCloseDialogOpen(false)
          } catch {
            toast.error('تعذر تحديث الحالة')
          }
        }}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Button
          variant="contained"
          disabled={!canUpdateStatus || updatingStatus}
          startIcon={
            updatingStatus ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <i className="ri-save-3-line" />
            )
          }
          onClick={async () => {
            if (statusDraft === null || statusDraft === undefined) return
            setCloseDialogOpen(true)
          }}
        >
          إغلاق التذكرة
        </Button>
      </Stack>
    </Stack>
  )
}
