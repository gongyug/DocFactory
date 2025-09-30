import { NextRequest } from 'next/server';
import { AppError } from '@/utils/errors';

/**
 * API Key Authentication Middleware
 * Validates API key from Authorization header
 * Only enforced if API_SECRET_KEY is set in environment variables
 */
export function validateApiKey(request: NextRequest) {
  const apiSecretKey = process.env.API_SECRET_KEY;

  // If no API key is configured, skip authentication
  if (!apiSecretKey) {
    return true;
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    throw new AppError(
      'UNAUTHORIZED',
      'API key is required',
      'Include Authorization header with format: Bearer YOUR_API_KEY'
    );
  }

  // Support both "Bearer TOKEN" and "TOKEN" formats
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  if (token !== apiSecretKey) {
    throw new AppError(
      'UNAUTHORIZED',
      'Invalid API key'
    );
  }

  return true;
}