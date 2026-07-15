/* src/app/page.tsx */
'use client';

import React, { useEffect } from 'react';
import { Header } from '../components/layout/Header/Header';
import { Card } from '../components/ui/Card/Card';
import { UploadDropzone } from '../components/upload/UploadDropzone/UploadDropzone';
import { Zap, Shield, BarChart3 } from 'lucide-react';
import { resetAnalyticsSession } from '../store/resetSession';
import styles from './page.module.scss';

export default function Home() {
  useEffect(() => {
    resetAnalyticsSession();
  }, []);

  return (
    <div className={styles.wrapper} id="landing-page-wrapper">
      <Header />

      <main className={styles.mainContent} id="landing-page-main">
        {/* Subtle decorative background shapes */}
        <div className={styles.bgDecorLeft} aria-hidden="true">
          <div className={styles.decorBar} style={{ height: '140px' }} />
          <div className={styles.decorBar} style={{ height: '200px' }} />
          <div className={styles.decorBar} style={{ height: '100px' }} />
          <div className={styles.decorDotGrid}>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={styles.decorDot} />
            ))}
          </div>
        </div>

        <div className={styles.bgDecorRight} aria-hidden="true">
          <div className={styles.decorPie} />
          <div className={styles.decorDotGridRight}>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={styles.decorDot} />
            ))}
          </div>
        </div>

        <div className="container" id="hero-section-container">
          {/* Hero Header */}
          <div className={styles.heroSection} id="landing-hero">
            <h1 className={styles.headline}>
              Turn CSV files into <br />
              <span className={styles.headlineHighlight}>meaningful visual insights</span>
            </h1>
            <p className={styles.subheading}>
              Upload your CSV file and start exploring your data in seconds.
            </p>
          </div>

          {/* Upload Main Card */}
          <div className={styles.uploadCardContainer} id="upload-card-wrapper">
            <Card className={styles.uploadCard} animate={true} id="upload-card">
              <UploadDropzone />
            </Card>
          </div>

          {/* Features Section */}
          <div className={styles.featuresSection} id="landing-features-grid">
            <div className={styles.featureItem} id="feature-instant-analysis">
              <div className={styles.featureIconContainer} style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                <Zap size={20} />
              </div>
              <div className={styles.featureTextContent}>
                <h3 className={styles.featureTitle}>Instant Analysis</h3>
                <p className={styles.featureDesc}>Get insights from your data in seconds.</p>
              </div>
            </div>

            <div className={styles.featureItem} id="feature-100-private">
              <div className={styles.featureIconContainer} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <Shield size={20} />
              </div>
              <div className={styles.featureTextContent}>
                <h3 className={styles.featureTitle}>100% Private</h3>
                <p className={styles.featureDesc}>Your data never leaves your browser.</p>
              </div>
            </div>

            <div className={styles.featureItem} id="feature-easy-to-use">
              <div className={styles.featureIconContainer} style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                <BarChart3 size={20} />
              </div>
              <div className={styles.featureTextContent}>
                <h3 className={styles.featureTitle}>Easy to Use</h3>
                <p className={styles.featureDesc}>No SQL or coding required.</p>
              </div>
            </div>
          </div>

          {/* Footer Statement */}
          <footer className={styles.footerStatement} id="landing-footer-statement">
            <p>
              Insight Studio is a self-service analytics tool that helps users understand and visualize CSV datasets.
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
