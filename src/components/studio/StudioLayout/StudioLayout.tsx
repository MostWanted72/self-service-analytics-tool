/* src/components/studio/StudioLayout/StudioLayout.tsx */
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { StudioHeader } from '../StudioHeader/StudioHeader';
import { StudioTabs } from '../StudioTabs/StudioTabs';
import { Button } from '../../ui/Button/Button';
import { useDatasetStore } from '../../../store/datasetStore';
import styles from './StudioLayout.module.scss';

interface StudioLayoutProps {
  children: React.ReactNode;
}

export const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
  const router = useRouter();
  const { dataset } = useDatasetStore();

  return (
    <div className={styles.wrapper} id="studio-layout-wrapper">
      {/* 1. Header Area */}
      <StudioHeader />

      {/* 2. Tabs Navigation Area */}
      <StudioTabs />

      {/* 3. Main Content Area */}
      <main className={styles.mainContent} id="studio-main-content">
        <div className={styles.container}>
          {dataset ? (
            /* Render page content when dataset is active */
            children
          ) : (
            /* Render fallback/empty-state if no dataset in memory */
            <div className={styles.fallbackContainer} id="studio-no-dataset-fallback">
              <div className={styles.fallbackCard}>
                <div className={styles.errorIconContainer}>
                  <AlertCircle className={styles.errorIcon} size={28} />
                </div>
                <h2 className={styles.fallbackTitle}>No dataset loaded</h2>
                <p className={styles.fallbackText}>
                  Upload a CSV file to begin exploring your data.
                </p>
                <div className={styles.fallbackActions}>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<ArrowLeft size={16} />}
                    onClick={() => {
                      router.push('/');
                    }}
                    id="fallback-upload-btn"
                  >
                    Return to Upload
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
