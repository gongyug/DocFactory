import { AppError } from './errors';

export function validateMarkdown(markdown: string | undefined): asserts markdown is string {
  if (!markdown || typeof markdown !== 'string') {
    throw new AppError(
      'INVALID_MARKDOWN',
      'Markdown content is required and must be a string'
    );
  }

  // Check size limit (500KB)
  const sizeInBytes = new Blob([markdown]).size;
  const maxSize = 500 * 1024; // 500KB

  if (sizeInBytes > maxSize) {
    throw new AppError(
      'FILE_TOO_LARGE',
      `Markdown content exceeds the maximum size of 500KB (current: ${Math.round(sizeInBytes / 1024)}KB)`
    );
  }
}

export function validateOptions<T extends Record<string, any>>(
  options: T | undefined,
  allowedKeys: string[]
): T {
  if (!options) {
    return {} as T;
  }

  if (typeof options !== 'object' || Array.isArray(options)) {
    throw new AppError(
      'INVALID_PARAMETERS',
      'Options must be an object'
    );
  }

  // Check for invalid keys
  const invalidKeys = Object.keys(options).filter(
    key => !allowedKeys.includes(key)
  );

  if (invalidKeys.length > 0) {
    throw new AppError(
      'INVALID_PARAMETERS',
      `Invalid options: ${invalidKeys.join(', ')}`,
      `Allowed options are: ${allowedKeys.join(', ')}`
    );
  }

  return options;
}