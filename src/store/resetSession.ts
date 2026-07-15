/* src/store/resetSession.ts */
import { useDatasetStore } from './datasetStore';
import { useChartStore } from './chartStore';

/**
 * Resets the entire analytics session, clearing all dataset metadata,
 * uploaded records, and chart builder configurations.
 */
export function resetAnalyticsSession() {
  useDatasetStore.getState().reset();
  useChartStore.getState().resetChart();
}
