/* src/app/studio/explore/page.tsx */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from '@dnd-kit/core';
import {
  Calendar,
  Check,
  ChevronDown,
  ArrowLeft,
  Sparkles,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { useDatasetStore } from '../../../store/datasetStore';
import { useChartStore, AggregationType, FilterState } from '../../../store/chartStore';
import { filterDataset } from '../../../features/analytics/filterDataset';
import { aggregateData } from '../../../features/analytics/aggregateData';
import { Column } from '../../../types/dataset';
import styles from './Explore.module.scss';
import clsx from 'clsx';
import GraphHandler from '@/components/graphHandler/GraphHandler';

// --- Draggable Field Component ---
interface DraggableFieldProps {
  id: string;
  name: string;
  type: 'Dimension' | 'Metric';
  subtype?: 'Text' | 'Date' | 'Boolean';
}

function DraggableField({ id, name, type, subtype }: DraggableFieldProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: id,
    data: { name, type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={clsx(styles.fieldCard, { [styles.draggingPlaceholder]: isDragging })}
      id={`draggable-field-${id.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div
        className={clsx(styles.fieldIcon, {
          [styles.fieldIconDimension]: type === 'Dimension',
          [styles.fieldIconMetric]: type === 'Metric',
        })}
      >
        {type === 'Dimension' && (
          <>
            {subtype === 'Text' && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>Aa</span>}
            {subtype === 'Date' && <Calendar size={12} />}
            {subtype === 'Boolean' && <Check size={12} />}
          </>
        )}
        {type === 'Metric' && (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#</span>
        )}
      </div>
      <span className={styles.fieldName} title={name}>
        {name}
      </span>
    </div>
  );
}

// --- Droppable Zone Component ---
interface DroppableZoneProps {
  id: string;
  isActive: boolean;
  activeClass: string;
  className?: string;
  children: React.ReactNode;
}

function DroppableZone({ id, isActive, activeClass, className, children }: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(styles.dropZone, className, {
        [activeClass]: isActive,
        [styles.dropZoneOver]: isOver && isActive,
      })}
    >
      {children}
    </div>
  );
}

// --- Filter Card Component ---
interface FilterCardProps {
  filter: FilterState;
  getDimensionSubtype: (colName: string, sampleValues: string[], test: boolean) => 'Text' | 'Date' | 'Boolean';
}

function FilterCard({ filter, getDimensionSubtype }: FilterCardProps) {
  const { column, selectedValues, startDate, endDate, minVal, maxVal, isCollapsed } = filter;
  const { updateFilter, removeFilter, clearFilterValues } = useChartStore();
  const { dataset } = useDatasetStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const subtype = column.type === 'Dimension' ? getDimensionSubtype(column.name, column.sampleValues, true) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute unique values from the dataset
  const uniqueValues = React.useMemo(() => {
    if (!dataset || !dataset.data) return [];
    if (column.type === 'Metric') return [];

    if (subtype === 'Boolean') {
      return ['True', 'False'];
    }

    const vals = dataset.data
      .map((row) => row[column.name])
      .filter((val) => val !== undefined && val !== null && val !== '');
    return Array.from(new Set(vals)).sort();
  }, [dataset, column.name, column.type, subtype]);

  const handleToggleValue = (value: string) => {
    let nextValues;
    if (selectedValues.includes(value)) {
      nextValues = selectedValues.filter((v) => v !== value);
    } else {
      nextValues = [...selectedValues, value];
    }
    updateFilter(column.name, { selectedValues: nextValues });
  };

  const handleSelectAll = () => {
    updateFilter(column.name, { selectedValues: uniqueValues });
  };

  const handleClearAll = () => {
    updateFilter(column.name, { selectedValues: [] });
  };

  const handleCollapseToggle = () => {
    updateFilter(column.name, { isCollapsed: !isCollapsed });
  };

  return (
    <div
      className={clsx(styles.filterConfigCard, { [styles.filterCardCollapsed]: isCollapsed })}
      id={`filter-card-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className={styles.filterCardHeader}>
        <div className={styles.filterCardHeaderTitle}>
          <div
            className={clsx(styles.fieldIcon, {
              [styles.fieldIconDimension]: column.type === 'Dimension',
              [styles.fieldIconMetric]: column.type === 'Metric',
            })}
          >
            {column.type === 'Dimension' ? (
              <>
                {subtype === 'Text' && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>Aa</span>}
                {subtype === 'Date' && <Calendar size={12} />}
                {subtype === 'Boolean' && <Check size={12} />}
              </>
            ) : (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#</span>
            )}
          </div>
          <span className={styles.filterCardName} title={column.name}>
            {column.name}
          </span>
        </div>

        <div className={styles.filterCardHeaderActions}>
          <button
            type="button"
            className={styles.filterCardActionBtn}
            onClick={() => clearFilterValues(column.name)}
            title="Clear filter values"
            id={`btn-clear-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Clear
          </button>
          <button
            type="button"
            className={styles.filterCardActionIconBtn}
            onClick={handleCollapseToggle}
            title={isCollapsed ? 'Expand' : 'Collapse'}
            id={`btn-collapse-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <ChevronDown size={14} className={clsx(styles.collapseIcon, { [styles.collapsed]: isCollapsed })} />
          </button>
          <button
            type="button"
            className={clsx(styles.filterCardActionIconBtn, styles.removeBtn)}
            onClick={() => removeFilter(column.name)}
            title="Remove filter"
            id={`btn-remove-filter-card-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            &times;
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className={styles.filterCardBody} ref={dropdownRef}>
          {column.type === 'Dimension' && subtype === 'Date' && (
            <div className={styles.dateFilterRange}>
              <div className={styles.filterInputGroup}>
                <label className={styles.filterInputLabel}>Start Date</label>
                <input
                  type="date"
                  className={styles.filterDateInput}
                  value={startDate || ''}
                  onChange={(e) => updateFilter(column.name, { startDate: e.target.value || null })}
                  id={`input-start-date-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
              <div className={styles.filterInputGroup}>
                <label className={styles.filterInputLabel}>End Date</label>
                <input
                  type="date"
                  className={styles.filterDateInput}
                  value={endDate || ''}
                  onChange={(e) => updateFilter(column.name, { endDate: e.target.value || null })}
                  id={`input-end-date-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
            </div>
          )}

          {column.type === 'Dimension' && (subtype === 'Text' || subtype === 'Boolean') && (
            <div className={styles.valueSelectorContainer}>
              <button
                type="button"
                className={styles.valueSelectorTrigger}
                onClick={() => setIsOpen(!isOpen)}
                id={`btn-selector-trigger-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span>
                  {selectedValues.length === 0
                    ? 'All Values'
                    : selectedValues.length === uniqueValues.length
                      ? 'All Selected'
                      : `${selectedValues.length} Selected`}
                </span>
                <ChevronDown size={13} />
              </button>

              {isOpen && (
                <div className={styles.valueSelectorDropdown}>
                  <div className={styles.dropdownHeader}>
                    <button
                      type="button"
                      className={styles.dropdownHeaderBtn}
                      onClick={handleSelectAll}
                      id={`btn-select-all-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      className={styles.dropdownHeaderBtn}
                      onClick={handleClearAll}
                      id={`btn-clear-all-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      Clear All
                    </button>
                  </div>
                  <div className={styles.dropdownList}>
                    {uniqueValues.map((val) => {
                      const isChecked = selectedValues.includes(val);
                      return (
                        <label
                          key={val}
                          className={styles.dropdownItem}
                          id={`label-checkbox-${column.name.toLowerCase().replace(/\s+/g, '-')}-${val.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleValue(val)}
                            className={styles.filterCheckbox}
                          />
                          <span>{val}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {column.type === 'Metric' && (
            <div className={styles.metricFilterRange}>
              <div className={styles.filterInputGroup}>
                <label className={styles.filterInputLabel}>Minimum</label>
                <input
                  type="number"
                  placeholder="No min"
                  className={styles.filterNumberInput}
                  value={minVal}
                  onChange={(e) => updateFilter(column.name, { minVal: e.target.value })}
                  id={`input-min-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
              <div className={styles.filterInputGroup}>
                <label className={styles.filterInputLabel}>Maximum</label>
                <input
                  type="number"
                  placeholder="No max"
                  className={styles.filterNumberInput}
                  value={maxVal}
                  onChange={(e) => updateFilter(column.name, { maxVal: e.target.value })}
                  id={`input-max-${column.name.toLowerCase().replace(/\s+/g, '-')}`}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Explore Page Main Component ---
export default function ExplorePage() {
  const router = useRouter();
  const { dataset } = useDatasetStore();

  // Chart Builder Store States
  const {
    chartType,
    xAxis,
    yAxis,
    aggregation,
    filters,
    setChartType,
    setXAxis,
    setYAxis,
    setAggregation,
    addFilter,
    removeFilter,
  } = useChartStore();

  // Local state to track which field type is currently being dragged
  const [activeType, setActiveType] = useState<'Dimension' | 'Metric' | null>(null);
  const [activeDragColumn, setActiveDragColumn] = useState<Column | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize(); // Initial check

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  console.log('check this part', isDesktop)

  // Setup sensors for dragging (using pointer sensor with activation constraint to allow clicking)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Return to upload
  const handleUploadAnother = () => {
    router.push('/');
  };

  // Count dimensions vs metrics in full dataset (memoized unconditionally)
  const dimensions = React.useMemo(() => {
    if (!dataset) return [];
    return dataset.columns.filter((c) => c.type === 'Dimension');
  }, [dataset]);

  const metrics = React.useMemo(() => {
    if (!dataset) return [];
    return dataset.columns.filter((c) => c.type === 'Metric');
  }, [dataset]);

  const dimensionsCount = dimensions.length;
  const metricsCount = metrics.length;

  // Filter out fields that are already dropped in the axis or filters zones (unconditional)
  const availableDimensions = React.useMemo(() => {
    return dimensions;
  }, [dimensions]);

  const availableMetrics = React.useMemo(() => {
    return metrics;
  }, [metrics]);

  // 1. Filter the dataset based on active filters (unconditional)
  const filteredRows = React.useMemo(() => {
    if (!dataset) return [];
    return filterDataset(dataset, filters);
  }, [dataset, filters]);

  // 2. Group and aggregate the filtered rows by selected axes (unconditional)
  const aggregatedData = React.useMemo(() => {
    if (!xAxis || !yAxis) return [];
    return aggregateData(filteredRows, xAxis, yAxis, aggregation);
  }, [filteredRows, xAxis, yAxis, aggregation]);

  if (!dataset) {
    return null;
  }

  // Determine dimension subtype (Text, Date, or Boolean)
  const getDimensionSubtype = (colName: string, sampleValues: string[] = [], test = false): 'Text' | 'Date' | 'Boolean' => {
    const nameLower = colName.toLowerCase();
    if (
      nameLower.includes('date') ||
      nameLower.includes('time') ||
      nameLower.includes('created') ||
      nameLower.includes('updated') ||
      nameLower.includes('joining') ||
      nameLower.includes('day') ||
      nameLower.includes('month') ||
      nameLower.includes('year') ||
      nameLower.endsWith('_at') ||
      nameLower.endsWith(' at')
    ) {
      return 'Date';
    }


    const nonNil = sampleValues.filter((v) => v !== undefined && v !== null && v.trim() !== '');
    if (nonNil.length > 0) {
      const isAllDates = nonNil.every((v) => {
        const clean = v.trim();
        if (/^\d+$/.test(clean)) {
          const num = Number(clean);
          return num >= 1900 && num <= 2100;
        }
        return !isNaN(Date.parse(clean));
      });

      if (isAllDates) return 'Date';


      const isAllBooleans = nonNil.every((v) => {
        const clean = v.trim().toLowerCase();
        return (
          clean === 'true' ||
          clean === 'false' ||
          clean === 'yes' ||
          clean === 'no' ||
          clean === 'y' ||
          clean === 'n' ||
          clean === '0' ||
          clean === '1'
        );
      });
      if (isAllBooleans) return 'Boolean';
    }

    return 'Text';
  };

  if (!isDesktop) {
    return (
      <div
        style={{
          minHeight: "70vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "560px",
            background: "#fff",
            borderRadius: "20px",
            padding: "3rem",
            textAlign: "center",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 10px 40px rgba(15, 23, 42, 0.08), 0 2px 8px rgba(15, 23, 42, 0.04)",
          }}
        >
          <div
            style={{
              fontSize: "3.5rem",
              marginBottom: "1rem",
            }}
          >
            💻
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Desktop Experience Recommended
          </h1>

          <p
            style={{
              marginTop: "1.25rem",
              fontSize: "1rem",
              lineHeight: 1.7,
              color: "#4b5563",
            }}
          >
            <strong>Insight Studio's Explore workspace</strong> is currently optimized
            for desktop screens with a minimum width of <strong>1024px</strong>.
          </p>

          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.95rem",
              color: "#6b7280",
            }}
          >
            The drag-and-drop analytics builder, interactive charts, and data
            exploration tools provide the best experience on a desktop or laptop.
          </p>

          <div
            style={{
              marginTop: "2rem",
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#2563eb",
              color: "#fff",
              borderRadius: "999px",
              fontWeight: 600,
            }}
          >
            Please switch to a desktop device
          </div>
        </div>
      </div>
    );
  }

  // Render correct full-screen empty state if dataset is insufficient
  if (dimensionsCount === 0 && metricsCount === 0) {
    return (
      <div className={styles.centeredFallback} id="fallback-both-empty">
        <div className={styles.fallbackCard}>
          <div className={styles.fallbackIconContainer}>
            <FileSpreadsheet size={28} />
          </div>
          <h2 className={styles.fallbackTitle}>Dataset cannot be visualized</h2>
          <p className={styles.fallbackText}>
            This dataset does not contain enough information to create visualizations. Please upload another dataset.
          </p>
          <div className={styles.fallbackActions}>
            <button
              onClick={handleUploadAnother}
              className={styles.resetBtn}
              id="btn-upload-another-both"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              Upload Another Dataset
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (metricsCount === 0) {
    return (
      <div className={styles.centeredFallback} id="fallback-no-metrics">
        <div className={styles.fallbackCard}>
          <div className={styles.fallbackIconContainer}>
            <FileSpreadsheet size={28} />
          </div>
          <h2 className={styles.fallbackTitle}>No metrics available</h2>
          <p className={styles.fallbackText}>
            We couldn&apos;t find any numeric columns in this dataset. Metrics are required to measure values such as revenue, quantity or profit. Please upload another dataset.
          </p>
          <div className={styles.fallbackActions}>
            <button
              onClick={handleUploadAnother}
              className={styles.resetBtn}
              id="btn-upload-another-metrics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              Upload Another Dataset
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (dimensionsCount === 0) {
    return (
      <div className={styles.centeredFallback} id="fallback-no-dimensions">
        <div className={styles.fallbackCard}>
          <div className={styles.fallbackIconContainer}>
            <FileSpreadsheet size={28} />
          </div>
          <h2 className={styles.fallbackTitle}>No dimensions available</h2>
          <p className={styles.fallbackText}>
            We couldn&apos;t find any categorical or date columns. Dimensions are required to group your data into meaningful charts. Please upload another dataset.
          </p>
          <div className={styles.fallbackActions}>
            <button
              onClick={handleUploadAnother}
              className={styles.resetBtn}
              id="btn-upload-another-dimensions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={16} />
              Upload Another Dataset
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;
    if (activeData) {
      setActiveType(activeData.type);
      const col = dataset.columns.find((c) => c.name === event.active.id);
      if (col) {
        setActiveDragColumn(col);
      }
    }
  };

  // Handle Drag End
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveType(null);
    setActiveDragColumn(null);
    const { over, active } = event;

    if (!over) return;

    const colName = active.id as string;
    const colType = active.data.current?.type as 'Dimension' | 'Metric';

    const column = dataset.columns.find((c) => c.name === colName);
    if (!column) return;

    if (over.id === 'x-axis' && colType === 'Dimension') {
      setXAxis(column);
    } else if (over.id === 'y-axis' && colType === 'Metric') {
      setYAxis(column);
    } else if (over.id === 'filters') {
      addFilter(column);
    }
  };

  const handleDragCancel = () => {
    setActiveType(null);
    setActiveDragColumn(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <motion.div
        className={styles.exploreContainer}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        id="studio-explore-tab-page"
      >
        <div className={styles.workspaceGrid}>
          {/* COLUMN 1: LEFT SIDEBAR (Available Fields) */}
          <aside className={styles.sidebar} id="explore-left-sidebar" aria-label="Fields selection">
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Fields</h2>
              <p className={styles.sidebarSubtitle}>Drag fields into the workspace.</p>
            </div>

            {/* Section: DIMENSIONS */}
            <div className={styles.fieldSection} id="section-explore-dimensions">
              <h3 className={styles.sectionHeader}>Dimensions</h3>
              <div className={styles.fieldsList}>
                {availableDimensions.map((col) => {
                  const subtype = getDimensionSubtype(col.name, col.sampleValues);
                  return (
                    <DraggableField
                      key={col.name}
                      id={col.name}
                      name={col.name}
                      type="Dimension"
                      subtype={subtype}
                    />
                  );
                })}
                {availableDimensions.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    All dimensions placed
                  </p>
                )}
              </div>
            </div>

            {/* Section: METRICS */}
            <div className={styles.fieldSection} id="section-explore-metrics">
              <h3 className={styles.sectionHeader}>Metrics</h3>
              <div className={styles.fieldsList}>
                {availableMetrics.map((col) => (
                  <DraggableField
                    key={col.name}
                    id={col.name}
                    name={col.name}
                    type="Metric"
                  />
                ))}
                {availableMetrics.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                    All metrics placed
                  </p>
                )}
              </div>
            </div>
          </aside>

          {/* COLUMN 2: CENTER CONTENT (Workspace Area) */}
          <section className={styles.centerWorkspace} id="explore-center-workspace" aria-label="Visualization Workspace">
            {xAxis && yAxis ? (
              <GraphHandler />
            ) : (
              <div className={styles.emptyStateContainer} id="explore-empty-state">
                <div className={styles.illustrationWrapper}>
                  {/* Minimal dashboard SVG illustration */}
                  <svg
                    width="140"
                    height="140"
                    viewBox="0 0 140 140"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ margin: '0 auto 16px auto' }}
                  >
                    <rect
                      x="10"
                      y="10"
                      width="120"
                      height="120"
                      rx="16"
                      stroke="var(--color-border)"
                      strokeWidth="2"
                      strokeDasharray="6 6"
                    />
                    <path d="M30 110V85M30 85L55 60M30 85V110" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M55 110V60M55 60L80 75M55 60V110" stroke="var(--color-primary-accent)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M80 110V75M80 75L105 45M80 75V110" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M105 110V45" stroke="var(--color-text-muted)" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="105" cy="45" r="4" fill="var(--color-primary)" />
                    <circle cx="55" cy="60" r="4" fill="var(--color-primary-accent)" />
                    <circle cx="80" cy="75" r="4" fill="var(--color-text-secondary)" />
                    <g style={{ color: 'var(--color-primary)', opacity: 0.85 }}>
                      <path d="M15 25l2 2-2 2-2-2zM120 115l1.5 1.5-1.5 1.5-1.5-1.5z" fill="currentColor" />
                    </g>
                  </svg>
                </div>
                <h2 className={styles.emptyStateTitle}>Let&apos;s create your first visualization</h2>
                <p className={styles.emptyStateText}>
                  Drag one dimension to the X Axis and one metric to the Y Axis. Your chart will update automatically.
                </p>
              </div>
            )}
          </section>

          {/* COLUMN 3: RIGHT SIDEBAR (Chart Controls) */}
          <aside className={styles.sidebar} id="explore-right-sidebar" aria-label="Chart Builder controls">
            <div className={styles.sidebarHeader}>
              <h2 className={styles.sidebarTitle}>Chart Builder</h2>
              <p className={styles.sidebarSubtitle}>Configure your visualization details.</p>
            </div>

            <div className={styles.controlsGroup}>
              {/* Control: Chart Type */}
              <div className={styles.controlItem} id="control-chart-type">
                <span className={styles.controlLabel}>Chart Type</span>
                <div className={styles.segmentedButtons} role="group" aria-label="Chart types selector">
                  <button
                    type="button"
                    className={clsx(styles.segmentBtn, { [styles.segmentBtnActive]: chartType === 'bar' })}
                    onClick={() => setChartType('bar')}
                    id="btn-chart-type-bar"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <BarChart3 size={13} />
                      <span>Bar</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.segmentBtn, { [styles.segmentBtnActive]: chartType === 'line' })}
                    onClick={() => setChartType('line')}
                    id="btn-chart-type-line"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <TrendingUp size={13} />
                      <span>Line</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={clsx(styles.segmentBtn, { [styles.segmentBtnActive]: chartType === 'pie' })}
                    onClick={() => setChartType('pie')}
                    id="btn-chart-type-pie"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <PieChart size={13} />
                      <span>Pie</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Control: X Axis */}
              <div className={styles.controlItem} id="control-x-axis">
                <span className={styles.controlLabel}>X Axis</span>
                <DroppableZone
                  id="x-axis"
                  isActive={activeType === 'Dimension'}
                  activeClass={styles.dropZoneActiveDimension}
                >
                  {xAxis ? (
                    <div className={styles.fieldChip} id="chip-x-axis" onClick={(e) => e.stopPropagation()}>
                      <div className={clsx(styles.fieldIcon, styles.fieldIconDimension)}>
                        {getDimensionSubtype(xAxis.name, xAxis.sampleValues) === 'Text' && <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>Aa</span>}
                        {getDimensionSubtype(xAxis.name, xAxis.sampleValues) === 'Date' && <Calendar size={12} />}
                        {getDimensionSubtype(xAxis.name, xAxis.sampleValues) === 'Boolean' && <Check size={12} />}
                      </div>
                      <span className={styles.chipName} title={xAxis.name}>
                        {xAxis.name}
                      </span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setXAxis(null);
                        }}
                        title="Remove X-axis"
                        id="btn-remove-x-axis"
                      >
                        <span style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.dropZonePlaceholder}>
                      <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                      <span>Drop a Dimension here</span>
                    </div>
                  )}
                </DroppableZone>
              </div>

              {/* Control: Y Axis */}
              <div className={styles.controlItem} id="control-y-axis">
                <span className={styles.controlLabel}>Y Axis</span>
                <DroppableZone
                  id="y-axis"
                  isActive={activeType === 'Metric'}
                  activeClass={styles.dropZoneActiveMetric}
                >
                  {yAxis ? (
                    <div className={styles.fieldChip} id="chip-y-axis" onClick={(e) => e.stopPropagation()}>
                      <div className={clsx(styles.fieldIcon, styles.fieldIconMetric)}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#</span>
                      </div>
                      <span className={styles.chipName} title={yAxis.name}>
                        {yAxis.name}
                      </span>
                      <button
                        type="button"
                        className={styles.chipRemoveBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setYAxis(null);
                        }}
                        title="Remove Y-axis"
                        id="btn-remove-y-axis"
                      >
                        <span style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 1 }}>&times;</span>
                      </button>
                    </div>
                  ) : (
                    <div className={styles.dropZonePlaceholder}>
                      <Sparkles size={14} style={{ color: '#d97706' }} />
                      <span>Drop a Metric here</span>
                    </div>
                  )}
                </DroppableZone>
              </div>

              {/* Control: Aggregation */}
              <div className={styles.controlItem} id="control-aggregation">
                <label htmlFor="select-aggregation" className={styles.controlLabel}>
                  Aggregation
                </label>
                <div className={styles.selectWrapper}>
                  <select
                    id="select-aggregation"
                    className={styles.select}
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as AggregationType)}
                  >
                    <option value="SUM">SUM</option>
                    <option value="AVG">AVG</option>
                    <option value="COUNT">COUNT</option>
                    <option value="MIN">MIN</option>
                    <option value="MAX">MAX</option>
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              </div>

              {/* Control: Filters */}
              <div className={styles.controlItem} id="control-filters">
                <span className={styles.controlLabel}>Filters</span>
                <DroppableZone
                  id="filters"
                  isActive={activeType !== null}
                  activeClass={
                    activeType === 'Dimension'
                      ? styles.dropZoneActiveDimension
                      : styles.dropZoneActiveMetric
                  }
                  className={styles.filterDropZone}
                >
                  {filters && filters.length > 0 ? (
                    <div
                      className={styles.filtersChipsList}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        width: '100%',
                      }}
                    >
                      {filters.map((filterState) => (
                        <FilterCard
                          key={filterState.column.name}
                          filter={filterState}
                          getDimensionSubtype={getDimensionSubtype}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className={styles.dropZonePlaceholder}>
                      <Sparkles size={14} style={{ color: 'var(--color-text-muted)' }} />
                      <span>Drag fields here to filter your data</span>
                    </div>
                  )}
                </DroppableZone>
                <p className={styles.filterHelperText}>
                  Filters will narrow the dataset before rendering the visualization.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </motion.div>

      {activeDragColumn && (
        <DragOverlay dropAnimation={null}>
          <div className={clsx(styles.fieldCard, styles.dragOverlayActive)}>
            <div
              className={clsx(styles.fieldIcon, {
                [styles.fieldIconDimension]: activeDragColumn.type === 'Dimension',
                [styles.fieldIconMetric]: activeDragColumn.type === 'Metric',
              })}
            >
              {activeDragColumn.type === 'Dimension' && (
                <>
                  {getDimensionSubtype(activeDragColumn.name, activeDragColumn.sampleValues) === 'Text' && (
                    <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>Aa</span>
                  )}
                  {getDimensionSubtype(activeDragColumn.name, activeDragColumn.sampleValues) === 'Date' && <Calendar size={12} />}
                  {getDimensionSubtype(activeDragColumn.name, activeDragColumn.sampleValues) === 'Boolean' && <Check size={12} />}
                </>
              )}
              {activeDragColumn.type === 'Metric' && (
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#</span>
              )}
            </div>
            <span className={styles.fieldName} title={activeDragColumn.name}>
              {activeDragColumn.name}
            </span>
          </div>
        </DragOverlay>
      )}
    </DndContext>
  );
}
