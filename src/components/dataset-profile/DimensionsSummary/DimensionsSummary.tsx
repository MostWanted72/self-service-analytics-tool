/* src/components/dataset-profile/DimensionsSummary/DimensionsSummary.tsx */
'use client';

import React, { useState } from 'react';
import { DimensionSummaryItem } from '../../../features/dataset-profile/profileCalculator';
import styles from './DimensionsSummary.module.scss';
import clsx from 'clsx';

interface DimensionsSummaryProps {
  dimensions: DimensionSummaryItem[];
}

export const DimensionsSummary: React.FC<DimensionsSummaryProps> = ({ dimensions }) => {
  const [expanded, setExpanded] = useState(false);

  const displayDimensions = expanded ? dimensions : dimensions.slice(0, 5);
  const hasMore = dimensions.length > 5;

  return (
    <div className={styles.card} id="dimensions-summary-card">
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Dimensions Summary</h2>
        <p className={styles.cardSubtitle}>Overview of all detected dimension (categorical) columns.</p>
      </div>

      {/* Modern Table Layout */}
      <div className={styles.tableWrapper}>
        <table className={styles.table} id="dimensions-summary-table">
          <thead>
            <tr>
              <th scope="col" className={styles.thName}>Column Name</th>
              <th scope="col" className={styles.thType}>Data Type</th>
              <th scope="col" className={styles.thUnique}>Unique Values</th>
              <th scope="col" className={styles.thCommon}>Most Common Value</th>
              <th scope="col" className={styles.thMissing}>Missing Values</th>
            </tr>
          </thead>
          <tbody>
            {displayDimensions.map((dim) => (
              <tr key={dim.name} className={styles.tr}>
                <td className={styles.tdName}>{dim.name}</td>
                <td className={styles.tdType}>
                  <span className={styles.typeBadge}>{dim.dataType}</span>
                </td>
                <td className={styles.tdUnique}>{dim.uniqueCount.toLocaleString()}</td>
                <td className={styles.tdCommon} title={dim.mostCommonValue}>
                  {dim.mostCommonValue}
                </td>
                <td className={styles.tdMissing}>
                  <span className={clsx({ [styles.missingAlert]: dim.missingCount > 0 })}>
                    {dim.missingCount} ({ (dim.missingPercent * 100).toFixed(0) }%)
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
          id="toggle-all-dimensions-btn"
        >
          {expanded ? 'View fewer dimensions' : `View all ${dimensions.length} dimensions`} &rarr;
        </button>
      )}
    </div>
  );
};
