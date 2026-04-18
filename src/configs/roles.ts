export enum AppRole {
  Admin = 'Admin',
  Employee = 'Employee',
  Charger = 'Charger',
  Partner = 'Partner',
  Merchant = 'Merchant',
  Customer = 'Customer',
  Profit = 'Profit',
  ProfitAccount = 'ProfitAccount',
}

export const DASHBOARD_ALLOWED_ROLES = [
  AppRole.Admin,
  AppRole.Employee,
  AppRole.Charger,
  AppRole.Merchant,
]

export const CHARGER_ONLY_RESTRICTED_ROLES = [
  AppRole.Partner,
  AppRole.Customer,
  AppRole.Profit,
  AppRole.ProfitAccount,
]

// Routes accessible by Charger role even if restricted otherwise
export const CHARGER_ALLOWED_ROUTES = ['/home', '/charging', '/charging-history', '/profile']

export const ADMIN_ONLY_OPERATIONS = [
  'manage_admins',
  'manage_profit_accounts',
  'edit_system_settings',
  'view_financial_reports',
]
