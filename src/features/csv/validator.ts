/* src/features/csv/validator.ts */

export interface CSVValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Checks if there are duplicate column names in the headers (trimmed and case-insensitive comparison).
 */
export function findDuplicateColumns(headers: string[]): boolean {
  const seen = new Set<string>();
  for (const header of headers) {
    const cleanHeader = header.trim().toLowerCase();
    if (cleanHeader === '') continue;
    if (seen.has(cleanHeader)) {
      return true;
    }
    seen.add(cleanHeader);
  }
  return false;
}

/**
 * Validates the metadata, headers, and row structure of the parsed CSV data,
 * and checks for structural parsing errors reported by the parser.
 */
export function validateCSVData(
  headers: string[],
  rows: Record<string, string>[],
  fileSize: number,
  errors: any[] = []
): CSVValidationResult {
  // 1. Basic empty check
  if (fileSize === 0 || (!headers.length && !rows.length)) {
    return {
      isValid: false,
      error: 'This CSV appears to be empty.',
    };
  }

  // 2. Structural parsing errors (like unclosed quotes or syntax errors)
  const structuralErrors = errors.filter(err => err.code !== 'UndetectableDelimiter');
  if (structuralErrors.length > 0) {
    return {
      isValid: false,
      error: "We couldn't read this CSV because it appears to be malformed. Please check the file and try again.",
    };
  }

  // 3. Header validation
  const validHeaders = headers.filter(h => h.trim() !== '');
  if (validHeaders.length === 0) {
    return {
      isValid: false,
      error: "We couldn't recognize this file as a valid CSV.",
    };
  }

  // 3b. Duplicate header validation
  if (findDuplicateColumns(headers)) {
    return {
      isValid: false,
      error: 'Your CSV contains duplicate column names. Please ensure every column has a unique name before uploading.',
    };
  }

  // 4. Row presence validation
  if (rows.length === 0) {
    return {
      isValid: false,
      error: 'The file contains headers but no data.',
    };
  }

  return { isValid: true };
}

