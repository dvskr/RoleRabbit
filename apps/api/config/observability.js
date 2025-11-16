/**
 * Observability Configuration
 * INFRA-021 to INFRA-029: Logs, Metrics, and Tracing
 */

const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Request ID tracking (INFRA-029)
const requestIdMap = new Map();

/**
 * INFRA-029: Generate and track request ID for file operations
 */
function generateRequestId() {
  return uuidv4();
}

function setRequestId(requestId) {
  requestIdMap.set(requestId, {
    id: requestId,
    timestamp: Date.now()
  });
}

function getRequestId() {
  // Try to get from async local storage or context
  // For now, use a simple approach
  return null; // Will be set per request
}

/**
 * INFRA-021: Structured logging for all file operations
 */
class FileOperationLogger {
  constructor(requestId = null) {
    this.requestId = requestId || generateRequestId();
  }

  logOperation(operation, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      operation,
      ...details,
      level: 'info'
    };
    
    logger.info(`[FileOperation] ${operation}`, logEntry);
    return logEntry;
  }

  logUpload(userId, fileId, fileName, size, contentType) {
    return this.logOperation('upload', {
      userId,
      fileId,
      fileName,
      size,
      contentType,
      // INFRA-028: Don't log file content
      metadata: { size, contentType } // Only safe metadata
    });
  }

  logDownload(userId, fileId, fileName) {
    return this.logOperation('download', {
      userId,
      fileId,
      fileName
    });
  }

  logDelete(userId, fileId, fileName, permanent = false) {
    return this.logOperation(permanent ? 'delete_permanent' : 'delete', {
      userId,
      fileId,
      fileName,
      permanent
    });
  }

  logShare(userId, fileId, sharedWith, permission) {
    return this.logOperation('share', {
      userId,
      fileId,
      sharedWith,
      permission
      // INFRA-028: Don't log sensitive share details
    });
  }

  logPermissionChange(userId, fileId, permission, changedBy) {
    return this.logOperation('permission_change', {
      userId,
      fileId,
      permission,
      changedBy
    });
  }

  logError(operation, error, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      operation,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      ...context,
      level: 'error'
    };
    
    logger.error(`[FileOperation] ${operation} failed`, logEntry);
    return logEntry;
  }
}

/**
 * INFRA-022: Metrics for file operations
 */
class FileMetrics {
  constructor() {
    this.metrics = {
      uploads: {
        count: 0,
        totalSize: 0,
        errors: 0,
        durations: []
      },
      downloads: {
        count: 0,
        totalSize: 0,
        errors: 0,
        durations: []
      },
      deletes: {
        count: 0,
        errors: 0
      },
      shares: {
        count: 0,
        errors: 0
      },
      storageUsage: {
        totalBytes: 0,
        userCount: 0
      },
      errorRates: {
        upload: 0,
        download: 0,
        delete: 0,
        share: 0
      }
    };
  }

  recordUpload(size, duration, success = true) {
    this.metrics.uploads.count++;
    if (success) {
      this.metrics.uploads.totalSize += size;
      this.metrics.uploads.durations.push(duration);
    } else {
      this.metrics.uploads.errors++;
    }
    this.updateErrorRate('upload');
  }

  recordDownload(size, duration, success = true) {
    this.metrics.downloads.count++;
    if (success) {
      this.metrics.downloads.totalSize += size;
      this.metrics.downloads.durations.push(duration);
    } else {
      this.metrics.downloads.errors++;
    }
    this.updateErrorRate('download');
  }

  recordDelete(success = true) {
    this.metrics.deletes.count++;
    if (!success) {
      this.metrics.deletes.errors++;
    }
    this.updateErrorRate('delete');
  }

  recordShare(success = true) {
    this.metrics.shares.count++;
    if (!success) {
      this.metrics.shares.errors++;
    }
    this.updateErrorRate('share');
  }

  updateStorageUsage(totalBytes, userCount) {
    this.metrics.storageUsage.totalBytes = totalBytes;
    this.metrics.storageUsage.userCount = userCount;
  }

  updateErrorRate(operation) {
    const opMetrics = this.metrics[`${operation}s`] || this.metrics.shares;
    const total = opMetrics.count;
    const errors = opMetrics.errors;
    this.metrics.errorRates[operation] = total > 0 ? (errors / total) * 100 : 0;
  }

  getMetrics() {
    return {
      ...this.metrics,
      averages: {
        uploadDuration: this.metrics.uploads.durations.length > 0
          ? this.metrics.uploads.durations.reduce((a, b) => a + b, 0) / this.metrics.uploads.durations.length
          : 0,
        downloadDuration: this.metrics.downloads.durations.length > 0
          ? this.metrics.downloads.durations.reduce((a, b) => a + b, 0) / this.metrics.downloads.durations.length
          : 0
      }
    };
  }

  reset() {
    this.metrics = {
      uploads: { count: 0, totalSize: 0, errors: 0, durations: [] },
      downloads: { count: 0, totalSize: 0, errors: 0, durations: [] },
      deletes: { count: 0, errors: 0 },
      shares: { count: 0, errors: 0 },
      storageUsage: { totalBytes: 0, userCount: 0 },
      errorRates: { upload: 0, download: 0, delete: 0, share: 0 }
    };
  }
}

const fileMetrics = new FileMetrics();

/**
 * INFRA-023: Distributed tracing for file operations (OpenTelemetry)
 */
class FileTracer {
  constructor() {
    this.traces = new Map();
  }

  startTrace(operation, context = {}) {
    const traceId = generateRequestId();
    const spanId = generateRequestId();
    
    const trace = {
      traceId,
      spanId,
      operation,
      startTime: Date.now(),
      context: {
        ...context,
        requestId: generateRequestId()
      },
      spans: []
    };
    
    this.traces.set(traceId, trace);
    return { traceId, spanId };
  }

  addSpan(traceId, spanName, duration, metadata = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    trace.spans.push({
      name: spanName,
      duration,
      metadata,
      timestamp: Date.now()
    });
  }

  endTrace(traceId, success = true) {
    const trace = this.traces.get(traceId);
    if (!trace) return null;
    
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    trace.success = success;
    
    // Log trace
    logger.info(`[Trace] ${trace.operation}`, {
      traceId,
      duration: trace.duration,
      success,
      spans: trace.spans.length
    });
    
    // Export to OpenTelemetry collector if configured
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      // TODO: Export to OpenTelemetry
      logger.debug('OpenTelemetry export not yet implemented');
    }
    
    this.traces.delete(traceId);
    return trace;
  }
}

const fileTracer = new FileTracer();

/**
 * INFRA-027: Performance monitoring for file upload/download speeds
 */
class PerformanceMonitor {
  recordUploadSpeed(fileSize, duration) {
    const speedMBps = (fileSize / (1024 * 1024)) / (duration / 1000);
    logger.debug(`Upload speed: ${speedMBps.toFixed(2)} MB/s`);
    return speedMBps;
  }

  recordDownloadSpeed(fileSize, duration) {
    const speedMBps = (fileSize / (1024 * 1024)) / (duration / 1000);
    logger.debug(`Download speed: ${speedMBps.toFixed(2)} MB/s`);
    return speedMBps;
  }
}

const performanceMonitor = new PerformanceMonitor();

module.exports = {
  FileOperationLogger,
  fileMetrics,
  FileTracer,
  fileTracer,
  PerformanceMonitor,
  performanceMonitor,
  generateRequestId,
  setRequestId,
  getRequestId
};

