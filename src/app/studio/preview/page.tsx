'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  Hash, 
  Text, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown 
} from 'lucide-react';
import styles from '../page.module.scss';
import { useDatasetStore } from '@/store/datasetStore';

// Type definitions matching your dataset schema
interface ColumnInfo {
  name: string;
  type: 'Metric' | 'Dimension';
  sampleValues: string[];
}

interface DataRow {
  [key: string]: string | number | undefined;
}

interface Dataset {
  name: string;
  sizeInBytes: number;
  rowCount: number;
  columnCount: number;
  columns: ColumnInfo[];
  data: DataRow[];
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc' | null;
};

export default function PreviewPage() {
  // Pull the dataset from your store and cast it to your structure
  const { dataset } = useDatasetStore() as { dataset: Dataset | null };

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: null });
  const rowsPerPage = 10;

  // Derive the display data safely
  const columns = dataset?.columns || [];
  const rows = dataset?.data || [];

  // Handle column sorting cycle (Unsorted -> ASC -> DESC -> Unsorted)
  const handleSort = (columnName: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (sortConfig.key === columnName) {
      if (sortConfig.direction === 'asc') direction = 'desc';
      else if (sortConfig.direction === 'desc') direction = null;
    }

    setSortConfig({ key: columnName, direction });
    setCurrentPage(1); // Jump back to page 1 on sort change
  };

  // Sort rows based on configuration
  const sortedRows = useMemo(() => {
    const items = [...rows];
    if (!sortConfig.direction || !sortConfig.key) return items;

    return items.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      // Handle Numeric values safely
      const aNum = Number(aVal);
      const bNum = Number(bVal);

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // String sorting fallback
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, sortConfig]);

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;

  // Slice sorted rows for pagination
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(startIndex, startIndex + rowsPerPage);
  }, [sortedRows, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Dynamic Sort Icon Renderer using Primary Color #6366f1
  const renderSortIcon = (columnName: string) => {
    if (sortConfig.key !== columnName || sortConfig.direction === null) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={14} style={{ color: '#6366f1' }} /> 
      : <ArrowDown size={14} style={{ color: '#6366f1' }} />;
  };

  return (
    <motion.div
      className={styles.pageContainer}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      id="studio-preview-workspace"
    >
      <div className={styles.heroSection}>
        <h1 className={styles.title}>Data Preview</h1>

        <div className={styles.fileMetaCard} id="active-dataset-meta-badge">
          <div className={styles.fileIconWrapper}>
            <FileSpreadsheet className={styles.fileIcon} size={20} />
            <span className={styles.fileTypeBadge}>CSV</span>
          </div>
          {dataset ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{dataset.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted, #666)' }}>
                Columns: {dataset.columnCount} • Rows: {dataset.rowCount}
              </div>
            </div>
          ) : (
            <p className={styles.description}>
              View the fully structured spreadsheet records, filter row entries, and inspect your raw tabular schema.
            </p>
          )}
        </div>
      </div>

      {!dataset || rows.length === 0 ? (
        <div className={styles.gridPlaceholder}>
          <div className={styles.placeholderCard}>
            <p className={styles.cardText}>No dataset uploaded or active.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          {/* Responsive Scrollable Container */}
          <div style={{ overflowX: 'auto', backgroundColor: 'var(--bg-card, #fff)', borderRadius: '8px', border: '1px solid var(--border, #eee)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border, #eee)', backgroundColor: 'var(--bg-th, #f9f9f9)' }}>
                  {columns.map((col) => {
                    const isSorted = sortConfig.key === col.name && sortConfig.direction !== null;
                    return (
                      <th 
                        key={col.name} 
                        onClick={() => handleSort(col.name)}
                        style={{ 
                          padding: '12px 16px', 
                          fontWeight: 600, 
                          color: isSorted ? '#6366f1' : 'var(--text-main, #333)',
                          cursor: 'pointer',
                          userSelect: 'none',
                          transition: 'color 0.2s ease',
                          borderBottom: isSorted ? '2px solid #6366f1' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {col.type === 'Metric' ? <Hash size={14} style={{ opacity: 0.6 }} /> : <Text size={14} style={{ opacity: 0.6 }} />}
                            <span>{col.name}</span>
                          </div>
                          <div>
                            {renderSortIcon(col.name)}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border, #eee)' }}>
                    {columns.map((col) => {
                      const isSorted = sortConfig.key === col.name && sortConfig.direction !== null;
                      return (
                        <td 
                          key={col.name} 
                          style={{ 
                            padding: '12px 16px', 
                            color: 'var(--text-muted, #555)',
                            backgroundColor: isSorted ? 'rgba(99, 102, 241, 0.02)' : 'transparent' 
                          }}
                        >
                          {row[col.name] ?? <span style={{ opacity: 0.3 }}>—</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted, #666)' }}>
              Showing <strong>{Math.min((currentPage - 1) * rowsPerPage + 1, sortedRows.length)}</strong> to{' '}
              <strong>{Math.min(currentPage * rowsPerPage, sortedRows.length)}</strong> of <strong>{sortedRows.length}</strong>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '4px',
                  border: '1px solid var(--border, #ccc)', backgroundColor: 'transparent', 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '14px' }}>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '4px',
                  border: '1px solid var(--border, #ccc)', backgroundColor: 'transparent', 
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}