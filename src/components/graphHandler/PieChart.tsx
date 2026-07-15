import { useChartStore } from "@/store/chartStore";
import { useEffect, useState } from "react";
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

interface DataRow {
    [key: string]: string | number | undefined;
}

interface PieChartProps {
    dataset: DataRow[];
}

interface PieItem {
    name: string;
    value: number;
}

interface GroupMetrics {
    sum: number;
    count: number;
    min: number;
    max: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658"];

const PieChart = ({ dataset }: PieChartProps) => {
    const [pieData, setPieData] = useState<PieItem[]>([]);
    const { xAxis, yAxis, aggregation } = useChartStore() as {
        xAxis: any;
        yAxis: any;
        aggregation: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX';
    };

    useEffect(() => {
        if (!xAxis?.name || !yAxis?.name || !dataset.length) return;

        const groupedMap: Record<string, GroupMetrics> = {};

        dataset.forEach((row) => {
            const rawX = row[xAxis.name];
            const rawY = Number(row[yAxis.name]);

            const xValue = rawX ? String(rawX) : "Unknown";
            const yValue = !isNaN(rawY) ? rawY : 0;

            if (!groupedMap[xValue]) {
                groupedMap[xValue] = {
                    sum: 0,
                    count: 0,
                    min: yValue,
                    max: yValue
                };
            }

            const current = groupedMap[xValue];
            current.sum += yValue;
            current.count += 1;
            if (yValue < current.min) current.min = yValue;
            if (yValue > current.max) current.max = yValue;
        });

        let totalChartValue = 0;
        const finalizedGroups = Object.entries(groupedMap).map(([name, metrics]) => {
            let finalizedValue = 0;

            switch (aggregation) {
                case "AVG":
                    finalizedValue = metrics.count > 0 ? metrics.sum / metrics.count : 0;
                    break;
                case "COUNT":
                    finalizedValue = metrics.count;
                    break;
                case "MIN":
                    finalizedValue = metrics.min;
                    break;
                case "MAX":
                    finalizedValue = metrics.max;
                    break;
                case "SUM":
                default:
                    finalizedValue = metrics.sum;
                    break;
            }

            totalChartValue += finalizedValue;
            return { name, rawValue: finalizedValue };
        });

        // 3. Compute the relative distribution percentage (2 decimal places)
        const processedData: PieItem[] = finalizedGroups
            .map(({ name, rawValue }) => {
                const percentage = totalChartValue > 0
                    ? Number(((rawValue / totalChartValue) * 100).toFixed(2))
                    : 0;

                return {
                    name,
                    value: percentage
                };
            })
            .filter(item => item.value > 0);

        setPieData(processedData);
    }, [dataset, xAxis?.name, yAxis?.name, aggregation]);

    return (
        <div style={{ width: "100%", height: 350, minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                    <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {pieData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Share"]} />
                    <Legend verticalAlign="bottom" height={36} />
                </RechartsPie>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChart;