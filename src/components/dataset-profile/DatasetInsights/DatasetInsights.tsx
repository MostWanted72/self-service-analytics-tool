/* src/components/dataset-profile/DatasetInsights/DatasetInsights.tsx */
'use client';

import React, { useState } from 'react';
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { DatasetInsightItem } from '../../../features/dataset-profile/profileCalculator';
import styles from './DatasetInsights.module.scss';
import clsx from 'clsx';

interface DatasetInsightsProps {
  insights: DatasetInsightItem[];
}

export const DatasetInsights: React.FC<DatasetInsightsProps> = ({ insights }) => {
  const [expanded, setExpanded] = useState(false);

  const displayInsights = expanded ? insights : insights.slice(0, 4);
  const hasMore = insights.length > 4;

  const renderIcon = (type: 'success' | 'info' | 'warning') => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={16} className={styles.iconSuccess} />;
      case 'info':
        return <Info size={16} className={styles.iconInfo} />;
      case 'warning':
        return <AlertTriangle size={16} className={styles.iconWarning} />;
      default:
        return <Info size={16} className={styles.iconInfo} />;
    }
  };

  return (
    <div className={styles.card} id="dataset-insights-card">
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Dataset Insights</h2>
        <p className={styles.cardSubtitle}>Automatic insights about your dataset.</p>
      </div>

      {/* List of Insight Items */}
      <div className={styles.insightsList}>
        {displayInsights.map((insight, idx) => (
          <div key={idx} className={styles.insightItem} id={`insight-item-${idx}`}>
            <div className={styles.iconWrapper}>{renderIcon(insight.type)}</div>
            <p className={styles.message}>{insight.message}</p>
          </div>
        ))}
      </div>

      {/* Toggle View Link */}
      {hasMore && (
        <button
          className={styles.toggleButton}
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          id="toggle-all-insights-btn"
        >
          {expanded ? 'View fewer insights' : `View all ${insights.length} insights`} &rarr;
        </button>
      )}
    </div>
  );
};
