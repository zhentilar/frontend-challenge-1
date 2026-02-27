# Backup Data Integrity Dashboard

A Nuxt 4 application that visualizes time-series backup data chunks in an interactive heatmap grid.

## Project Structure

```
app/
├── components/
│   ├── ChunkCell.vue       # Individual minute cell in the heatmap
│   ├── ChunkGrid.vue       # Main grid displaying all chunks
│   ├── ChunkRow.vue        # Row component for each hour
│   ├── ColorScale.vue      # Legend showing color gradient
│   ├── DeleteModal.vue     # Confirmation modal for delete operations
│   └── DownloadModal.vue   # Modal showing download URLs
├── composables/
│   ├── useColorMapping.ts # Color gradient logic for heatmap
│   └── useFormatters.ts   # Number/size formatting utilities
├── layouts/
│   └── default.vue         # Default application layout
├── pages/
│   └── index.vue          # Main dashboard page
├── server/
│   ├── api/
│   │   ├── chunks/
│   │   │   ├── index.get.ts              # GET /api/chunks
│   │   │   ├── download-urls.post.ts    # POST /api/chunks/download-urls
│   │   │   └── index.delete.ts           # DELETE /api/chunks
│   └── mock-data/                     # Mock data for development
├── stores/
│   └── chunks.ts       # Pinia store for state management
├── types/
│   └── index.ts        # TypeScript interfaces
├── app.vue             # Application entry point
├── nuxt.config.ts      # Nuxt configuration
└── package.json        # Dependencies
```

## Architecture Decisions

### State Management
Using Pinia for global state management. The store handles:
- Fetching chunk data from the API
- Managing selection state (single, group, all)
- Handling download and delete operations
- Managing modal states

### Component Design
- **ChunkGrid**: Main container that renders all hourly groups
- **ChunkRow**: Displays one hour's worth of data with stats
- **ChunkCell**: Individual minute cell with color coding and selection
- **Modals**: Separate components for download and delete confirmation

### Color Mapping
Uses an 8-level green gradient (emerald palette) to represent data density:
- Linear scaling between minDataCount and maxDataCount
- Lighter colors for low data, darker for high data
- Empty cells shown as very faint/transparent

### API Layer
Server routes in `/server/api/chunks/` serve mock data from the `mock-data/` directory:
- GET /api/chunks - Returns all chunk data
- POST /api/chunks/download-urls - Generates download URLs for selected chunks
- DELETE /api/chunks - Deletes selected chunks (mock operation)

## Technology Stack

| Technology | Version | Status |
|------------|---------|--------|
| **Nuxt** | 4.3.x | ✅ |
| **Nuxt UI** | 4.5.0 | ✅ |
| **Pinia** | 2.x | ✅ |
| **TypeScript** | 5.3.x | ✅ |

## Getting Started

### Prerequisites
- Node.js 22.12.0 or higher (required for Nuxt 4)
- npm or yarn

### Installation

```bash
cd app
npm install
```

### Development

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

```bash
npm run build
npm run preview
```

## Features Implemented

### 1. Chunk Visualization Grid
- 24 rows — one per hour (0:00 through 23:00)
- 60 cells per row — one per minute within that hour
- Cell background color reflects data density (darker = more data, lighter = less)
- Empty cells appear very faint or transparent

Each hourly group shows:
- Time label (e.g., "0:00", "1:00")
- Inline statistics: record count, disk size, compression ratio
- Group selection checkbox

### 2. Color Mapping
- Uses a single green-tone color palette with 8 gradient levels
- Maps each chunk's dataCount value to a color level using linear scaling
- Shows a "Less → More" gradient scale in the footer

### 3. Chunk Selection
- Click a cell → toggle selection (show checkmark on selected cells)
- Group checkbox → select/deselect all chunks in that hour
- Select All toggle → select/deselect all visible chunks
- Action buttons show selected count: Download(3), Delete(5)
- Buttons are disabled when no chunks are selected

### 4. Download Operation
- Click "Download" button with chunks selected
- Calls the download-urls API endpoint
- Displays results in a modal: file name, size, and download link for each file

### 5. Delete Operation
- Click "Delete" button with chunks selected
- Shows confirmation modal with:
  - Warning message: "This action is irreversible"
  - Summary: chunk count, total size, record count
  - File list with details
  - Confirmation checkbox: "I understand this action cannot be undone"
  - Delete button (disabled until checkbox is checked)
- Calls the delete API endpoint
- Shows result (success/failure)

### 6. Footer Statistics
- Total Records (e.g., "1.2M")
- Total Chunks (e.g., "1,440")
- Size On Disk (e.g., "167.54 MB")
- Color scale indicator (Less → More)

## Notes

- The application uses mock data from the `mock-data/` directory
- Delete operations are simulated and don't actually modify data
- The color scale shows "Less → More" gradient in the footer

## Implementation Details

The dashboard uses Nuxt's server-side rendering with client-side hydration for optimal performance. Data is fetched on the server during initial load and hydrated to the client for interactivity.

### Key Files

- [`stores/chunks.ts`](stores/chunks.ts) - Pinia store managing all chunk data and selection state
- [`pages/index.vue`](pages/index.vue) - Main dashboard page composing all components
- [`components/ChunkGrid.vue`](components/ChunkGrid.vue) - Core heatmap visualization component
- [`composables/useColorMapping.ts`](composables/useColorMapping.ts) - Color scale logic for heatmap density

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/chunks` | Get all chunk data for the day |
| POST | `/api/chunks/download-urls` | Get download URLs for selected chunks |
| DELETE | `/api/chunks` | Delete selected chunks |

## Bug Fixes

The following issues were identified and fixed:

### DownloadModal
- **Toast Memory Leak**: Added proper cleanup of toast timeouts using `onUnmounted` hook
- **Clipboard Error Handling**: Added try-catch to prevent unhandled errors when clipboard API fails
- **Download Failure Feedback**: Users are now informed when download fails and falls back to opening in new tab

### DeleteModal
- **Error State Display**: Added error message display when delete API operation fails

### ChunkGrid
- **Empty Cell Selection**: Prevented clicking on empty cells (buckets with 0 data count)

### Store (chunks.ts)
- **TypeScript Errors**: Fixed TypeScript errors in getters by inlining bucket key generation

### useFormatters
- **Input Validation**: Added validation for NaN, Infinity, and negative numbers in all formatter functions
