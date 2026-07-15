/* src/features/analytics/filterDataset.ts */
import { Dataset } from '../../types/dataset';
import { FilterState } from '../../store/chartStore';

/**
 * Safely parses a date string from any common format into a JS Date object.
 */
function parseDateString(val: string): Date | null {
  if (!val) return null;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    return d;
  }
  return null;
}

/**
 * Filters rows of a dataset based on active filter configurations.
 * All active filters are applied as an 'AND' operation.
 */
export function filterDataset(dataset: Dataset, filters: FilterState[]): Record<string, string>[] {
  if (!dataset || !dataset.data) return [];
  if (!filters || filters.length === 0) return dataset.data;

  return dataset.data.filter((row) => {
    for (const filter of filters) {
      const { column, selectedValues, startDate, endDate, minVal, maxVal } = filter;
      const val = row[column.name];

      // If row value is undefined or null, check if any filters are active.
      // If yes, this row fails the filter unless the filter is completely empty/inactive.
      if (val === undefined || val === null) {
        if (column.type === 'Dimension') {
          if (selectedValues && selectedValues.length > 0) return false;
          if (startDate || endDate) return false;
        } else if (column.type === 'Metric') {
          if (minVal !== '' || maxVal !== '') return false;
        }
        continue;
      }

      if (column.type === 'Dimension') {
        const nameLower = column.name.toLowerCase();
        const isDate =
          nameLower.includes('date') ||
          nameLower.includes('time') ||
          nameLower.includes('created') ||
          nameLower.includes('updated') ||
          nameLower.includes('joining') ||
          nameLower.includes('day') ||
          nameLower.includes('month') ||
          nameLower.includes('year') ||
          nameLower.includes('at');

        if (isDate) {
          // Date Filter logic
          if (startDate || endDate) {
            const rowDate = parseDateString(val);
            if (!rowDate) return false; // Exclude row if it cannot be parsed into a date

            if (startDate) {
              const start = new Date(startDate);
              start.setHours(0, 0, 0, 0);
              if (rowDate < start) return false;
            }
            if (endDate) {
              const end = new Date(endDate);
              end.setHours(23, 59, 59, 999);
              if (rowDate > end) return false;
            }
          }
        } else {
          // Dimension Checkbox / Boolean logic
          // Keep all rows if selectedValues is empty (filter is inactive / no checkmarks selected)
          if (selectedValues && selectedValues.length > 0) {
            if (!selectedValues.includes(val)) {
              return false;
            }
          }
        }
      } else if (column.type === 'Metric') {
        // Metric range filter logic
        const numVal = parseFloat(val);
        if (isNaN(numVal)) {
          // If the field isn't numeric but metric filters are set, filter it out
          if (minVal !== '' || maxVal !== '') {
            return false;
          }
        } else {
          if (minVal !== '') {
            const minNum = parseFloat(minVal);
            if (!isNaN(minNum) && numVal < minNum) return false;
          }
          if (maxVal !== '') {
            const maxNum = parseFloat(maxVal);
            if (!isNaN(maxNum) && numVal > maxNum) return false;
          }
        }
      }
    }
    return true;
  });
}
