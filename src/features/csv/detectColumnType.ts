/* src/features/csv/detectColumnType.ts */
import { ColumnType } from '../../types/dataset';

/**
 * Checks if a string looks like a number (supporting commas, currency signs, and percentage symbols)
 */
function isNumericString(val: string): boolean {
  if (val === undefined || val === null) return false;
  const clean = val.trim();
  if (clean === '') return false;

  // Strip currency symbols ($), commas, and percentage signs for validation
  const stripped = clean.replace(/^[$\u20AC\u00A3\u00A5]/, '').replace(/%$/, '').replace(/,/g, '').trim();
  
  if (stripped === '') return false;
  return !isNaN(Number(stripped));
}

/**
 * Evaluates the appropriate ColumnType based on column values across a sample of rows
 */
export function detectColumnType(values: string[]): ColumnType {
  // Filter out empty or whitespace-only values to avoid parsing noise
  const nonNilValues = values
    .map(v => v?.trim())
    .filter(v => v !== undefined && v !== null && v !== '');

  if (nonNilValues.length === 0) {
    return 'Dimension'; // Default to dimension if no data is available
  }

  // Count how many values look numeric
  let numericCount = 0;
  for (const val of nonNilValues) {
    if (isNumericString(val)) {
      numericCount++;
    }
  }

  // If more than 80% of non-empty values are numeric, classify as Metric
  const numericRatio = numericCount / nonNilValues.length;
  if (numericRatio >= 0.8) {
    return 'Metric';
  }

  return 'Dimension';
}
