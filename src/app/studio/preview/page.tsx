'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Hash, Text } from 'lucide-react';
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

export default function PreviewPage() {
  // Pull the dataset from your store and cast it to your structure
  const { dataset } = useDatasetStore() as { dataset: Dataset | null };
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Derive the display data safely
  const columns = dataset?.columns || [];
  const rows = dataset?.data || [];
  
  const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

  // Slice rows for the current page view
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return rows.slice(startIndex, startIndex + rowsPerPage);
  }, [rows, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
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
        <p className={styles.description}>
          {dataset 
            ? `Viewing "${dataset.name}" — ${dataset.rowCount} rows across ${dataset.columnCount} columns.`
            : "View the fully structured spreadsheet records, filter row entries, and inspect your raw tabular schema."
          }
        </p>
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
                  {columns.map((col) => (
                    <th key={col.name} style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main, #333)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {col.type === 'Metric' ? <Hash size={14} style={{ opacity: 0.6 }} /> : <Text size={14} style={{ opacity: 0.6 }} />}
                        <span>{col.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, rowIndex) => (
                  <tr key={rowIndex} style={{ borderBottom: '1px solid var(--border, #eee)' }}>
                    {columns.map((col) => (
                      <td key={col.name} style={{ padding: '12px 16px', color: 'var(--text-muted, #555)' }}>
                        {row[col.name] ?? <span style={{ opacity: 0.3 }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted, #666)' }}>
              Showing <strong>{Math.min((currentPage - 1) * rowsPerPage + 1, rows.length)}</strong> to{' '}
              <strong>{Math.min(currentPage * rowsPerPage, rows.length)}</strong> of <strong>{rows.length}</strong> rows
            </span>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 12px', borderRadius: '4px',
                  border: '1px solid var(--border, #ccc)', backgroundColor: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1
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
                  border: '1px solid var(--border, #ccc)', backgroundColor: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1
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