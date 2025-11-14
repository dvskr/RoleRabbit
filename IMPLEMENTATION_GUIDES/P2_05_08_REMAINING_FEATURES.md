# P2 Remaining Features Implementation

## 5️⃣ COLLABORATION FEATURES (Real-Time Editing Indicators)

### Overview
Show who's viewing/editing files in real-time using WebSocket.

### Implementation

```typescript
// CollaborationIndicator.tsx
export function CollaborationIndicator({ fileId }: { fileId: string }) {
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  useEffect(() => {
    // Join file room
    webSocketService.emit('join_file', { fileId });

    // Listen for user joins/leaves
    webSocketService.on('user_joined_file', (data) => {
      setActiveUsers(prev => [...prev, data.user]);
    });

    webSocketService.on('user_left_file', (data) => {
      setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
    });

    // Leave on unmount
    return () => {
      webSocketService.emit('leave_file', { fileId });
    };
  }, [fileId]);

  if (activeUsers.length === 0) return null;

  return (
    <div className="collaboration-indicator">
      <div className="avatars">
        {activeUsers.map(user => (
          <img
            key={user.id}
            src={user.avatar}
            alt={user.name}
            title={`${user.name} is viewing`}
          />
        ))}
      </div>
      <span>{activeUsers.length} viewing</span>
    </div>
  );
}
```

### Backend (Socket.IO)

```javascript
// In socket server
io.on('connection', (socket) => {
  socket.on('join_file', async ({ fileId }) => {
    socket.join(`file:${fileId}`);

    // Broadcast to room
    socket.to(`file:${fileId}`).emit('user_joined_file', {
      user: socket.user
    });

    // Send current viewers
    const room = io.sockets.adapter.rooms.get(`file:${fileId}`);
    const viewers = Array.from(room || []).map(id =>
      io.sockets.sockets.get(id)?.user
    );

    socket.emit('current_viewers', { viewers });
  });

  socket.on('leave_file', ({ fileId }) => {
    socket.leave(`file:${fileId}`);
    socket.to(`file:${fileId}`).emit('user_left_file', {
      userId: socket.user.id
    });
  });

  // Real-time cursor positions (advanced)
  socket.on('cursor_move', ({ fileId, position }) => {
    socket.to(`file:${fileId}`).emit('cursor_update', {
      userId: socket.user.id,
      position
    });
  });
});
```

**Implementation Time:** 8-10 hours
**Cost:** Free (existing WebSocket infrastructure)

---

## 6️⃣ USAGE ANALYTICS DASHBOARD

### Overview
Track and visualize file usage metrics for users and admins.

### Metrics to Track
- Total storage used
- Files uploaded per day/week/month
- Most accessed files
- File type distribution
- Download count trends
- Active users

### Implementation

```typescript
// AnalyticsDashboard.tsx
export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    apiService.getAnalytics().then(setMetrics);
  }, []);

  return (
    <div className="analytics-dashboard">
      <div className="metrics-grid">
        <MetricCard
          title="Total Storage"
          value={formatBytes(metrics.totalStorage)}
          change="+12% this month"
        />

        <MetricCard
          title="Files Uploaded"
          value={metrics.filesUploaded}
          change="+5 today"
        />

        <MetricCard
          title="Downloads"
          value={metrics.totalDownloads}
          change="+23% this week"
        />

        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          change="15 online now"
        />
      </div>

      <div className="charts-grid">
        <Chart
          type="line"
          data={metrics.uploadsOverTime}
          title="Uploads Over Time"
        />

        <Chart
          type="pie"
          data={metrics.fileTypeDistribution}
          title="File Types"
        />

        <Chart
          type="bar"
          data={metrics.topFiles}
          title="Most Accessed Files"
        />
      </div>

      <div className="tables">
        <RecentActivity activities={metrics.recentActivity} />
        <TopFiles files={metrics.topFiles} />
      </div>
    </div>
  );
}
```

### Backend Analytics Endpoint

