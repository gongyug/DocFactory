import { NextResponse } from 'next/server';
import { ApiError, ErrorCode } from '@/types/api';

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: string,
  status: number = 500
) {
  const error: ApiError = {
    code,
    message,
    details,
  };

  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  );
}

export function handleError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    const statusMap: Record<ErrorCode, number> = {
      INVALID_MARKDOWN: 400,
      FILE_TOO_LARGE: 413,
      CONVERSION_FAILED: 500,
      RATE_LIMIT_EXCEEDED: 429,
      INVALID_PARAMETERS: 400,
      UNAUTHORIZED: 401,
      INTERNAL_ERROR: 500,
    };

    return createErrorResponse(
      error.code,
      error.message,
      error.details,
      statusMap[error.code]
    );
  }

  if (error instanceof Error) {
    return createErrorResponse(
      'INTERNAL_ERROR',
      'An unexpected error occurred',
      error.message
    );
  }

  return createErrorResponse(
    'INTERNAL_ERROR',
    'An unexpected error occurred'
  );
}