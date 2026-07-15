/* src/features/analytics/transformChartData.ts */
import { AggregatedDataItem } from './aggregateData';

export interface PieChartItem {
  name: string;
  value: number;
  percentage: number;
}

/**
 * Transforms aggregated chart data specifically for Pie charts.
 * Slices are sorted descending, limited to top N categories, and remaining items are grouped into 'Other'.
 */
export function transformPieData(
  data: AggregatedDataItem[],
  xKey: string,
  yKey: string,
  maxSlices = 6
): PieChartItem[] {
  if (!data || data.length === 0) return [];

  // Map to structured name/value pairs
  const items = data.map((item) => {
    const rawVal = item[yKey];
    return {
      name: String(item[xKey]),
      value: typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal)) || 0,
    };
  });

  // Exclude slices that are <= 0 to prevent bad pie layouts
  const validItems = items.filter((it) => it.value > 0);

  // Sort descending by value to make the visual hierarchy clear
  validItems.sort((a, b) => b.value - a.value);

  if (validItems.length === 0) {
    return [];
  }

  const totalVal = validItems.reduce((sum, item) => sum + item.value, 0);

  let transformed: { name: string; value: number }[] = [];

  if (validItems.length <= maxSlices) {
    transformed = validItems;
  } else {
    // Keep top maxSlices - 1 slices, group the remainder under 'Other'
    const topItems = validItems.slice(0, maxSlices - 1);
    const otherItems = validItems.slice(maxSlices - 1);
    const otherSum = otherItems.reduce((sum, item) => sum + item.value, 0);

    transformed = [
      ...topItems,
      {
        name: 'Other',
        value: Math.round(otherSum * 100) / 100,
      },
    ];
  }

  return transformed.map((item) => {
    const rawPct = (item.value / totalVal) * 100;
    return {
      name: item.name,
      value: item.value,
      percentage: Math.round(rawPct * 10) / 10, // Round to 1 decimal place
    };
  });
}
