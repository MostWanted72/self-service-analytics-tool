/* src/components/studio/StudioHeader/StudioHeader.tsx */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Upload, RotateCcw } from 'lucide-react';
import { Button } from '../../ui/Button/Button';
import { useChartStore } from '../../../store/chartStore';
import styles from './StudioHeader.module.scss';

export const StudioHeader: React.FC = () => {
  const router = useRouter();

  const handleUploadNew = () => {
    router.push('/');
  };

  const handleResetAnalysis = () => {
    useChartStore.getState().resetChart();
  };

  return (
    <header className={styles.header} id="studio-main-header">
      <div className={styles.container}>
        {/* Left Side: Brand Logo Group */}
        <div className={styles.brandGroup} id="studio-header-brand">
          <div className={styles.logoContainer}>
            <BarChart3 className={styles.logoIcon} aria-hidden="true" size={18} />
          </div>
          <div className={styles.brandText}>
            <span className={styles.productName}>Insight Studio</span>
          </div>
        </div>

        {/* Right Side: Primary and Secondary Actions */}
        <div className={styles.actionGroup} id="studio-header-actions">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RotateCcw size={14} />}
            onClick={handleResetAnalysis}
            className={styles.resetButton}
            id="studio-reset-analysis-btn"
          >
            Reset Analysis
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Upload size={14} />}
            onClick={handleUploadNew}
            className={styles.uploadButton}
            id="studio-upload-new-btn"
          >
            Upload New Dataset
          </Button>
        </div>
      </div>
    </header>
  );
};
