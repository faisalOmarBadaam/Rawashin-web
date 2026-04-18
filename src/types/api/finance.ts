export interface CommissionsDto {
  id: string
  commissionRate: number
  description?: string | null
  commissionDate: string
}

export type CreateCommissionDto = Omit<CommissionsDto, 'id'>
