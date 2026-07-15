/* src/components/dataset-profile/DataQuality/DataQuality.tsx */
'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Calendar, Layers, Info } from 'lucide-react';
import { DatasetProfileStats } from '../../../features/dataset-profile/profileCalculator';
import styles from './DataQuality.module.scss';
import clsx from 'clsx';

interface DataQualityProps {
  stats: DatasetProfileStats;
}

export const DataQuality: React.FC<DataQualityProps> = ({ stats }) => {
  // Determine rating style class
  const ratingStyle = clsx({
    [styles.ratingExcellent]: stats.qualityRating === 'Excellent',
    [styles.ratingGood]: stats.qualityRating === 'Good',
    [styles.ratingFair]: stats.qualityRating === 'Fair',
    [styles.ratingPoor]: stats.qualityRating === 'Poor',
  });

  const progressStyle = {
    width: `${stats.qualityScore}%`,
  };

  const progressColorClass = clsx(styles.progressBarFill, {
    [styles.progressGreen]: stats.qualityScore >= 90,
    [styles.progressYellow]: stats.qualityScore >= 75 && stats.qualityScore < 90,
    [styles.progressOrange]: stats.qualityScore >= 50 && stats.qualityScore < 75,
    [styles.progressRed]: stats.qualityScore < 50,
  });

  return (
    <div className={styles.card} id="dataset-data-quality-card">
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.cardTitle}>Data Quality Overview</h2>
          <p className={styles.cardSubtitle}>Summary of data quality issues detected in your dataset.</p>
        </div>
        <div className={styles.infoIconContainer} title="These checks evaluate cell nullness, mathematical consistency of metric ranges, and standard ISO date format compliance.">
          <Info size={16} className={styles.infoIcon} />
        </div>
      </div>

      {/* Grid of 4 Small Issue Metric Sub-cards */}
      <div className={styles.issuesGrid}>
        {/* Missing Values Card */}
        <div className={clsx(styles.issueCard, styles.issueRed)} id="quality-missing-values">
          <div className={styles.issueHeader}>
            <AlertCircle size={15} className={styles.issueIconRed} />
            <span className={styles.issueLabel}>Missing Values</span>
          </div>
          <div className={styles.issueValueGroup}>
            <span className={styles.issueValue}>{stats.missingValuesCount.toLocaleString()}</span>
            <span className={styles.issuePercent}>
              {(stats.missingValuesPercent * 100).toFixed(2)}% of total
            </span>
          </div>
        </div>

        {/* Invalid Numbers Card */}
        <div className={clsx(styles.issueCard, styles.issueOrange)} id="quality-invalid-numbers">
          <div className={styles.issueHeader}>
            <AlertTriangle size={15} className={styles.issueIconOrange} />
            <span className={styles.issueLabel}>Invalid Numbers</span>
          </div>
          <div className={styles.issueValueGroup}>
            <span className={styles.issueValue}>{stats.invalidNumbersCount.toLocaleString()}</span>
            <span className={styles.issuePercent}>
              {(stats.invalidNumbersPercent * 100).toFixed(2)}% of total
            </span>
          </div>
        </div>

        {/* Invalid Dates Card */}
        <div className={clsx(styles.issueCard, styles.issueOrange)} id="quality-invalid-dates">
          <div className={styles.issueHeader}>
            <Calendar size={15} className={styles.issueIconOrange} />
            <span className={styles.issueLabel}>Invalid Dates</span>
          </div>
          <div className={styles.issueValueGroup}>
            <span className={styles.issueValue}>{stats.invalidDatesCount.toLocaleString()}</span>
            <span className={styles.issuePercent}>
              {(stats.invalidDatesPercent * 100).toFixed(2)}% of total
            </span>
          </div>
        </div>

        {/* Empty Rows Removed Card */}
        <div className={clsx(styles.issueCard, styles.issueBlue)} id="quality-empty-rows">
          <div className={styles.issueHeader}>
            <Layers size={15} className={styles.issueIconBlue} />
            <span className={styles.issueLabel}>Empty Rows Removed</span>
          </div>
          <div className={styles.issueValueGroup}>
            <span className={styles.issueValue}>{stats.emptyRowsRemovedCount.toLocaleString()}</span>
            <span className={styles.issuePercent}>
              {(stats.emptyRowsRemovedPercent * 100).toFixed(2)}% of total
            </span>
          </div>
        </div>
      </div>

      {/* Score and Rating Slider section */}
      <div className={styles.scoreSection}>
        <div className={styles.scoreHeader}>
          <span className={styles.scoreLabel}>Overall Data Quality Score</span>
          <div className={styles.scoreValueGroup}>
            <span className={styles.scoreNum}>{stats.qualityScore}</span>
            <span className={styles.scoreMax}>/ 100</span>
            <span className={clsx(styles.ratingBadge, ratingStyle)}>{stats.qualityRating}</span>
          </div>
        </div>

        <div className={styles.progressBarBg}>
          <div className={progressColorClass} style={progressStyle} />
        </div>
      </div>
    </div>
  );
};
