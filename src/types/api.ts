// API Request/Response Types

export interface ConvertRequest {
  markdown: string;
  options?: Record<string, any>;
}

export interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  margin?: string;
  css?: string;
  displayHeaderFooter?: boolean;
  preferCSSPageSize?: boolean;
}

export interface ImageOptions {
  format?: 'png' | 'jpeg';
  width?: number;
  quality?: number;
  transparent?: boolean;
  css?: string;
}

export interface DocxOptions {
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface HtmlOptions {
  css?: string;
  standalone?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: string;
}

export type ErrorCode =
  | 'INVALID_MARKDOWN'
  | 'FILE_TOO_LARGE'
  | 'CONVERSION_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_PARAMETERS'
  | 'UNAUTHORIZED'
  | 'INTERNAL_ERROR';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
}