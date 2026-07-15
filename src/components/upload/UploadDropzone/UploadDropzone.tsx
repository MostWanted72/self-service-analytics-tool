/* src/components/upload/UploadDropzone/UploadDropzone.tsx */
'use client';

import React, { useRef, useState } from 'react';
import { Button } from '../../ui/Button/Button';
import { Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { useDatasetStore } from '../../../store/datasetStore';
import { parseCSV } from '../../../features/csv/parser';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import styles from './UploadDropzone.module.scss';

export const UploadDropzone: React.FC = () => {
  const router = useRouter();
  const { status, error, setStatus, setDataset, setError, reset } = useDatasetStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate extension first
    if (!file.name.endsWith('.csv')) {
      setError("We couldn't recognize this file as a valid CSV. Please upload a file with the .csv extension.");
      return;
    }

    setStatus('uploading');
    setError(null);

    // Simulate a tiny visual delay for professional analysis feedback
    const startTime = Date.now();
    const result = await parseCSV(file);
    const elapsed = Date.now() - startTime;
    const minDelay = 1200; // 1.2s minimum delay to allow analysis feedback to render elegantly
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }

    if (result.success && result.dataset) {
      setDataset(result.dataset);
      // Automatically navigate to Studio Workspace after 400ms delay
      setTimeout(() => {
        router.push('/studio');
      }, 400);
    } else {
      setError(result.error || "We couldn't recognize this file as a valid CSV.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (status === 'uploading') return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (status === 'uploading') return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (status === 'uploading') return;
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const triggerFileInput = () => {
    if (status === 'uploading') return;
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (status === 'uploading') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  };

  const dropzoneClass = clsx(styles.dropzone, {
    [styles.dragging]: isDragging || status === 'dragging',
    [styles.uploading]: status === 'uploading',
    [styles.errorState]: status === 'error',
    [styles.successState]: status === 'success',
  });

  return (
    <div
      className={dropzoneClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={status === 'idle' || status === 'error' ? triggerFileInput : undefined}
      onKeyDown={status === 'idle' || status === 'error' ? handleKeyDown : undefined}
      role="button"
      tabIndex={status === 'uploading' ? -1 : 0}
      aria-label="Upload CSV dataset. Drag and drop your CSV file here, or click to choose from your computer."
      aria-disabled={status === 'uploading'}
      id="csv-upload-dropzone"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
        id="hidden-csv-file-input"
      />

      <AnimatePresence mode="wait">
        {status === 'uploading' && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.contentContainer}
            id="dropzone-uploading-state"
          >
            <div className={styles.spinnerContainer}>
              <Loader2 className={styles.spinnerIcon} />
            </div>
            <p className={styles.primaryText}>Parsing and profiling dataset...</p>
            <p className={styles.tertiaryText}>Detecting column profiles, validating schema metrics, and computing summaries.</p>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.contentContainer}
            id="dropzone-error-state"
          >
            <div className={styles.errorIconContainer}>
              <AlertCircle className={styles.errorIcon} />
            </div>
            <p className={styles.primaryText}>Upload Failed</p>
            <p className={styles.errorDescription}>{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                reset();
              }}
              id="retry-upload-button"
            >
              Try Another File
            </Button>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.contentContainer}
            id="dropzone-success-state"
          >
            <div className={styles.successIconContainer}>
              <CheckCircle2 className={styles.successIcon} />
            </div>
            <p className={styles.primaryText}>Dataset successfully loaded.</p>
            <p className={styles.tertiaryText}>Opening Insight Studio...</p>
          </motion.div>
        )}

        {(status === 'idle' || status === 'dragging') && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.contentContainer}
            id="dropzone-idle-state"
          >
            {/* CSV File Illustration */}
            <div className={styles.illustrationContainer}>
              <div className={styles.fileIcon}>
                <div className={styles.fileFold} />
                <div className={styles.csvBadge}>
                  <span>CSV</span>
                </div>
              </div>
            </div>

            <p className={styles.primaryText}>
              Drag & drop your CSV file here
            </p>
            
            <span className={styles.secondaryText}>or</span>

            <Button
              variant="primary"
              size="md"
              leftIcon={<Upload size={16} />}
              onClick={(e) => {
                e.stopPropagation(); // Prevent duplicate trigger from dropzone click
                triggerFileInput();
              }}
              id="choose-file-button"
            >
              Choose CSV File
            </Button>

            <div className={styles.formatIndicator}>
              <CheckCircle2 className={styles.checkIcon} aria-hidden="true" />
              <span>Supported format: CSV (.csv)</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
