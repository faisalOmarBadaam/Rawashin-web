export class ApiError extends Error {
  public readonly status?: number;
  public readonly traceId?: string | null;
  public readonly code?: string | null;
  public readonly field?: string | null;

  constructor(
    message: string,
    opts?: { status?: number; traceId?: string | null; code?: string | null; field?: string | null }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.traceId = opts?.traceId;
    this.code = opts?.code;
    this.field = opts?.field;
  }
}
