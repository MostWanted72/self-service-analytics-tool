/* src/store/chartStore.ts */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Column } from "../types/dataset";

export type ChartType = "bar" | "line" | "pie";
export type AggregationType = "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";

export interface FilterState {
  column: Column;
  selectedValues: string[];
  startDate: string | null;
  endDate: string | null;
  minVal: string;
  maxVal: string;
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
  updateFilter: (
    columnName: string,
    updates: Partial<Omit<FilterState, "column">>
  ) => void;
  clearFilterValues: (columnName: string) => void;
  resetChart: () => void;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      chartType: "bar",
      xAxis: null,
      yAxis: null,
      aggregation: "SUM",
      filters: [],

      setChartType: (type) =>
        set({
          chartType: type,
        }),

      setXAxis: (column) =>
        set({
          xAxis: column,
        }),

      setYAxis: (column) =>
        set({
          yAxis: column,
        }),

      setAggregation: (agg) =>
        set({
          aggregation: agg,
        }),

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
            minVal: "",
            maxVal: "",
            isCollapsed: false,
          };

          return {
            filters: [...state.filters, newFilter],
          };
        }),

      removeFilter: (columnName) =>
        set((state) => ({
          filters: state.filters.filter(
            (f) => f.column.name !== columnName
          ),
        })),

      updateFilter: (columnName, updates) =>
        set((state) => ({
          filters: state.filters.map((f) =>
            f.column.name === columnName
              ? { ...f, ...updates }
              : f
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
                  minVal: "",
                  maxVal: "",
                  endDate: null,
                }
              : f
          ),
        })),

      resetChart: () =>
        set({
          chartType: "bar",
          xAxis: null,
          yAxis: null,
          aggregation: "SUM",
          filters: [],
        }),
    }),
    {
      name: "insight-studio-chart",

      // Persist the complete chart state
      partialize: (state) => ({
        chartType: state.chartType,
        xAxis: state.xAxis,
        yAxis: state.yAxis,
        aggregation: state.aggregation,
        filters: state.filters,
      }),
    }
  )
);