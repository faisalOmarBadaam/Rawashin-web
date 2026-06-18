
export type ServerValidationErrors = Record<string, string[]>;

export type ApiError = {
  status?: number;
  message: string;
  errors?: ServerValidationErrors;
};