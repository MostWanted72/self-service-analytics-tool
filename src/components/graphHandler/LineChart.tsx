import { useChartStore } from "@/store/chartStore";
import { useEffect, useState } from "react";
import {
    LineChart as RechartsLine,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label
} from "recharts";

interface DataRow {
    [key: string]: string | number | undefined;
}

interface LineChartProps {
    dataset: DataRow[];
}

interface LineItem {
    name: string;
    value: number;
}

interface GroupMetrics {
    sum: number;
    count: number;
    min: number;
    max: number;
}

const LineChart = ({ dataset }: LineChartProps) => {
    const [lineData, setLineData] = useState<LineItem[]>([]);
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

        const processedData: LineItem[] = Object.entries(groupedMap).map(([name, metrics]) => {
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

            return {
                name,
                value: Number(finalizedValue.toFixed(2))
            };
        });

        processedData.sort((a, b) => {
            const dateA = new Date(a.name).getTime();
            const dateB = new Date(b.name).getTime();
            if (!isNaN(dateA) && !isNaN(dateB)) {
                return dateA - dateB;
            }
            return a.name.localeCompare(b.name);
        });

        setLineData(processedData);
    }, [dataset, xAxis?.name, yAxis?.name, aggregation]);

    return (
        <div style={{ width: "100%", height: 380, minWidth: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsLine
                    data={lineData}
                    margin={{ top: 20, right: 30, left: 30, bottom: 25 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        // scale="point" separates the first dot from the chart wall
                        scale="point" 
                        padding={{ left: 30, right: 30 }}
                    >
                        <Label 
                            value={xAxis?.name} 
                            offset={-15} 
                            position="insideBottom" 
                            style={{ textAnchor: 'middle', fontSize: 13, fontWeight: 500, fill: '#666' }}
                        />
                    </XAxis>
                    <YAxis 
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    >
                        <Label 
                            value={yAxis?.name} 
                            angle={-90} 
                            position="insideLeft" 
                            offset={-10}
                            style={{ textAnchor: 'middle', fontSize: 13, fontWeight: 500, fill: '#666' }}
                        />
                    </YAxis>
                    <Tooltip 
                        formatter={(value: number) => [value, yAxis?.name || "Value"]} 
                    />
                    <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        activeDot={{ r: 6 }}
                        dot={{ r: 4 }}
                    />
                </RechartsLine>
            </ResponsiveContainer>
        </div>
    );
};

export default LineChart;