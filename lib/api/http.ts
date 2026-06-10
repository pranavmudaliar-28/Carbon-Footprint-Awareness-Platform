import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

/** Thrown by service/handler code to short-circuit with a specific status. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init);
}

export function fail(
  status: number,
  message: string,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Centralized error → HTTP response mapping for route handlers. */
export function handleError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return fail(err.status, err.message);
  }
  if (err instanceof ZodError) {
    return fail(400, 'Validation failed', { issues: err.flatten() });
  }
  // Never leak internals to the client.
  console.error('[api] unhandled error:', err);
  return fail(500, 'Internal server error');
}
