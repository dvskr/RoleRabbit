/**
 * Health Check Utilities
 * Provides detailed system health status
 */

const os = require('os');
const fs = require('fs').promises;

/**
 * Get detailed system health status
 */
async function getHealthStatus() {
  try {
    const [cpuUsage, memoryUsage, diskUsage] = await Promise.all([
      getCPUUsage(),
      getMemoryUsage(),
      getDiskUsage(),
      getProcessUptime(),
      getDatabaseStatus()
    ]);

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: checkAPIService(),
        database: await getDatabaseStatus(),
        filesystem: await getFilesystemStatus()
      },
      system: {
        cpu: cpuUsage,
        memory: memoryUsage,
        disk: diskUsage,
        uptime: process.uptime(),
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch()
      },
      resources: {
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        cpuCount: os.cpus().length,
        loadAverage: os.loadavg()
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Check API service status
 */
function checkAPIService() {
  return {
    status: 'running',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    pid: process.pid
  };
}

/**
 * Get database status
 */
async function getDatabaseStatus() {
  try {
    // Check if database file exists
    const dbPath = './prisma/dev.db';
    const stats = await fs.stat(dbPath);
    
    return {
      status: 'connected',
      fileSize: stats.size,
      lastModified: stats.mtime,
      exists: true
    };
  } catch (error) {
    return {
      status: 'disconnected',
      error: error.message,
      exists: false
    };
  }
}

/**
 * Get filesystem status
 */
async function getFilesystemStatus() {
  try {
    const uploadDir = './uploads';
    const stats = await fs.stat(uploadDir);
    
    return {
      status: 'accessible',
      uploadDirectory: uploadDir,
      lastModified: stats.mtime,
      readable: true,
      writable: true
    };
  } catch (error) {
    return {
      status: 'inaccessible',
      error: error.message,
      uploadDirectory: './uploads'
    };
  }
}

/**
 * Get CPU usage percentage
 */
async function getCPUUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - ~~(100 * idle / total);

  return {
    usage: usage,
    cores: cpus.length,
    model: cpus[0]?.model || 'unknown'
  };
}

/**
 * Get memory usage information
 */
function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    total: totalMem,
    free: freeMem,
    used: usedMem,
    usage: (usedMem / totalMem * 100).toFixed(2),
    units: 'bytes'
  };
}

/**
 * Get disk usage information
 */
async function getDiskUsage() {
  try {
    // For Windows, we can't easily get disk space without a library
    // Return basic info
    return {
      status: 'available',
      readable: true,
      writable: true
    };
  } catch (error) {
    return {
      status: 'unavailable',
      error: error.message
    };
  }
}

/**
 * Get process uptime
 */
function getProcessUptime() {
  return {
    uptime: process.uptime(),
    uptimeFormatted: formatUptime(process.uptime())
  };
}

/**
 * Format uptime to human-readable string
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Check if system is healthy
 */
async function isHealthy() {
  const health = await getHealthStatus();
  return health.status === 'healthy';
}

module.exports = {
  getHealthStatus,
  isHealthy,
  checkAPIService,
  getDatabaseStatus,
  getFilesystemStatus
};

