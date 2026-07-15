/* src/store/chartStore.ts */
import { create } from 'zustand';
import { Column } from '../types/dataset';

export type ChartType = 'bar' | 'line' | 'pie';
export type AggregationType = 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';

export interface FilterState {
  column: Column;
  selectedValues: string[]; // For dimension / boolean: list of selected values
  startDate: string | null;  // For date filters: "YYYY-MM-DD" or null
  endDate: string | null;    // For date filters: "YYYY-MM-DD" or null
  minVal: string;            // For metric filters (store as string to support raw input typing easily)
  maxVal: string;            // For metric filters
  isCollapsed: boolean;
}

interface ChartState {
  chartType: ChartType;
  xAxis: Column | null;
  yAxis: Column | null;
  aggregation: AggregationType;
  filters: FilterState[];

  // Actions
  setChartType: (type: ChartType) => void;
  setXAxis: (column: Column | null) => void;
  setYAxis: (column: Column | null) => void;
  setAggregation: (agg: AggregationType) => void;
  addFilter: (column: Column) => void;
  removeFilter: (columnName: string) => void;
  updateFilter: (columnName: string, updates: Partial<Omit<FilterState, 'column'>>) => void;
  clearFilterValues: (columnName: string) => void;
  resetChart: () => void;
}

export const useChartStore = create<ChartState>((set) => ({
  chartType: 'bar',
  xAxis: null,
  yAxis: null,
  aggregation: 'SUM',
  filters: [],

  setChartType: (type) => set({ chartType: type }),
  setXAxis: (column) => set({ xAxis: column }),
  setYAxis: (column) => set({ yAxis: column }),
  setAggregation: (agg) => set({ aggregation: agg }),
  addFilter: (column) =>
    set((state) => {
      // Avoid duplicate filters
      if (state.filters.some((f) => f.column.name === column.name)) {
        return state;
      }
      const newFilter: FilterState = {
        column,
        selectedValues: [],
        startDate: null,
        endDate: null,
        minVal: '',
        maxVal: '',
        isCollapsed: false,
      };
      return { filters: [...state.filters, newFilter] };
    }),
  removeFilter: (columnName) =>
    set((state) => ({
      filters: state.filters.filter((f) => f.column.name !== columnName),
    })),
  updateFilter: (columnName, updates) =>
    set((state) => ({
      filters: state.filters.map((f) =>
        f.column.name === columnName ? { ...f, ...updates } : f
      ),
    })),
  clearFilterValues: (columnName) =>
    set((state) => ({
      filters: state.filters.map((f) =>
        f.column.name === columnName
          ? {
              ...f,
              selectedValues: [],
              startDate: null,
              endDate: null,
              minVal: '',
              maxVal: '',
            }
          : f
      ),
    })),
  resetChart: () =>
    set({
      chartType: 'bar',
      xAxis: null,
      yAxis: null,
      aggregation: 'SUM',
      filters: [],
    }),
}));
