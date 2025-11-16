/**
 * Virus Scanning Utility
 * 
 * Scans uploaded files for viruses and malware.
 * Supports ClamAV (local) and VirusTotal API (cloud).
 */

const fs = require('fs');
const crypto = require('crypto');

/**
 * Scan result status
 */
const ScanStatus = {
  CLEAN: 'CLEAN',
  INFECTED: 'INFECTED',
  ERROR: 'ERROR',
  SKIPPED: 'SKIPPED'
};

/**
 * Calculate file hash (SHA-256)
 */
function calculateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * Scan file with ClamAV (local scanner)
 * Requires ClamAV to be installed and running
 */
async function scanWithClamAV(filePath) {
  try {
    const NodeClam = require('clamscan');
    
    const clamscan = await new NodeClam().init({
      removeInfected: false,
      quarantineInfected: false,
      scanLog: null,
      debugMode: false,
      clamdscan: {
        socket: process.env.CLAMAV_SOCKET || '/var/run/clamav/clamd.ctl',
        host: process.env.CLAMAV_HOST || 'localhost',
        port: process.env.CLAMAV_PORT || 3310,
        timeout: 60000
      }
    });

    const { isInfected, viruses } = await clamscan.isInfected(filePath);

    if (isInfected) {
      return {
        status: ScanStatus.INFECTED,
        scanner: 'ClamAV',
        viruses,
        message: `File is infected: ${viruses.join(', ')}`
      };
    }

    return {
      status: ScanStatus.CLEAN,
      scanner: 'ClamAV',
      message: 'File is clean'
    };
  } catch (error) {
    console.error('ClamAV scan error:', error);
    return {
      status: ScanStatus.ERROR,
      scanner: 'ClamAV',
      error: error.message,
      message: 'Virus scan failed'
    };
  }
}

/**
 * Scan file with VirusTotal API (cloud scanner)
 * Requires VIRUSTOTAL_API_KEY environment variable
 */
async function scanWithVirusTotal(filePath) {
  try {
    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      console.warn('VirusTotal API key not configured');
      return {
        status: ScanStatus.SKIPPED,
        scanner: 'VirusTotal',
        message: 'VirusTotal not configured'
      };
    }

    // Calculate file hash
    const fileHash = await calculateFileHash(filePath);

    // Check if file already scanned (hash lookup)
    const lookupResponse = await fetch(
      `https://www.virustotal.com/api/v3/files/${fileHash}`,
      {
        headers: {
          'x-apikey': apiKey
        }
      }
    );

    if (lookupResponse.ok) {
      const data = await lookupResponse.json();
      const stats = data.data.attributes.last_analysis_stats;
      
      if (stats.malicious > 0) {
        return {
          status: ScanStatus.INFECTED,
          scanner: 'VirusTotal',
          detections: stats.malicious,
          totalScanners: Object.values(stats).reduce((a, b) => a + b, 0),
          message: `File detected as malicious by ${stats.malicious} scanners`
        };
      }

      return {
        status: ScanStatus.CLEAN,
        scanner: 'VirusTotal',
        detections: 0,
        totalScanners: Object.values(stats).reduce((a, b) => a + b, 0),
        message: 'File is clean'
      };
    }

    // File not in database, upload for scanning
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const uploadResponse = await fetch(
      'https://www.virustotal.com/api/v3/files',
      {
        method: 'POST',
        headers: {
          'x-apikey': apiKey
        },
        body: form
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`VirusTotal upload failed: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();
    const analysisId = uploadData.data.id;

    // Wait for analysis (with timeout)
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      const analysisResponse = await fetch(
        `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
        {
          headers: {
            'x-apikey': apiKey
          }
        }
      );

      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        const status = analysisData.data.attributes.status;

        if (status === 'completed') {
          const stats = analysisData.data.attributes.stats;
          
          if (stats.malicious > 0) {
            return {
              status: ScanStatus.INFECTED,
              scanner: 'VirusTotal',
              detections: stats.malicious,
              totalScanners: Object.values(stats).reduce((a, b) => a + b, 0),
              message: `File detected as malicious by ${stats.malicious} scanners`
            };
          }

          return {
            status: ScanStatus.CLEAN,
            scanner: 'VirusTotal',
            detections: 0,
            totalScanners: Object.values(stats).reduce((a, b) => a + b, 0),
            message: 'File is clean'
          };
        }
      }

      attempts++;
    }

    // Timeout
    return {
      status: ScanStatus.ERROR,
      scanner: 'VirusTotal',
      message: 'Analysis timeout'
    };
  } catch (error) {
    console.error('VirusTotal scan error:', error);
    return {
      status: ScanStatus.ERROR,
      scanner: 'VirusTotal',
      error: error.message,
      message: 'Virus scan failed'
    };
  }
}

