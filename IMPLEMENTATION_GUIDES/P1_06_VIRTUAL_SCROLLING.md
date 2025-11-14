# Virtual Scrolling Implementation (Frontend)

## Overview
Implement virtual scrolling to handle large file lists (1000+ files) efficiently by only rendering visible items.

## Installation

```bash
cd apps/web
npm install react-window react-virtualized-auto-sizer
```

## Implementation

### Create Virtualized File List Component

Create `apps/web/src/components/cloudStorage/VirtualizedFileList.tsx`:

```typescript
import React from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import FileCard from './FileCard';
import { ResumeFile } from '../../types/cloudStorage';

interface VirtualizedFileListProps {
  files: ResumeFile[];
  onFileSelect: (fileId: string) => void;
  selectedFiles: string[];
  // ... other props
}

const ROW_HEIGHT = 100; // Height of each file card

export default function VirtualizedFileList({
  files,
  onFileSelect,
  selectedFiles
}: VirtualizedFileListProps) {

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const file = files[index];

    return (
      <div style={style}>
        <FileCard
          file={file}
          isSelected={selectedFiles.includes(file.id)}
          onSelect={() => onFileSelect(file.id)}
        />
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          itemCount={files.length}
          itemSize={ROW_HEIGHT}
          width={width}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
}
```

### Update RedesignedFileList Component

```typescript
// In RedesignedFileList.tsx
import VirtualizedFileList from './VirtualizedFileList';

export default function RedesignedFileList({ files, ...props }) {
  // If more than 50 files, use virtual scrolling
  if (files.length > 50) {
    return (
      <VirtualizedFileList
        files={files}
        {...props}
      />
    );
  }

  // Otherwise, render normally
  return (
    <div className="file-grid">
      {files.map(file => (
        <FileCard key={file.id} file={file} {...props} />
      ))}
    </div>
  );
}
```

## Grid Layout (For Card View)

For grid layout with variable heights, use `react-window-infinite-loader`:

```bash
npm install react-window-infinite-loader
```

```typescript
import { FixedSizeGrid as Grid } from 'react-window';

const COLUMN_COUNT = 3;
const CARD_WIDTH = 300;
const CARD_HEIGHT = 200;

const Cell = ({ columnIndex, rowIndex, style }) => {
  const index = rowIndex * COLUMN_COUNT + columnIndex;
  if (index >= files.length) return null;

  const file = files[index];

  return (
    <div style={style}>
      <FileCard file={file} />
    </div>
  );
};

<Grid
  columnCount={COLUMN_COUNT}
  columnWidth={CARD_WIDTH}
  height={600}
  rowCount={Math.ceil(files.length / COLUMN_COUNT)}
  rowHeight={CARD_HEIGHT}
  width={COLUMN_COUNT * CARD_WIDTH}
>
  {Cell}
</Grid>
```

## Performance Impact

### Without Virtual Scrolling
- 1000 files: 5-10 seconds initial render
- Memory: 500MB+
- Scroll FPS: 15-20

### With Virtual Scrolling
- 1000 files: 100-200ms initial render
- Memory: 50MB
- Scroll FPS: 60

## Implementation Time: 4-5 hours

## Testing

```typescript
// Generate test data
const testFiles = Array.from({ length: 10000 }, (_, i) => ({
  id: `file-${i}`,
  name: `Test File ${i}`,
  // ... other properties
}));

// Render and test performance
<VirtualizedFileList files={testFiles} />
```
