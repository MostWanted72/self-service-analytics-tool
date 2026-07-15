/* src/components/studio/StudioTabs/StudioTabs.tsx */
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './StudioTabs.module.scss';

interface TabItem {
  name: string;
  href: string;
}

export const StudioTabs: React.FC = () => {
  const pathname = usePathname();

  const tabs: TabItem[] = [
    { name: 'Dataset Profile', href: '/studio' },
    { name: 'Explore', href: '/studio/explore' },
    { name: 'Data Preview', href: '/studio/preview' },
  ];

  return (
    <nav className={styles.tabsNav} aria-label="Studio workspaces navigation" id="studio-workspace-tabs">
      <div className={styles.container}>
        <div className={styles.tabsList} role="tablist">
          {tabs.map((tab) => {
            // Match the exact route. We also handle trailing slashes nicely if any.
            const isActive = pathname === tab.href || pathname === `${tab.href}/`;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={clsx(styles.tabLink, { [styles.active]: isActive })}
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                id={`tab-link-${tab.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className={styles.tabText}>{tab.name}</span>
                {isActive && (
                  <span className={styles.activeIndicator} />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
