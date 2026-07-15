/* src/features/analytics/chartFactory.tsx */
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Column } from '../../types/dataset';
import { ChartType, AggregationType } from '../../store/chartStore';
import { AggregatedDataItem } from './aggregateData';
import { transformPieData, PieChartItem } from './transformChartData';
import { AlertCircle } from 'lucide-react';
import styles from './ChartFactory.module.scss';

// Palette of highly polished, modern professional dashboard colors
const CHART_PALETTE = [
  '#6366f1', // Indigo / Primary Accent
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
];

interface ChartFactoryProps {
  chartType: ChartType;
  data: AggregatedDataItem[];
  xAxis: Column;
  yAxis: Column;
  aggregation: AggregationType;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  yAxisName: string;
}

/**
 * Custom Tooltip for Bar and Line charts
 */
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label, yAxisName }) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.label}>Category</p>
        <p className={styles.name}>{label}</p>
        <div className={styles.divider} />
        <div className={styles.valueRow}>
          <span className={styles.valueLabel}>{yAxisName}</span>
          <span className={styles.value}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Custom Tooltip for Pie charts
 */
const CustomPieTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as PieChartItem;
    return (
      <div className={styles.customTooltip}>
        <p className={styles.label}>Dimension Segment</p>
        <p className={styles.name}>{data.name}</p>
        <div className={styles.divider} />
        <div className={styles.valueRow}>
          <span className={styles.valueLabel}>Value</span>
          <span className={styles.value}>{data.value.toLocaleString()}</span>
        </div>
        <div className={styles.percentageRow}>
          <span className={styles.pctLabel}>Proportion</span>
          <span className={styles.pctValue}>{data.percentage}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const ChartFactory: React.FC<ChartFactoryProps> = ({
  chartType,
  data,
  xAxis,
  yAxis,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  // Safety hydration hook to prevent SSR mismatch in Next.js
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const xKey = xAxis.name;
  const yKey = yAxis.name;

  // Transform data specifically for Pie Chart limits/slices
  const pieData = useMemo(() => {
    if (chartType !== 'pie') return [];
    return transformPieData(data, xKey, yKey, 6);
  }, [data, chartType, xKey, yKey]);

  if (!isMounted) {
    return (
      <div className={styles.chartContainer}>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Loading visualization...
        </div>
      </div>
    );
  }

  // Handle zero-rows or filtered empty state
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartContainer} id="chart-zero-rows-state">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <AlertCircle size={32} style={{ color: 'var(--color-text-muted)' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            No Data Found
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '300px' }}>
            No data matches the current filters. Try relaxing your filter conditions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer} id={`rendered-${chartType}-chart`}>
      <ResponsiveContainer width="100%" height={340}>
        {chartType === 'bar' ? (
          <BarChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey={xKey}
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              dy={8}
            />
            <YAxis
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip yAxisName={yKey} />} cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }} />
            <Bar
              dataKey={yKey}
              fill="var(--color-primary-accent)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        ) : chartType === 'line' ? (
          <LineChart data={data} margin={{ top: 12, right: 12, left: 12, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey={xKey}
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              dy={8}
            />
            <YAxis
              stroke="var(--color-text-secondary)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              dx={-8}
            />
            <Tooltip content={<CustomTooltip yAxisName={yKey} />} />
            <Line
              type="monotone"
              dataKey={yKey}
              stroke="var(--color-primary-accent)"
              strokeWidth={2}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
              dot={{ r: 4, stroke: '#ffffff', strokeWidth: 1.5, fill: 'var(--color-primary-accent)' }}
            />
          </LineChart>
        ) : (
          <PieChart margin={{ top: 12, right: 12, left: 12, bottom: 12 }}>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={2}
            >
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_PALETTE[index % CHART_PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        )}
      </ResponsiveContainer>

      {/* Render HTML custom legend below Pie Chart to keep label overflows perfectly managed */}
      {chartType === 'pie' && pieData.length > 0 && (
        <div className={styles.pieLegendContainer}>
          {pieData.map((item, index) => {
            const color = CHART_PALETTE[index % CHART_PALETTE.length];
            return (
              <div key={item.name} className={styles.pieLegendItem}>
                <span className={styles.colorDot} style={{ backgroundColor: color }} />
                <span className={styles.legendName} title={item.name}>
                  {item.name}
                </span>
                <span className={styles.legendValue}>
                  ({item.percentage}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
