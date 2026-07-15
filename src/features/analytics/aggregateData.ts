/* src/features/analytics/aggregateData.ts */
import { Column } from '../../types/dataset';
import { AggregationType } from '../../store/chartStore';

export interface AggregatedDataItem {
  [key: string]: string | number;
}

/**
 * Groups and aggregates filtered rows by the chosen X-axis dimension and Y-axis metric.
 * Supports SUM, AVG, COUNT, MIN, and MAX aggregation methods.
 */
export function aggregateData(
  filteredData: Record<string, string>[],
  xAxis: Column,
  yAxis: Column,
  aggregation: AggregationType
): AggregatedDataItem[] {
  if (!filteredData || filteredData.length === 0 || !xAxis || !yAxis) return [];

  const xKey = xAxis.name;
  const yKey = yAxis.name;

  // 1. Group rows by the X-axis dimension value
  const groups: Record<string, Record<string, string>[]> = {};
  for (const row of filteredData) {
    const groupVal = row[xKey] !== undefined && row[xKey] !== null && row[xKey] !== '' ? row[xKey] : '(blank)';
    if (!groups[groupVal]) {
      groups[groupVal] = [];
    }
    groups[groupVal].push(row);
  }

  // 2. Perform the aggregation on each group
  const result: AggregatedDataItem[] = [];

  for (const [groupVal, rows] of Object.entries(groups)) {
    // Extract and parse numeric metric values
    const numericValues = rows
      .map((row) => parseFloat(row[yKey]))
      .filter((val) => !isNaN(val));

    let aggregatedValue = 0;

    switch (aggregation) {
      case 'SUM':
        aggregatedValue = numericValues.reduce((sum, val) => sum + val, 0);
        break;

      case 'AVG':
        if (numericValues.length > 0) {
          const sum = numericValues.reduce((s, val) => s + val, 0);
          aggregatedValue = sum / numericValues.length;
        } else {
          aggregatedValue = 0;
        }
        break;

      case 'COUNT':
        // COUNT represents the total number of entries in this category group
        aggregatedValue = rows.length;
        break;

      case 'MIN':
        if (numericValues.length > 0) {
          aggregatedValue = Math.min(...numericValues);
        } else {
          aggregatedValue = 0;
        }
        break;

      case 'MAX':
        if (numericValues.length > 0) {
          aggregatedValue = Math.max(...numericValues);
        } else {
          aggregatedValue = 0;
        }
        break;

      default:
        aggregatedValue = 0;
    }

    // Round decimals to 2 places to look pristine
    if (typeof aggregatedValue === 'number') {
      aggregatedValue = Math.round(aggregatedValue * 100) / 100;
    }

    result.push({
      [xKey]: groupVal,
      [yKey]: aggregatedValue,
    });
  }

  // 3. Sort by X-axis key lexically or numerically to preserve a neat visual layout
  result.sort((a, b) => {
    const valA = String(a[xKey]);
    const valB = String(b[xKey]);
    return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
  });

  return result;
}
