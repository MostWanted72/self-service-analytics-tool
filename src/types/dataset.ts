/* src/types/dataset.ts */

export type ColumnType = 'Dimension' | 'Metric';

export interface Column {
  name: string;
  type: ColumnType;
  sampleValues: string[];
}

export interface Dataset {
  name: string;
  sizeInBytes: number;
  rowCount: number;
  columnCount: number;
  columns: Column[];
  headers: string[];
  data: Record<string, string>[];
}

export interface DatasetSummary {
  name: string;
  rowCount: number;
  columnCount: number;
  dimensionsCount: number;
  metricsCount: number;
  sizeFormatted: string;
}