```javascript
fastify.get('/analytics', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const userId = request.user?.userId || request.user?.id;

  // Get metrics
  const [
    totalStorage,
    fileCount,
    downloadCount,
    uploadsByDay,
    fileTypes
  ] = await Promise.all([
    prisma.storageFile.aggregate({
      where: { userId, deletedAt: null },
      _sum: { size: true }
    }),

    prisma.storageFile.count({
      where: { userId, deletedAt: null }
    }),

    prisma.fileAccessLog.count({
      where: { userId, action: 'download' }
    }),

    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM storage_files
      WHERE "userId" = ${userId}
      AND "createdAt" >= NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    `,

    prisma.storageFile.groupBy({
      by: ['type'],
      where: { userId, deletedAt: null },
      _count: true,
      _sum: { size: true }
    })
  ]);

  return reply.send({
    success: true,
    metrics: {
      totalStorage: Number(totalStorage._sum.size),
      fileCount,
      downloadCount,
      uploadsOverTime: uploadsByDay,
      fileTypeDistribution: fileTypes
    }
  });
});
```

**Implementation Time:** 10-12 hours
**Cost:** Free (database queries) + $20-50/month for charting library

---

## 7️⃣ EXPORT/IMPORT FUNCTIONALITY

### Overview
Allow users to export all files as ZIP and import from backup.

### Export Implementation

```javascript
// Export all files as ZIP
fastify.post('/files/export', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const userId = request.user?.userId || request.user?.id;

  // Get all user's files
  const files = await prisma.storageFile.findMany({
    where: { userId, deletedAt: null }
  });

  const archive = archiver('zip');

  reply.type('application/zip');
  reply.header('Content-Disposition', `attachment; filename="files-export-${Date.now()}.zip"`);

  archive.pipe(reply.raw);

  // Add files to archive
  for (const file of files) {
    const buffer = await storageHandler.downloadAsBuffer(file.storagePath);
    archive.append(buffer, { name: file.fileName });
  }

  // Add manifest file
  const manifest = {
    exportDate: new Date(),
    fileCount: files.length,
    files: files.map(f => ({
      name: f.name,
      type: f.type,
      size: Number(f.size),
      createdAt: f.createdAt
    }))
  };

  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

  await archive.finalize();
});
```

### Import Implementation

```javascript
// Import from ZIP
fastify.post('/files/import', {
  preHandler: [authenticate]
}, async (request, reply) => {
  const userId = request.user?.userId || request.user?.id;
  const data = await request.file();

  // Extract ZIP
  const zip = await JSZip.loadAsync(data.file);

  // Read manifest
  const manifest = JSON.parse(
    await zip.file('manifest.json').async('string')
  );

  const results = [];

  // Import each file
  for (const fileInfo of manifest.files) {
    try {
      const fileData = await zip.file(fileInfo.name).async('nodebuffer');

      // Upload file
      const result = await uploadFile(userId, fileData, fileInfo);
      results.push({ success: true, file: fileInfo.name });
    } catch (error) {
      results.push({ success: false, file: fileInfo.name, error: error.message });
    }
  }

  return reply.send({
    success: true,
    imported: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  });
});
```

**Implementation Time:** 6-8 hours
**Cost:** Free

---

## 8️⃣ API RATE LIMITING PER SUBSCRIPTION TIER

### Overview
Different rate limits based on user's subscription tier.

### Implementation

```javascript
// Rate limit configuration by tier
const RATE_LIMITS = {
  FREE: {
    uploads: { max: 10, timeWindow: '1 hour' },
    downloads: { max: 50, timeWindow: '1 hour' },
    api: { max: 100, timeWindow: '1 hour' }
  },
  PRO: {
    uploads: { max: 50, timeWindow: '1 hour' },
    downloads: { max: 200, timeWindow: '1 hour' },
    api: { max: 500, timeWindow: '1 hour' }
  },
  PREMIUM: {
    uploads: { max: 500, timeWindow: '1 hour' },
    downloads: { max: 2000, timeWindow: '1 hour' },
    api: { max: 5000, timeWindow: '1 hour' }
  }
};

// Dynamic rate limiter
function getDynamicRateLimit(user) {
  const tier = user.subscriptionTier || 'FREE';
  return RATE_LIMITS[tier];
}

// Apply to routes
fastify.post('/files/upload', {
  preHandler: [authenticate],
  config: {
    rateLimit: {
      max: async (req) => {
        const limits = getDynamicRateLimit(req.user);
        return limits.uploads.max;
      },
      timeWindow: '1 hour',
      keyGenerator: (req) => `upload:${req.user.id}`
    }
  }
}, uploadHandler);
```

### Frontend: Show Tier Limits

```typescript
export function RateLimitDisplay({ user }: { user: User }) {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    apiService.getRateLimitUsage().then(setUsage);
  }, []);

  const limits = RATE_LIMITS[user.subscriptionTier];

  return (
    <div className="rate-limit-display">
      <h3>Usage Limits</h3>

      <div className="limit-item">
        <span>Uploads</span>
        <ProgressBar
          current={usage.uploads}
          max={limits.uploads.max}
        />
        <span>{usage.uploads} / {limits.uploads.max} per hour</span>
      </div>

      <div className="limit-item">
        <span>Downloads</span>
        <ProgressBar
          current={usage.downloads}
          max={limits.downloads.max}
        />
      </div>

      {user.subscriptionTier === 'FREE' && (
        <div className="upgrade-prompt">
          <p>Need more? Upgrade to Pro for 5x higher limits!</p>
          <button>Upgrade Now</button>
        </div>
      )}
    </div>
  );
}
```

**Implementation Time:** 4-5 hours
**Cost:** Free

---

## Summary

| Feature | Implementation Time | Cost/Month | Premium? |
|---------|-------------------|------------|----------|
| Collaboration | 8-10 hours | Free | No |
| Analytics | 10-12 hours | $20-50 | Optional |
| Export/Import | 6-8 hours | Free | No |
| Tiered Limits | 4-5 hours | Free | N/A |

**Total Time:** 28-35 hours
**Total Cost:** $20-50/month (analytics only)
