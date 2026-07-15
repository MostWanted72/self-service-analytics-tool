/* src/app/studio/preview/page.tsx */
'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Eye, Sparkles } from 'lucide-react';
import styles from '../page.module.scss';

export default function PreviewPage() {
  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id="studio-preview-workspace"
    >
      <div className={styles.heroSection}>
        <div className={styles.iconWrapper}>
          <Eye className={styles.heroIcon} size={32} />
        </div>
        <h1 className={styles.title}>Data Preview</h1>
        <p className={styles.description}>
          View the fully structured spreadsheet records, filter row entries, and inspect your raw tabular schema.
        </p>
      </div>

      <div className={styles.gridPlaceholder}>
        <div className={styles.placeholderCard}>
          <div className={styles.cardHeader}>
            <Sparkles size={18} className={styles.cardIcon} />
            <h3 className={styles.cardTitle}>Tabular Data Grid</h3>
          </div>
          <p className={styles.cardText}>
            This section will be implemented next.
          </p>
          <div className={styles.skeletonLineShort} />
          <div className={styles.skeletonLineLong} />
        </div>
      </div>
    </motion.div>
  );
}
