/* src/features/csv/parser.ts */
import Papa from 'papaparse';
import { Dataset, Column } from '../../types/dataset';
import { validateCSVData, findDuplicateColumns } from './validator';
import { detectColumnType } from './detectColumnType';

export interface ParseCSVResult {
  success: boolean;
  dataset?: Dataset;
  error?: string;
}

/**
 * Helper to read the first line/chunk of a File safely.
 */
function getFirstLine(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    // Read only the first 64KB to cover extremely wide CSVs
    const blob = file.slice(0, 1024 * 64);
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const firstLine = text.split(/\r?\n/)[0] || '';
      resolve(firstLine);
    };
    reader.onerror = () => {
      resolve('');
    };
    reader.readAsText(blob);
  });
}

/**
 * Parses a CSV file client-side, runs validation, performs column type classification,
 * and compiles comprehensive dataset metadata.
 */
export function parseCSV(file: File): Promise<ParseCSVResult> {
  return new Promise(async (resolve) => {
    // 1. Read the raw header line and validate duplicates before PapaParse modifies it
    try {
      const firstLine = await getFirstLine(file);
      const parsedHeader = Papa.parse<string[]>(firstLine, {
        header: false,
        skipEmptyLines: 'greedy',
      });
      const rawHeaders = parsedHeader.data[0] || [];
      if (findDuplicateColumns(rawHeaders)) {
        resolve({
          success: false,
          error: 'Your CSV contains duplicate column names. Please ensure every column has a unique name before uploading.',
        });
        return;
      }
    } catch (err) {
      console.error('Error pre-validating headers:', err);
    }

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: 'greedy', // Skip lines that only contain whitespace
      transformHeader: (header: string) => header.trim(), // Trim headers
      complete: (results) => {
        const rawHeaders = results.meta.fields || [];
        const rawRows = results.data;

        // Perform validation
        const validation = validateCSVData(rawHeaders, rawRows, file.size, results.errors);
        if (!validation.isValid) {
          resolve({
            success: false,
            error: validation.error || "We couldn't recognize this file as a valid CSV.",
          });
          return;
        }

        try {
          // Identify headers and clean up empty columns if any
          const headers = rawHeaders.filter(h => h.trim() !== '');
          
          // Build column metadata
          const columns: Column[] = headers.map((header) => {
            // Sample up to 100 rows to detect the column type
            const sampleSize = Math.min(rawRows.length, 100);
            const sampleValues: string[] = [];
            
            for (let i = 0; i < sampleSize; i++) {
              const val = rawRows[i]?.[header];
              if (val !== undefined && val !== null) {
                sampleValues.push(String(val));
              }
            }

            const detectedType = detectColumnType(sampleValues);

            return {
              name: header,
              type: detectedType,
              sampleValues: sampleValues.slice(0, 5), // Keep a small preview set
            };
          });

          const dataset: Dataset = {
            name: file.name,
            sizeInBytes: file.size,
            rowCount: rawRows.length,
            columnCount: headers.length,
            columns,
            headers,
            data: rawRows,
          };

          resolve({
            success: true,
            dataset,
          });
        } catch (e) {
          console.error('Unexpected error parsing dataset:', e);
          resolve({
            success: false,
            error: 'An unexpected error occurred while parsing the dataset. Please try again.',
          });
        }
      },
      error: (error) => {
        console.error('PapaParse error:', error);
        resolve({
          success: false,
          error: "We couldn't recognize this file as a valid CSV. Please verify its format.",
        });
      },
    });
  });
}
