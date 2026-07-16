import { useChartStore } from "@/store/chartStore";
import { useDatasetStore } from "@/store/datasetStore";
import { useMemo } from "react";
import PieChart from "./PieChart";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import styles from './GraphHandler.module.scss'

interface ColumnInfo {
    name: string;
    type: "Metric" | "Dimension";
    sampleValues: string[];
}

interface DataRow {
    [key: string]: string | number | undefined;
}

interface Dataset {
    name: string;
    sizeInBytes: number;
    rowCount: number;
    columnCount: number;
    columns: ColumnInfo[];
    data: DataRow[];
}

interface FilterObject {
    column: ColumnInfo;
    startDate?: string | null;
    endDate?: string | null;
    isCollapsed: boolean;
    maxVal: string | null;
    minVal: string | null;
    selectedValues: string[];
}

// Main handler that applies all active filter blocks together
const processDatasetFilters = (
    dataset: Dataset | null | undefined,
    filters: FilterObject[] | null | undefined
): DataRow[] => {
    if (!dataset?.data) return [];
    if (!filters || filters.length === 0) return dataset.data;

    return dataset.data.filter((row) => {
        return filters.every((filter) => {
            const columnName = filter.column?.name;
            if (!columnName) return true;

            const cellValue = row[columnName];

            // 1. DATE RANGE FILTER
            if (filter.startDate && filter.endDate) {
                if (typeof cellValue !== "string") return false;
                const rowDate = new Date(cellValue);
                const start = new Date(filter.startDate);
                const end = new Date(filter.endDate);
                if (isNaN(rowDate.getTime())) return false;
                return rowDate >= start && rowDate <= end;
            }

            // 2. NUMERIC RANGE FILTER (minVal or maxVal exist and are not empty strings)
            const hasMin = filter.minVal !== null && filter.minVal !== "";
            const hasMax = filter.maxVal !== null && filter.maxVal !== "";

            if (hasMin || hasMax) {
                if (cellValue === undefined || cellValue === null || cellValue === "") return false;
                const numericValue = Number(cellValue);
                if (isNaN(numericValue)) return false;

                if (hasMin && numericValue < Number(filter.minVal)) return false;
                if (hasMax && numericValue > Number(filter.maxVal)) return false;
                return true;
            }

            // 3. CHECKBOX / MULTI-SELECT FILTER
            if (filter.selectedValues && filter.selectedValues.length > 0) {
                if (cellValue === undefined || cellValue === null) return false;
                // Standardize comparison to strings to cleanly capture categorical matches
                return filter.selectedValues.map(String).includes(String(cellValue));
            }

            // Fallback if the individual filter block is empty/inactive
            return true;
        });
    });
};

const GraphHandler = () => {
    const { dataset } = useDatasetStore() as { dataset: Dataset | null };
    const { chartType, filters } = useChartStore() as {
        chartType: any;

        filters: FilterObject[];
    };

    const filteredData = useMemo(
        () => processDatasetFilters(dataset, filters),
        [dataset, filters]
    );

    if (filteredData.length === 0) {
        return (
            <div className={styles.emptyChartState}>
                <h3>No data to display</h3>
                <p>No records match the current filters. Try adjusting or clearing your filters.</p>
            </div>
        );
    }

    switch (chartType) {
        case "pie":
            return <PieChart dataset={filteredData} />;
        case "bar":
            return <BarChart dataset={filteredData} />;
        case "line":
            return <LineChart dataset={filteredData} />;
    }

    return (
        <div>
            <h3>Graph Handler</h3>
            <p>Rows matching date filter: {filteredData.length}</p>
        </div>
    );
};

export default GraphHandler;