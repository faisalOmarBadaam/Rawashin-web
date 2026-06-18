export const ClientType = {
  Client: 0,
  Merchant: 1,
  Partner: 2,
  Admin: 3,
  ProfitAccount: 4,
  Charger: 5,
  Employee: 6,
} as const;

export type ClientType = typeof ClientType[keyof typeof ClientType];

export const CLIENT_TYPE_TABS = [
  { value: ClientType.Client, label: 'العملاء' },          // الـ value هنا هو 0
  { value: ClientType.Merchant, label: 'نقاط البيع' },       // الـ value هنا هو 1
  { value: ClientType.Partner, label: 'الشركاء' },          // الـ value هنا هو 2
  { value: ClientType.Admin, label: 'حساب الادارة' },       // الـ value هنا هو 3
  { value: ClientType.ProfitAccount, label: 'حساب الأرباح' }, // الـ value هنا هو 4
  { value: ClientType.Charger, label: 'حسابات الشحن' },     // الـ value هنا هو 5
  { value: ClientType.Employee, label: 'حسابات الموظفين' }, // الـ value هنا هو 6
];