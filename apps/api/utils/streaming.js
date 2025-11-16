/**
 * Streaming Utility
 * 
 * Stream large files and data to reduce memory usage.
 * Supports file streaming, JSON streaming, and SSE.
 */

const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const pipelineAsync = promisify(pipeline);

/**
 * Stream file to response
 * More memory-efficient than loading entire file
 */
async function streamFile(filePath, res, options = {}) {
  const {
    contentType = 'application/octet-stream',
    fileName = path.basename(filePath),
    inline = false,
    onError = null
  } = options;

  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    // Get file stats
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileSize);
    res.setHeader(
      'Content-Disposition',
      `${inline ? 'inline' : 'attachment'}; filename="${fileName}"`
    );

    // Create read stream
    const fileStream = fs.createReadStream(filePath);

    // Handle errors
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (onError) {
        onError(error);
      } else if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream file'
        });
      }
    });

    // Pipe file to response
    await pipelineAsync(fileStream, res);
  } catch (error) {
    console.error('Stream file error:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

/**
 * Stream PDF export
 */
async function streamPDFExport(pdfPath, res, fileName = 'resume.pdf') {
  return streamFile(pdfPath, res, {
    contentType: 'application/pdf',
    fileName,
    inline: false
  });
}

/**
 * Stream DOCX export
 */
async function streamDOCXExport(docxPath, res, fileName = 'resume.docx') {
  return streamFile(docxPath, res, {
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileName,
    inline: false
  });
}

/**
 * Stream large JSON response
 * Useful for large arrays
 */
class JSONStream {
  constructor(res) {
    this.res = res;
    this.first = true;
    this.started = false;
  }

  start() {
    if (this.started) return;
    this.res.setHeader('Content-Type', 'application/json');
    this.res.write('[');
    this.started = true;
  }

  write(item) {
    if (!this.started) this.start();
    
    if (!this.first) {
      this.res.write(',');
    }
    this.first = false;
    this.res.write(JSON.stringify(item));
  }

  end() {
    if (!this.started) this.start();
    this.res.write(']');
    this.res.end();
  }

  error(error) {
    if (!this.started) {
      this.res.status(500).json({
        success: false,
        error: error.message
      });
    } else {
      this.res.end();
    }
  }
}

/**
 * Stream database query results
 * Processes results in batches to reduce memory usage
 */
async function streamQueryResults(query, res, options = {}) {
  const {
    batchSize = 100,
    transform = (item) => item
  } = options;

  const jsonStream = new JSONStream(res);

  try {
    jsonStream.start();

    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const batch = await query({
        take: batchSize,
        skip: offset
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      for (const item of batch) {
        jsonStream.write(transform(item));
      }

      offset += batchSize;
      hasMore = batch.length === batchSize;
    }

    jsonStream.end();
  } catch (error) {
    console.error('Stream query error:', error);
    jsonStream.error(error);
  }
}

/**
 * Server-Sent Events (SSE) for real-time updates
 */
class SSEStream {
  constructor(res) {
    this.res = res;
    this.id = 0;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    
    // Send initial comment to establish connection
    res.write(':ok\n\n');
  }

  /**
   * Send event to client
   */
  send(event, data) {
    this.id++;
    
    const message = [
      `id: ${this.id}`,
      `event: ${event}`,
      `data: ${JSON.stringify(data)}`,
      '\n'
    ].join('\n');
    
    this.res.write(message);
  }

  /**
   * Send progress update
   */
  progress(current, total, message = '') {
    this.send('progress', {
      current,
      total,
      percentage: Math.round((current / total) * 100),
      message
    });
  }

  /**
   * Send completion event
   */
  complete(data) {
    this.send('complete', data);
    this.close();
  }

  /**
   * Send error event
   */
  error(error) {
    this.send('error', {
      message: error.message,
      code: error.code
    });
    this.close();
  }

  /**
   * Close connection
   */
  close() {
    this.res.end();
  }
}

/**
 * Stream large export with progress
 */
async function streamExportWithProgress(exportFn, res, options = {}) {
  const {
    steps = [],
    onProgress = null
  } = options;

  const sse = new SSEStream(res);

  try {
    let currentStep = 0;
    const totalSteps = steps.length;

    for (const step of steps) {
      currentStep++;
      
      // Send progress
      sse.progress(currentStep, totalSteps, step.message);
      
      if (onProgress) {
        onProgress(currentStep, totalSteps, step.message);
      }

      // Execute step
      await step.fn();
    }

    // Execute final export
    const result = await exportFn();
    
    // Send completion
    sse.complete(result);
  } catch (error) {
    console.error('Export stream error:', error);
    sse.error(error);
  }
}

/**
 * Middleware: Enable streaming for route
 */
function streamingMiddleware(req, res, next) {
  // Add streaming helpers to response
  res.streamFile = (filePath, options) => streamFile(filePath, res, options);
  res.streamPDF = (pdfPath, fileName) => streamPDFExport(pdfPath, res, fileName);
  res.streamDOCX = (docxPath, fileName) => streamDOCXExport(docxPath, res, fileName);
  res.streamJSON = () => new JSONStream(res);
  res.streamSSE = () => new SSEStream(res);
  
  next();
}

module.exports = {
  streamFile,
  streamPDFExport,
  streamDOCXExport,
  JSONStream,
  streamQueryResults,
  SSEStream,
  streamExportWithProgress,
  streamingMiddleware
};

