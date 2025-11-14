# File Preview Implementation

## Overview
Enable in-browser preview of PDF, images, documents without downloading.

## Supported File Types
- ✅ PDF files
- ✅ Images (PNG, JPEG, GIF, SVG)
- ✅ Office docs (via Office Online/Google Docs Viewer)
- ✅ Text files (TXT, JSON, MD, CSV)
- ✅ Video/Audio (HTML5 players)

## Implementation

### 1. Install Preview Libraries

```bash
cd apps/web
npm install react-pdf pdfjs-dist
npm install react-image-lightbox
npm install react-file-viewer
```

### 2. PDF Preview Component

```typescript
// PDFPreview.tsx
import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export function PDFPreview({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  return (
    <div className="pdf-preview">
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        <Page pageNumber={pageNumber} width={800} />
      </Document>

      <div className="pdf-controls">
        <button
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </button>

        <span>Page {pageNumber} of {numPages}</span>

        <button
          disabled={pageNumber >= numPages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### 3. Image Preview with Lightbox

```typescript
// ImagePreview.tsx
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

export function ImagePreview({ images, currentIndex, onClose }: Props) {
  const [photoIndex, setPhotoIndex] = useState(currentIndex);

  return (
    <Lightbox
      mainSrc={images[photoIndex]}
      nextSrc={images[(photoIndex + 1) % images.length]}
      prevSrc={images[(photoIndex + images.length - 1) % images.length]}
      onCloseRequest={onClose}
      onMovePrevRequest={() =>
        setPhotoIndex((photoIndex + images.length - 1) % images.length)
      }
      onMoveNextRequest={() =>
        setPhotoIndex((photoIndex + 1) % images.length)
      }
    />
  );
}
```

### 4. Office Document Preview

```typescript
// OfficePreview.tsx
export function OfficePreview({ file }: { file: ResumeFile }) {
  const previewUrl = getOfficePreviewUrl(file);

  return (
    <iframe
      src={previewUrl}
      width="100%"
      height="600px"
      frameBorder="0"
    />
  );
}

function getOfficePreviewUrl(file: ResumeFile): string {
  const fileUrl = encodeURIComponent(file.publicUrl);

  // Microsoft Office Online Viewer
  if (file.contentType?.includes('word') || file.fileName?.endsWith('.docx')) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${fileUrl}`;
  }

  // Google Docs Viewer (fallback)
  return `https://docs.google.com/viewer?url=${fileUrl}&embedded=true`;
}
```

### 5. Universal Preview Modal

```typescript
// FilePreviewModal.tsx
export function FilePreviewModal({ file, onClose }: Props) {
  const getPreviewComponent = () => {
    const type = file.contentType;

    if (type?.includes('pdf')) {
      return <PDFPreview url={file.publicUrl} />;
    }

    if (type?.startsWith('image/')) {
      return <ImagePreview images={[file.publicUrl]} currentIndex={0} onClose={onClose} />;
    }

    if (type?.includes('word') || type?.includes('document')) {
      return <OfficePreview file={file} />;
    }

    if (type?.includes('text') || file.fileName?.endsWith('.txt')) {
      return <TextPreview url={file.publicUrl} />;
    }

    if (type?.startsWith('video/')) {
      return <VideoPreview url={file.publicUrl} type={type} />;
    }

    if (type?.startsWith('audio/')) {
      return <AudioPreview url={file.publicUrl} type={type} />;
    }

    return (
      <div className="unsupported-preview">
        <p>Preview not available for this file type.</p>
        <button onClick={() => window.open(file.publicUrl, '_blank')}>
          Download to View
        </button>
      </div>
    );
  };

  return (
    <div className="modal modal-large">
      <div className="modal-header">
        <h2>{file.name}</h2>
        <button onClick={onClose}>×</button>
      </div>

      <div className="modal-body">
        {getPreviewComponent()}
      </div>

      <div className="modal-footer">
        <button onClick={() => handleDownload(file)}>
          Download
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
```

### 6. Text File Preview

```typescript
// TextPreview.tsx
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function TextPreview({ url }: { url: string }) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('text');

  useEffect(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => setContent(text));

    // Detect language from extension
    if (url.endsWith('.json')) setLanguage('json');
    if (url.endsWith('.js')) setLanguage('javascript');
    if (url.endsWith('.ts')) setLanguage('typescript');
    if (url.endsWith('.py')) setLanguage('python');
    if (url.endsWith('.md')) setLanguage('markdown');
  }, [url]);

  return (
    <SyntaxHighlighter language={language} style={vscDarkPlus}>
      {content}
    </SyntaxHighlighter>
  );
}
```

### 7. Video/Audio Preview

```typescript
// MediaPreview.tsx
export function VideoPreview({ url, type }: { url: string; type: string }) {
  return (
    <video controls width="100%" style={{ maxHeight: '600px' }}>
      <source src={url} type={type} />
      Your browser does not support video playback.
    </video>
  );
}

