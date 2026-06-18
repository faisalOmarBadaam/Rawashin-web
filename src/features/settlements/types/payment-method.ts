export const PaymentMethod = {
  Cash: 0,
  BankTransfer: 1,
  Check: 2,
  InternalTransfer: 3,
} as const

export type PaymentMethod =
  (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const paymentMethodOptions = [
  { value: PaymentMethod.Cash, label: 'كاش' },
  { value: PaymentMethod.BankTransfer, label: 'تحويل بنكي' },
  { value: PaymentMethod.Check, label: 'شيك' },
  { value: PaymentMethod.InternalTransfer, label: 'تحويل داخلي' },
] as const

export function getPaymentMethodLabel(method?: PaymentMethod | null) {
  const option = paymentMethodOptions.find(item => item.value === method)

  return option?.label ?? '—'
}