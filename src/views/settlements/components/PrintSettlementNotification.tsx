'use client'

import PrintReceipt, { type PrintReceiptRow } from '@/components/print/PrintReceipt'

import type { SettlementDto } from '@/types/api/settlements'
import { PaymentMethod } from '@/types/api/settlements'

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.Cash]: 'نقدًا',
  [PaymentMethod.BankTransfer]: 'تحويل بنكي',
  [PaymentMethod.Check]: 'شيك',
  [PaymentMethod.InternalTransfer]: 'تحويل داخلي',
  cash: 'نقدًا',
  banktransfer: 'تحويل بنكي',
  bank_transfer: 'تحويل بنكي',
  check: 'شيك',
  internaltransfer: 'تحويل داخلي',
  internal_transfer: 'تحويل داخلي'
}

const formatAmount = (amount?: number | null) =>
  amount === null || amount === undefined
    ? '—'
    : amount.toLocaleString()

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : '—'

const resolvePaymentMethod = (
  method?: string | number | null
) => {
  if (method === null || method === undefined) return '—'
  const key =
    typeof method === 'number'
      ? method.toString()
      : method.toString().toLowerCase()
  return PAYMENT_METHOD_LABELS[key] ?? method.toString()
}

type Props = {
  settlement: SettlementDto
}

export default function PrintSettlementNotification({ settlement }: Props) {
  const rows: PrintReceiptRow[] = [
    {
      label: 'مرجع الدفع',
      value: settlement.paymentReference || '—'
    },
    {
      label: 'الاسم',
      value: settlement.clientName || '—'
    },
    {
      label: 'تاريخ التسوية',
      value: formatDate(settlement.settlementDate)
    },
    {
      label: 'طريقة الدفع',
      value: resolvePaymentMethod(settlement.method)
    },
    {
      label: 'صافي المبلغ',
      value: formatAmount(settlement.netAmount),
      highlight: true
    }
  ]

  return (
    <PrintReceipt
      title="إشعار صرف"
      subtitle="إشعار مالي"
      logoUrl="/images/logo.png"
      rows={rows}
       qrValue={
      settlement.paymentReference ||
     
      ''
    }
    size="80mm"
    footerText="وثيقة مالية – تم إنشاؤها إلكترونيًا"
     
    />
  )
}
