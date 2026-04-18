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
  internal_transfer: 'تحويل داخلي',
}

const formatAmount = (amount?: number | null) =>
  amount === null || amount === undefined
    ? '—'
    : amount.toLocaleString(undefined, { minimumFractionDigits: 2 })

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—')

const resolvePaymentMethod = (method?: string | number | null) => {
  if (method === null || method === undefined) return '—'
  const key = typeof method === 'number' ? method.toString() : method.toString().toLowerCase()
  return PAYMENT_METHOD_LABELS[key] ?? method.toString()
}

type Props = {
  settlement: SettlementDto
}

export default function PrintSettlementVoucher({ settlement }: Props) {
  const rows: PrintReceiptRow[] = [
    {
      label: 'مرجع الدفع',
      value: settlement.paymentReference || '—',
    },
    { label: 'تاريخ التسوية', value: formatDate(settlement.settlementDate) },
    { label: 'اسم نقطة البيع', value: settlement.clientName || '—' },
    { label: 'إجمالي المبلغ', value: formatAmount(settlement.grossAmount) },
    {
      label: 'نسبة العمولة',
      value: `${settlement.commissionPercentage ?? 0}%`,
    },
    {
      label: 'قيمة العمولة',
      value: formatAmount(settlement.commissionAmount),
    },
    {
      label: 'صافي المبلغ',
      value: formatAmount(settlement.netAmount),
      highlight: true,
    },
    {
      label: 'طريقة الدفع',
      value: resolvePaymentMethod(settlement.method),
    },
  ]

  if (settlement.adminNote) {
    rows.push({
      label: 'ملاحظة',
      value: settlement.adminNote,
    })
  }

  return (
    <PrintReceipt
      title="أمر صرف"
      subtitle="Payment Voucher"
      logoUrl="/images/logo.png"
      rows={rows}
      qrValue={settlement.paymentReference || ''}
      size="58mm"
      footerText="وثيقة مالية – تم إنشاؤها إلكترونيًا"
    />
  )
}
