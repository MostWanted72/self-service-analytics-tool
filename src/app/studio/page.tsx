/* src/app/studio/page.tsx */
'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, Info } from 'lucide-react';
import { useDatasetStore } from '../../store/datasetStore';
import {
  calculateDatasetProfileStats,
  calculateDimensionsSummary,
  calculateMetricsSummary,
  generateInsights,
} from '../../features/dataset-profile/profileCalculator';
import { OverviewCards } from '../../components/dataset-profile/OverviewCards/OverviewCards';
import { DataQuality } from '../../components/dataset-profile/DataQuality/DataQuality';
import { DatasetInsights } from '../../components/dataset-profile/DatasetInsights/DatasetInsights';
import { DimensionsSummary } from '../../components/dataset-profile/DimensionsSummary/DimensionsSummary';
import { MetricsSummary } from '../../components/dataset-profile/MetricsSummary/MetricsSummary';
import styles from './page.module.scss';

export default function DatasetProfilePage() {
  const { dataset } = useDatasetStore();

  // Safeguard: layout handles empty state, but let's prevent errors during transitions
  const statsResult = useMemo(() => {
    if (!dataset) return null;
    const stats = calculateDatasetProfileStats(dataset);
    const dimensions = calculateDimensionsSummary(dataset);
    const metrics = calculateMetricsSummary(dataset);
    const insights = generateInsights(dataset, stats, dimensions, metrics);

    return { stats, dimensions, metrics, insights };
  }, [dataset]);

  if (!dataset || !statsResult) {
    return null;
  }

  const { stats, dimensions, metrics, insights } = statsResult;

  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id="dataset-profile-workspace"
    >
      {/* Hero & File Meta Header Section */}
      <div className={styles.heroSection} id="dataset-profile-hero">
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Dataset Profile</h1>
          <p className={styles.description}>
            Understand the structure, quality, and characteristics of your dataset.
          </p>
        </div>

        {/* Right Side: Active File Information Card */}
        <div className={styles.fileMetaCard} id="active-dataset-meta-badge">
          <div className={styles.fileIconWrapper}>
            <FileSpreadsheet className={styles.fileIcon} size={20} />
            <span className={styles.fileTypeBadge}>CSV</span>
          </div>
          <div className={styles.fileDetails}>
            <span className={styles.fileName} title={dataset.name}>
              {dataset.name}
            </span>
            <span className={styles.fileSubText}>
              Uploaded just now • {stats.sizeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Section 1: Overview Cards */}
      <div className={styles.section} id="section-overview-cards">
        <OverviewCards stats={stats} />
      </div>

      {/* Section 2 & 3: Data Quality Overview & Dataset Insights */}
      <div className={styles.insightsRow} id="section-quality-and-insights">
        <div className={styles.columnLeft}>
          <DataQuality stats={stats} />
        </div>
        <div className={styles.columnRight}>
          <DatasetInsights insights={insights} />
        </div>
      </div>

      {/* Section 4: Dimensions Summary */}
      <div className={styles.section} id="section-dimensions-summary">
        <DimensionsSummary dimensions={dimensions} />
      </div>

      {/* Section 5: Metrics Summary */}
      <div className={styles.section} id="section-metrics-summary">
        <MetricsSummary metrics={metrics} />
      </div>

      {/* Bottom Alert Message */}
      <div className={styles.bottomAlert} id="dataset-profile-footer-info">
        <Info size={16} className={styles.alertIcon} />
        <p className={styles.alertText}>
          These statistics are computed from a sample of your data for quick analysis. Full analysis is performed in the background.
        </p>
      </div>
    </motion.div>
  );
}
