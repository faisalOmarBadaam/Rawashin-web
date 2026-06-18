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
