export const endpoints = {
  auth: {
    register: '/api/Auth/register',
    login: '/api/Auth/login',
    refresh: '/api/Auth/refresh',
    logout: '/api/Auth/logout',
    resetPassword: '/api/Auth/ResetPassword',
    toggleFirstLogin: '/api/Auth/ToggleFirstLogin',
    adminResetPassword: '/api/Auth/admin-reset-password',
    forgotPasswordRequestOTP: '/api/Auth/forgot-password/request-OTP',
    forgotPasswordVerifyOTP: '/api/Auth/forgot-password/verify-OTP',
    forgotPasswordReset: '/api/Auth/forgot-password/reset',
  },

  clients: {
    base: '/api/clients',
    byId: (id: string) => `/api/clients/${id}`,
    contact: (id: string) => `/api/clients/${id}/contact`,
    lookup: '/api/clients/lookup',
    lookupChildren: (clientId: string) => `/api/clients/${clientId}/lookupChildren`,

    creditAccounts: (clientId: string) => `/api/clients/${clientId}/credit-accounts`,
    commissions: (clientId: string) => `/api/clients/${clientId}/commissions`,

    transactions: (clientId: string) => `/api/clients/${clientId}/transactions`,
    transactionsTotalAmount: (clientId: string) =>
      `/api/clients/${clientId}/Transactions/CreditAccount/TotalAmount`,
    transactionsDebtAmount: (clientId: string) =>
      `/api/clients/${clientId}/Transactions/CreditAccount/DeptAmount`,
    changeStatus: (clientId: string) => `/api/clients/${clientId}/status`,
    chanceReceiveCard: (clientId: string) => `/api/clients/${clientId}/credit-account/received`,
    statisticsCount: '/api/clients/statistics/count',
    AssignNewCard: (clientId: string) => `/api/clients/${clientId}/assign-card`,

    byCreditCard: (cardNumber: string) => `/api/clients/credit-card/${cardNumber}`,
    updatePassCode: (clientId: string) => `/api/clients/${clientId}/credit-account/passcode`,
  },

  transactions: {
    base: '/api/Transactions',
    byId: (id: string) => `/api/Transactions/${id}`,
    chargeCreditAccount: '/api/Transactions/creaditAccount/charge',
    debtCreditAccount: '/api/Transactions/creaditAccount/debt',
    statisticsCount: '/api/Transactions/statistics/count',
    statisticsTotalSum: '/api/Transactions/statistics/TotalSum',
    uploadBatch: (partnerId: string) => `/api/Transactions/upload-batch/${partnerId}`,
    accountChargesBatch: '/api/Transactions/account-charges/batch',
    balancesTotal: '/api/Transactions/balances/total',
    deposit: '/api/Transactions/deposit',
    refund: '/api/Transactions/refund',
    getByReference: (clientId: string, referenceId: string) =>
      `/api/Transactions/${clientId}/reference/${referenceId}`,

    create: '/api/Transactions',
    list: '/api/Transactions',
    deleteById: (id: string) => `/api/Transactions/${id}`,
    chargerChargeCustomer: (id: string) => `/api/Transactions/Charger-Charge-Customer/${id}`,
    refillCharger: '/api/Transactions/refill-charger',
    chargerStatistics: (clientId: string) => `/api/client/${clientId}/transactions/statistics`,
  },

  merchant: {
    subMerchants: (merchantId: string) => `/api/Merchant/${merchantId}/sub-merchants`,
    subMerchantById: (merchantId: string, subMerchantId: string) =>
      `/api/Merchant/${merchantId}/sub-merchants/${subMerchantId}`,
    subMerchantsSettlement: (merchantId: string) =>
      `/api/Merchant/${merchantId}/sub-merchants/settlement`,
  },

  roles: {
    base: '/api/Roles',
    list: '/api/Roles',
    assign: '/api/Roles/assign',
    unassign: '/api/Roles/unassign',
    byClientId: (clientId: string) => `/api/Roles/${clientId}`,
  },

  settlements: {
    base: '/api/Settlements',
    byId: (id: string) => `/api/Settlements/${id}`,
    createByClient: (clientId: string) => `/api/clients/${clientId}/settlements`,

    clientSettlementsPaged: (clientId: string) => `/api/clients/${clientId}/settlements`,
    merchantSettlements: (merchantId: string) => `/api/clients/${merchantId}/settlements`,

    update: (id: string) => `/api/Settlements/${id}`,
    process: (id: string) => `/api/Settlements/${id}/process`,
    complete: (id: string) => `/api/Settlements/${id}/complete`,
    cancel: (id: string) => `/api/Settlements/${id}/cancel`,

    settlementDetailsByReference: (referenceId: string) =>
      `/api/Settlements/settlement-details/${referenceId}`,
  },

  supportTickets: {
    base: '/api/Support-tickets',
    byClientId: (clientId: string) => `/api/client/${clientId}/Support-tickets`,
    byId: (id: string) => `/api/Support-tickets/${id}`,
    status: (id: string) => `/api/Support-tickets/${id}/status`,
    messages: (id: string) => `/api/Support-tickets/${id}/messages`,
    create: '/api/Support-tickets',
    list: '/api/Support-tickets',
  },

  notifications: {
    sendToAll: '/api/Notifications/send-to-all',
  },

  attachment: {
    deleteById: (id: string) => `/api/attachments/${id}`,
    showById: (id: string) => `/api/attachments/${id}/temporary-url`,
    clientAttachments: (clientId: string) => `/api/attachments/clients/${clientId}`,
    addClientAttachment: (clientId: string) => `/api/attachments/clients/${clientId}`,
  },

  commissions: {
    client: (clientId: string) => `/api/Commissions/clients/${clientId}`,
  },

  auditLogs: {
    list: '/api/audit-logs',
  },
} as const
