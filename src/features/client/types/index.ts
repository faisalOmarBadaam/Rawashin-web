export const AccountStatus = {
  Inactive: 0,
  Active: 1,
  Pending: 2,
} as const

export type AccountStatus =
  typeof AccountStatus[keyof typeof AccountStatus]

  export type AccountStatusOption = {
  label: string
  value: AccountStatus
}
export type NationalIdTypeOption = {
  value: number
  label: string
}

export const INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS: readonly NationalIdTypeOption[] = [
  { value: 0, label: 'هوية وطنية' },
  { value: 1, label: 'جواز سفر' },
]

export const BUSINESS_NATIONAL_ID_TYPE_OPTIONS: readonly NationalIdTypeOption[] = [
  ...INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS,
  { value: 2, label: 'سجل تجاري' },
]
