import { AccountStatus, type AccountStatusOption } from "../types"

export const HADHRAMAUT_CITIES = [
  'المكلا',
  'الشحر',
  'غيل باوزير',
  'الديس الشرقية',
  'الديس ',
  'الريدة وقصيعر',
  'بروم ميفع',
  'حجر',
  'دوعن',
  'سيئون',
  'تريم',
  'شبام',
  'القطن',
  'حورة ووادي العين',
  'ساه',
  'رماه',
]

export const accountStatusOptions: AccountStatusOption[] = [
  { label: 'غير نشط', value: AccountStatus.Inactive },
  { label: 'نشط', value: AccountStatus.Active },
  { label: 'قيد الانتظار', value: AccountStatus.Pending },
]