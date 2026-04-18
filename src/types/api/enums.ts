/* =========================================================
 * Client & Identity Enums
 * ======================================================= */

export enum ClientType {
  Client = 0,
  Merchant = 1,
  Partner = 2,
  Admin = 3,
  System = 4
}

export enum NationalIdType {
  NationalId = 0,
  Passport = 1,
  Other = 2
}

/* =========================================================
 * Credit Account Enums
 * ======================================================= */

export enum CreditAccountStatus {
  Active = 1,
  Suspended = 2,
  Closed = 3
}

/* =========================================================
 * Settlement Enums
 * ======================================================= */

export enum SettlementStatus {
  New = 0,
  InProcess = 1,
  Completed = 2,
  ClosedWithoutCompletion = 3
}

export enum PaymentMethod {
  Cash = 0,
  BankTransfer = 1,
  Check = 2,
  InternalTransfer = 3
}
