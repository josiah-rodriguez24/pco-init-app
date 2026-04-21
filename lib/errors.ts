/**
 * Base application error with a machine-readable code.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

/**
 * Error originating from the Planning Center API.
 * Captures HTTP status, rate-limit state, and the raw response body
 * so callers can decide how to handle (retry, back off, surface to user).
 */
export class PcoApiError extends AppError {
  public readonly pcoStatus: number;
  public readonly retryAfter: number | null;
  public readonly responseBody: unknown;

  constructor(opts: {
    message: string;
    pcoStatus: number;
    retryAfter?: number | null;
    responseBody?: unknown;
  }) {
    super(
      opts.message,
      "PCO_API_ERROR",
      opts.pcoStatus >= 500 ? 502 : opts.pcoStatus
    );
    this.name = "PcoApiError";
    this.pcoStatus = opts.pcoStatus;
    this.retryAfter = opts.retryAfter ?? null;
    this.responseBody = opts.responseBody;
  }
}

/**
 * Produce a safe error payload for JSON responses — never leaks secrets.
 */
export function toErrorResponse(error: unknown): {
  error: string;
  code: string;
} {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  return { error: "Internal server error", code: "INTERNAL_ERROR" };
}
