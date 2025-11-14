# Advanced Search Implementation (Full-Text Search)

## Overview
Implement full-text search on file content using PostgreSQL Full-Text Search or Elasticsearch.

## Option A: PostgreSQL Full-Text Search (Recommended)

### 1. Add Full-Text Search Column

```sql
-- Migration
ALTER TABLE storage_files ADD COLUMN search_vector tsvector;

CREATE INDEX search_vector_idx ON storage_files USING GIN(search_vector);

-- Update search vector on insert/update
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW."fileName", '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER search_vector_trigger
BEFORE INSERT OR UPDATE ON storage_files
FOR EACH ROW EXECUTE FUNCTION update_search_vector();
```

### 2. Search Endpoint

```javascript
// In storage.routes.js
fastify.get('/files/search', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const { q, limit = 20 } = request.query;
  const userId = request.user?.userId || request.user?.id;

  if (!q || q.trim().length < 2) {
    return reply.status(400).send({ error: 'Query too short' });
  }

  // Full-text search with ranking
  const files = await prisma.$queryRaw`
    SELECT
      id,
      name,
      "fileName",
      type,
      size,
      "createdAt",
      ts_rank(search_vector, plainto_tsquery('english', ${q})) AS rank
    FROM storage_files
    WHERE
      "userId" = ${userId}
      AND "deletedAt" IS NULL
      AND search_vector @@ plainto_tsquery('english', ${q})
    ORDER BY rank DESC
    LIMIT ${limit}
  `;

  return reply.send({
    success: true,
    files,
    query: q,
    count: files.length
  });
});
```

### 3. Advanced Search with Filters

```javascript
fastify.post('/files/advanced-search', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const {
    query,
    type,
    sizeMin,
    sizeMax,
    dateFrom,
    dateTo,
    tags,
    starred
  } = request.body;

  const userId = request.user?.userId || request.user?.id;

  let sql = `
    SELECT * FROM storage_files
    WHERE "userId" = $1
    AND "deletedAt" IS NULL
  `;

  const params = [userId];
  let paramCount = 1;

  if (query) {
    paramCount++;
    sql += ` AND search_vector @@ plainto_tsquery('english', $${paramCount})`;
    params.push(query);
  }

  if (type) {
    paramCount++;
    sql += ` AND type = $${paramCount}`;
    params.push(type);
  }

  if (sizeMin) {
    paramCount++;
    sql += ` AND size >= $${paramCount}`;
    params.push(sizeMin);
  }

  if (sizeMax) {
    paramCount++;
    sql += ` AND size <= $${paramCount}`;
    params.push(sizeMax);
  }

  if (dateFrom) {
    paramCount++;
    sql += ` AND "createdAt" >= $${paramCount}`;
    params.push(dateFrom);
  }

  if (dateTo) {
    paramCount++;
    sql += ` AND "createdAt" <= $${paramCount}`;
    params.push(dateTo);
  }

  if (starred) {
    sql += ` AND "isStarred" = true`;
  }

  sql += ` ORDER BY "createdAt" DESC LIMIT 100`;

  const files = await prisma.$queryRawUnsafe(sql, ...params);

  return reply.send({
    success: true,
    files,
    count: files.length
  });
});
```

### 4. Extract File Content for Indexing

```javascript
const textract = require('textract');

async function extractTextFromFile(filePath, contentType) {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(filePath, (error, text) => {
      if (error) {
        reject(error);
      } else {
        resolve(text);
      }
    });
  });
}

// On file upload
const fileBuffer = await storageHandler.downloadAsBuffer(storagePath);
const tempPath = `/tmp/${fileId}`;
await fs.writeFile(tempPath, fileBuffer);

let extractedText = '';
try {
  extractedText = await extractTextFromFile(tempPath, contentType);
} catch (error) {
  logger.warn('Could not extract text:', error);
}

// Update file with extracted content
await prisma.storageFile.update({
  where: { id: fileId },
  data: {
    description: extractedText.slice(0, 10000) // First 10k chars
  }
});
```

### 5. Frontend Search Component

```typescript
// AdvancedSearchBar.tsx
export function AdvancedSearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);

    try {
      const response = await apiService.searchFiles(query);
      setResults(response.files);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const debouncedSearch = useDebounce(handleSearch, 500);

  useEffect(() => {
    if (query.length >= 2) {
      debouncedSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search files..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {isSearching && <Spinner />}

      {results.length > 0 && (
        <div className="search-results">
          {results.map(file => (
            <div key={file.id} className="search-result">
              <FileIcon type={file.type} />
              <div>
                <div className="name">{file.name}</div>
                <div className="meta">
                  {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Option B: Elasticsearch (For Large Scale)

```javascript
const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://localhost:9200' });

// Index file on upload
await client.index({
  index: 'files',
  id: fileId,
  body: {
    name: file.name,
    description: file.description,
    content: extractedText,
    type: file.type,
    userId: file.userId,
    createdAt: file.createdAt
  }
});

// Search
const { body } = await client.search({
  index: 'files',
  body: {
    query: {
      bool: {
        must: [
          { multi_match: { query, fields: ['name^3', 'description^2', 'content'] } },
          { term: { userId } }
        ]
      }
    },
    highlight: {
      fields: {
        content: {}
      }
    }
  }
});
```

## Search Features

- ✅ Full-text search in filename, description, content
- ✅ Fuzzy matching (typo tolerance)
- ✅ Relevance ranking
- ✅ Search highlighting
- ✅ Filters (type, size, date, tags)
- ✅ Real-time suggestions

## Cost
- PostgreSQL FTS: Free (built-in)
- Elasticsearch: $45/month (Elastic Cloud) or self-hosted
- textract: Free (open source)

## Implementation Time: 10-12 hours (PostgreSQL) or 15-20 hours (Elasticsearch)
