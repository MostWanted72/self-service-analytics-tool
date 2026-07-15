/* src/app/insights/page.tsx */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDatasetStore } from '../../store/datasetStore';
import { Header } from '../../components/layout/Header/Header';
import { Button } from '../../components/ui/Button/Button';
import { ArrowLeft, Sparkles, Database, FileSpreadsheet, Hash, Layers } from 'lucide-react';
import { motion } from 'motion/react';
import styles from './page.module.scss';

export default function InsightsPage() {
  const router = useRouter();
  const { dataset, getSummary, reset } = useDatasetStore();
  const summary = getSummary();

  const handleBackToUpload = () => {
    reset();
    router.push('/');
  };

  return (
    <div className={styles.wrapper} id="insights-page-wrapper">
      <Header />

      <main className={styles.mainContent} id="insights-page-main">
        {/* Subtle decorative background shapes */}
        <div className={styles.bgDecorLeft} aria-hidden="true">
          <div className={styles.decorBar} style={{ height: '220px' }} />
          <div className={styles.decorBar} style={{ height: '140px' }} />
          <div className={styles.decorBar} style={{ height: '180px' }} />
        </div>

        <div className={styles.bgDecorRight} aria-hidden="true">
          <div className={styles.decorPie} />
        </div>

        <div className="container" id="insights-container">
          {!dataset || !summary ? (
            <div className={styles.fallbackContainer} id="insights-fallback">
              <div className={styles.fallbackTitle}>No Dataset Loaded</div>
              <p className={styles.fallbackText}>
                Please upload a CSV dataset on the home page first to view profile insights.
              </p>
              <Button
                variant="primary"
                size="md"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => router.push('/')}
                id="back-to-upload-btn-fallback"
              >
                Go to Upload
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              id="insights-content-wrapper"
            >
              {/* Header Navigation */}
              <div className={styles.topNav} id="insights-top-nav">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowLeft size={14} />}
                  onClick={handleBackToUpload}
                  id="back-to-upload-btn"
                >
                  Back to Upload
                </Button>
                <div className={styles.pageTitle}>Dataset Workspace</div>
              </div>

              {/* Main Bento Grid */}
              <div className={styles.grid} id="insights-bento-grid">
                
                {/* Left Section: Summary Metadata */}
                <div className={styles.summaryCard} id="insights-summary-card">
                  <div className={styles.successBadge}>
                    <span className={styles.badgeDot} />
                    <span>Dataset successfully loaded</span>
                  </div>
                  
                  <div className={styles.fileHeader}>
                    <h2 className={styles.fileName}>{summary.name}</h2>
                  </div>

                  <div className={styles.statsList}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Total Rows</span>
                      <span className={styles.statValue}>{summary.rowCount.toLocaleString()}</span>
                    </div>
                    
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Total Columns</span>
                      <span className={styles.statValue}>{summary.columnCount}</span>
                    </div>

                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Dimensions</span>
                      <span className={styles.statValue}>{summary.dimensionsCount}</span>
                    </div>

                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Metrics</span>
                      <span className={styles.statValue}>{summary.metricsCount}</span>
                    </div>

                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>File Size</span>
                      <span className={styles.statValue}>{summary.sizeFormatted}</span>
                    </div>
                  </div>
                </div>

                {/* Right Section: Auto-classified Columns List */}
                <div className={styles.columnsCard} id="insights-columns-card">
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Column Schema Profile</h3>
                    <p className={styles.cardSub}>
                      Every column is automatically audited and classified based on values detected across sample rows.
                    </p>
                  </div>

                  <div className={styles.columnsList} id="insights-columns-list">
                    {dataset.columns.map((column, index) => (
                      <div
                        key={column.name}
                        className={styles.columnItem}
                        id={`column-item-${index}`}
                      >
                        <div className={styles.colMeta}>
                          <span className={styles.colName}>{column.name}</span>
                          <div className={styles.badgeContainer}>
                            <span
                              className={`${styles.typeBadge} ${
                                column.type === 'Dimension'
                                  ? styles.dimensionBadge
                                  : styles.metricBadge
                              }`}
                            >
                              {column.type === 'Dimension' ? (
                                <span className="flex items-center gap-1">
                                  <Database size={10} className="inline mr-1" />
                                  Dimension
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Hash size={10} className="inline mr-1" />
                                  Metric
                                </span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Sample preview chips */}
                        {column.sampleValues.length > 0 && (
                          <div className={styles.colSamples}>
                            <div className={styles.sampleLabel}>Sample Values</div>
                            <div className={styles.samples}>
                              {column.sampleValues.map((val, sampleIdx) => (
                                <span
                                  key={sampleIdx}
                                  className={styles.samplePill}
                                  title={val}
                                >
                                  {val === '' ? '(empty)' : val}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Lower Section: Roadmap Teaser Box */}
              <div className={styles.teaserCard} id="insights-teaser-card">
                <Sparkles className={styles.teaserIcon} size={32} />
                <h4 className={styles.teaserTitle}>More features coming next...</h4>
                <p className={styles.teaserDesc}>
                  Your dataset is parsed and mapped in-memory! Soon you will be able to perform statistical aggregations, apply powerful filters, and create fully interactive charts using the Dataset Profile and Explore workspaces.
                </p>
              </div>

            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
