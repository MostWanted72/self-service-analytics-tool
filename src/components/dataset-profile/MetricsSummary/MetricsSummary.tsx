/* src/components/dataset-profile/MetricsSummary/MetricsSummary.tsx */
'use client';

import React, { useState } from 'react';
import { MetricSummaryItem } from '../../../features/dataset-profile/profileCalculator';
import styles from './MetricsSummary.module.scss';
import clsx from 'clsx';

interface MetricsSummaryProps {
  metrics: MetricSummaryItem[];
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ metrics }) => {
  const [expanded, setExpanded] = useState(false);

  const displayMetrics = expanded ? metrics : metrics.slice(0, 5);
  const hasMore = metrics.length > 5;

  return (
    <div className={styles.card} id="metrics-summary-card">
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Metrics Summary</h2>
        <p className={styles.cardSubtitle}>Overview of all detected metric (numeric) columns.</p>
      </div>

      {/* Modern Table Layout */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} id="metrics-summary-table">
          <thead>
            <tr>
              <th scope="col" className={styles.thName}>Column Name</th>
              <th scope="col" className={styles.thType}>Data Type</th>
              <th scope="col" className={styles.thMin}>Min</th>
              <th scope="col" className={styles.thMax}>Max</th>
              <th scope="col" className={styles.thAvg}>Average</th>
              <th scope="col" className={styles.thMissing}>Missing Values</th>
            </tr>
          </thead>
          <tbody>
            {displayMetrics.map((met) => (
              <tr key={met.name} className={styles.tr}>
                <td className={styles.tdName}>{met.name}</td>
                <td className={styles.tdType}>
                  <span className={styles.typeBadge}>{met.dataType}</span>
                </td>
                <td className={styles.tdMin}>{met.min}</td>
                <td className={styles.tdMax}>{met.max}</td>
                <td className={styles.tdAvg}>{met.average}</td>
                <td className={styles.tdMissing}>
                  <span className={clsx({ [styles.missingAlert]: met.missingCount > 0 })}>
                    {met.missingCount} ({ (met.missingPercent * 100).toFixed(0) }%)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View All Button */}
      {hasMore && (
        <button
          className={styles.toggleButton}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          id="toggle-all-metrics-btn"
        >
          {expanded ? 'View fewer metrics' : `View all ${metrics.length} metrics`} &rarr;
        </button>
      )}
    </div>
  );
};
