/* src/components/layout/Header/Header.tsx */
import React from 'react';
import { BarChart3, ShieldCheck } from 'lucide-react';
import styles from './Header.module.scss';

export const Header: React.FC = () => {
  return (
    <header className={styles.header} id="main-header">
      <div className={styles.container}>
        <div className={styles.logoGroup} id="header-logo-group">
          <div className={styles.logoIconContainer}>
            <BarChart3 className={styles.logoIcon} aria-hidden="true" />
          </div>
          <span className={styles.logoText}>Insight Studio</span>
        </div>
        
        <div className={styles.privacyMessage} id="header-privacy-group">
          <ShieldCheck className={styles.privacyIcon} aria-hidden="true" />
          <span>Your data stays in your browser.</span>
        </div>
      </div>
    </header>
  );
};
