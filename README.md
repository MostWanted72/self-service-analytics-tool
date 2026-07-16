# Self-Service Analytics Tool

This project is a modern analytics workspace built with Next.js and TypeScript. It allows users to upload CSV files, inspect dataset profiles, and explore charts through a simple browser-based experience.

## Overview

The app is designed for quick self-service analysis:

- Upload a CSV file from the home page
- Review dataset structure, quality, and summary metrics
- Explore visualizations using a drag-and-drop studio experience
- Work entirely in the browser without needing SQL or coding

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm

### Install dependencies

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

## Project Structure

```text
src/
  app/                # App routes and page layouts
    page.tsx          # Landing page for CSV upload
    insights/         # Dataset insights overview
    studio/           # Dataset profile and exploration workspace
  components/         # Reusable UI and feature components
  features/           # CSV parsing, validation, analytics, and chart logic
  store/              # Zustand state for datasets and chart configuration
  types/              # Shared TypeScript types
```

## Main Pages

### Home page
The landing page lets users upload a CSV file and begin the analysis flow.

### Insights page
Shows a quick dataset summary, including row and column counts, schema classification, and sample values.

### Studio page
Provides a deeper dataset profile experience with overview cards, data quality insights, dimensions, and metrics summaries.

### Studio / Explore
This is the interactive chart-building workspace where users can drag dimensions and metrics into visual analysis areas, apply filters, and generate charts.

## Key Features

- CSV upload and parsing
- Automatic column type detection
- Dataset profile insights
- Drag-and-drop analytics exploration
- Interactive charts and filters

## Development Notes

The app uses:

- Next.js for routing and app structure
- React for the UI
- Zustand for state management
- SCSS modules for component styling

If you want to contribute, start with the main app routes in the src/app folder and follow the existing component and feature organization.