/**
 * Basic file validation
 * Checks file type, size, and extension
 */
function validateFile(filePath, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB
    allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'],
    allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ]
  } = options;

  try {
    // Check file exists
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        error: 'File not found'
      };
    }

    // Check file size
    const stats = fs.statSync(filePath);
    if (stats.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      };
    }

    // Check extension
    const ext = require('path').extname(filePath).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      };
    }

    // Check MIME type (basic check)
    // For production, use a library like 'file-type'

    return {
      valid: true,
      size: stats.size,
      extension: ext
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Scan uploaded file
 * Uses available scanner (ClamAV or VirusTotal)
 */
async function scanUploadedFile(filePath, options = {}) {
  const {
    scanner = process.env.VIRUS_SCANNER || 'clamav', // 'clamav' or 'virustotal'
    skipValidation = false
  } = options;

  try {
    // Basic file validation
    if (!skipValidation) {
      const validation = validateFile(filePath, options);
      if (!validation.valid) {
        return {
          status: ScanStatus.ERROR,
          message: validation.error
        };
      }
    }

    // Scan with selected scanner
    let result;
    if (scanner === 'virustotal') {
      result = await scanWithVirusTotal(filePath);
    } else {
      result = await scanWithClamAV(filePath);
    }

    // Log scan result
    console.log('Virus scan result:', {
      file: filePath,
      scanner: result.scanner,
      status: result.status,
      message: result.message
    });

    return result;
  } catch (error) {
    console.error('File scan error:', error);
    return {
      status: ScanStatus.ERROR,
      error: error.message,
      message: 'Failed to scan file'
    };
  }
}

/**
 * Middleware: Scan uploaded file before processing
 */
function virusScanMiddleware(options = {}) {
  return async (req, res, next) => {
    try {
      // Check if file uploaded
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      const scanResults = [];

      for (const file of files) {
        if (!file) continue;

        const result = await scanUploadedFile(file.path, options);
        scanResults.push({ file: file.originalname, result });

        if (result.status === ScanStatus.INFECTED) {
          // Delete infected file
          try {
            fs.unlinkSync(file.path);
          } catch (error) {
            console.error('Failed to delete infected file:', error);
          }

          return res.status(400).json({
            success: false,
            error: 'File rejected: Virus or malware detected',
            code: 'FILE_INFECTED',
            details: {
              file: file.originalname,
              scanner: result.scanner,
              message: result.message
            }
          });
        }

        if (result.status === ScanStatus.ERROR && !options.allowOnError) {
          return res.status(500).json({
            success: false,
            error: 'File scan failed. Please try again.',
            code: 'SCAN_FAILED'
          });
        }
      }

      // Attach scan results to request
      req.virusScanResults = scanResults;
      next();
    } catch (error) {
      console.error('Virus scan middleware error:', error);
      
      if (options.allowOnError) {
        // Continue on error
        next();
      } else {
        return res.status(500).json({
          success: false,
          error: 'File security check failed',
          code: 'SCAN_ERROR'
        });
      }
    }
  };
}

module.exports = {
  ScanStatus,
  scanUploadedFile,
  scanWithClamAV,
  scanWithVirusTotal,
  validateFile,
  calculateFileHash,
  virusScanMiddleware
};