export function AudioPreview({ url, type }: { url: string; type: string }) {
  return (
    <audio controls style={{ width: '100%' }}>
      <source src={url} type={type} />
      Your browser does not support audio playback.
    </audio>
  );
}
```

### 8. Backend: Generate Preview URL

```javascript
// In storage.routes.js
fastify.get('/files/:id/preview', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const fileId = request.params.id;
  const userId = request.user?.userId || request.user?.id;

  // Check permission
  const permissionCheck = await checkFilePermission(userId, fileId, 'view');
  if (!permissionCheck.allowed) {
    return reply.status(403).send({ error: 'No access' });
  }

  const file = permissionCheck.file;

  // Generate signed URL for preview (longer expiry)
  const previewUrl = await storageHandler.getDownloadUrl(
    file.storagePath,
    3600 // 1 hour
  );

  return reply.send({
    success: true,
    file: {
      id: file.id,
      name: file.name,
      contentType: file.contentType,
      size: Number(file.size),
      previewUrl
    }
  });
});
```

### 9. Preview Security Headers

```javascript
// For iframe previews, set CSP headers
reply.header('Content-Security-Policy',
  "default-src 'self'; " +
  "frame-src https://view.officeapps.live.com https://docs.google.com; " +
  "img-src 'self' data: blob:; " +
  "script-src 'self' 'unsafe-inline';"
);

// Prevent embedding in other sites
reply.header('X-Frame-Options', 'SAMEORIGIN');
```

## Supported File Types Matrix

| Type | Preview Method | Library |
|------|---------------|---------|
| PDF | Direct render | react-pdf |
| Images | Lightbox | react-image-lightbox |
| .docx, .xlsx, .pptx | Office Online | iframe |
| .txt, .md, .json | Syntax highlight | react-syntax-highlighter |
| Video | HTML5 video | native |
| Audio | HTML5 audio | native |
| .zip, .rar | Not supported | - |

## Performance Optimization

### Lazy Loading
```typescript
const PDFPreview = lazy(() => import('./PDFPreview'));

<Suspense fallback={<Spinner />}>
  <PDFPreview url={url} />
</Suspense>
```

### Thumbnail Preview
```typescript
// Show thumbnail while loading full preview
{isLoading ? (
  <img src={file.thumbnailUrl} alt="preview" />
) : (
  <PDFPreview url={file.previewUrl} />
)}
```

## Cost
- Libraries: Free (open source)
- Bandwidth: $0.09/GB for previews
- Office Online: Free (Microsoft service)

## Implementation Time: 12-15 hours

## User Experience

1. User clicks file → Preview modal opens
2. File loads in appropriate viewer
3. User can navigate pages (PDF), zoom (images), or play (media)
4. Download button available
5. Close preview when done

## Testing

```bash
# Test preview endpoint
curl http://localhost:5000/api/storage/files/FILE_ID/preview \
  -H "Authorization: Bearer TOKEN"

# Response:
{
  "success": true,
  "file": {
    "id": "...",
    "name": "document.pdf",
    "contentType": "application/pdf",
    "previewUrl": "https://..."
  }
}
```
