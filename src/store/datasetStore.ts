/* src/store/datasetStore.ts */
import { create } from 'zustand';
import { Dataset, DatasetSummary } from '../types/dataset';

export type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'success' | 'error';

interface DatasetState {
  dataset: Dataset | null;
  status: UploadStatus;
  error: string | null;
  
  // Actions
  setDataset: (dataset: Dataset) => void;
  clearDataset: () => void;
  setError: (error: string | null) => void;
  setStatus: (status: UploadStatus) => void;
  reset: () => void;
  
  // Helpers
  getSummary: () => DatasetSummary | null;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const useDatasetStore = create<DatasetState>((set, get) => ({
  dataset: null,
  status: 'idle',
  error: null,

  setDataset: (dataset: Dataset) => set({
    dataset,
    status: 'success',
    error: null,
  }),

  clearDataset: () => set({
    dataset: null,
    status: 'idle',
    error: null,
  }),

  setError: (error: string | null) => set({
    error,
    status: error ? 'error' : 'idle',
  }),

  setStatus: (status: UploadStatus) => set({ status }),

  reset: () => set({
    dataset: null,
    status: 'idle',
    error: null,
  }),

  getSummary: (): DatasetSummary | null => {
    const { dataset } = get();
    if (!dataset) return null;

    const dimensionsCount = dataset.columns.filter(c => c.type === 'Dimension').length;
    const metricsCount = dataset.columns.filter(c => c.type === 'Metric').length;

    return {
      name: dataset.name,
      rowCount: dataset.rowCount,
      columnCount: dataset.columnCount,
      dimensionsCount,
      metricsCount,
      sizeFormatted: formatBytes(dataset.sizeInBytes),
    };
  },
}));
