/* src/components/dataset-profile/OverviewCards/OverviewCards.tsx */
'use client';

import React from 'react';
import { Database, LayoutGrid, Hash, Binary, HardDrive } from 'lucide-react';
import { DatasetProfileStats } from '../../../features/dataset-profile/profileCalculator';
import styles from './OverviewCards.module.scss';

interface OverviewCardsProps {
  stats: DatasetProfileStats;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'stat-rows',
      icon: <Database size={18} className={styles.iconRows} />,
      label: 'Rows',
      value: stats.rowCount.toLocaleString(),
      subtitle: 'Total records',
    },
    {
      id: 'stat-columns',
      icon: <LayoutGrid size={18} className={styles.iconColumns} />,
      label: 'Columns',
      value: stats.columnCount.toLocaleString(),
      subtitle: 'Total fields',
    },
    {
      id: 'stat-dimensions',
      icon: <Hash size={18} className={styles.iconDimensions} />,
      label: 'Dimensions',
      value: stats.dimensionsCount.toLocaleString(),
      subtitle: 'Categorical columns',
    },
    {
      id: 'stat-metrics',
      icon: <Binary size={18} className={styles.iconMetrics} />,
      label: 'Metrics',
      value: stats.metricsCount.toLocaleString(),
      subtitle: 'Numeric columns',
    },
    {
      id: 'stat-filesize',
      icon: <HardDrive size={18} className={styles.iconFileSize} />,
      label: 'File Size',
      value: stats.sizeFormatted,
      subtitle: 'Raw disk size',
    },
  ];

  return (
    <div className={styles.grid} id="dataset-overview-stats-grid">
      {cards.map((card) => (
        <div key={card.id} className={styles.card} id={card.id}>
          <div className={styles.header}>
            <div className={styles.iconContainer}>{card.icon}</div>
            <span className={styles.label}>{card.label}</span>
          </div>
          <div className={styles.valueGroup}>
            <span className={styles.value}>{card.value}</span>
            <span className={styles.subtitle}>{card.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
