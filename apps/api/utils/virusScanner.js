/**
 * BE-041: Virus scanning integration for uploaded files
 * Supports ClamAV (local) and cloud services (optional)
 */

const logger = require('./logger');
const { ERROR_CODES } = require('./errorCodes');

// Check if ClamAV is available
let clamavAvailable = false;
let ClamAV = null;

try {
  // Try to require node-clam (ClamAV wrapper)
  // Note: The package name might be 'clamav' or 'node-clam'
  try {
    ClamAV = require('clamav');
    clamavAvailable = true;
    logger.info('ClamAV integration available (clamav package)');
  } catch (e1) {
    try {
      ClamAV = require('node-clam');
      clamavAvailable = true;
      logger.info('ClamAV integration available (node-clam package)');
    } catch (e2) {
      throw new Error('Neither clamav nor node-clam package found');
    }
  }
} catch (error) {
  // ClamAV is optional - this is expected if not installed
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('ClamAV not available. Virus scanning will be disabled. Install clamav or node-clam package for virus scanning.');
  }
}

// Cloud service configuration (optional)
const CLOUD_SCAN_ENABLED = process.env.ENABLE_CLOUD_VIRUS_SCAN === 'true';
const CLOUD_SCAN_API_KEY = process.env.CLOUD_VIRUS_SCAN_API_KEY;
const CLOUD_SCAN_API_URL = process.env.CLOUD_VIRUS_SCAN_API_URL;

/**
 * Scan file for viruses using ClamAV
 */
async function scanWithClamAV(fileBuffer) {
  if (!clamavAvailable || !ClamAV) {
    return { clean: true, scanner: 'none', message: 'ClamAV not available' };
  }

  try {
    // Connect to ClamAV daemon (default: localhost:3310)
    const host = process.env.CLAMAV_HOST || 'localhost';
    const port = parseInt(process.env.CLAMAV_PORT || '3310');
    
    // Handle different ClamAV package APIs
    let result;
    if (typeof ClamAV.createScanner === 'function') {
      // node-clam API
      const scanner = await ClamAV.createScanner(host, port);
      result = await scanner.scanBuffer(fileBuffer);
    } else if (typeof ClamAV.scanBuffer === 'function') {
      // Alternative API
      result = await ClamAV.scanBuffer(fileBuffer, { host, port });
    } else {
      // Fallback: try direct connection
      const scanner = new ClamAV(host, port);
      result = await scanner.scanBuffer(fileBuffer);
    }
    
    if (result.isInfected) {
      return {
        clean: false,
        scanner: 'clamav',
        infected: true,
        viruses: result.viruses || [],
        message: `File is infected: ${result.viruses?.join(', ') || 'Unknown virus'}`
      };
    }
    
    return {
      clean: true,
      scanner: 'clamav',
      message: 'File is clean'
    };
  } catch (error) {
    logger.error('ClamAV scan error:', error);
    // Don't fail upload if scanner is unavailable - log and allow
    return {
      clean: true,
      scanner: 'clamav',
      error: error.message,
      message: 'Virus scanner unavailable, file allowed (logged)'
    };
  }
}

/**
 * Scan file using cloud service (e.g., VirusTotal, MetaDefender)
 */
async function scanWithCloudService(fileBuffer, fileName) {
  if (!CLOUD_SCAN_ENABLED || !CLOUD_SCAN_API_KEY || !CLOUD_SCAN_API_URL) {
    return { clean: true, scanner: 'none', message: 'Cloud scanning not configured' };
  }

  try {
    const fetch = require('node-fetch');
    const FormData = require('form-data');
    
    const form = new FormData();
    form.append('file', fileBuffer, fileName);
    
    const response = await fetch(CLOUD_SCAN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUD_SCAN_API_KEY}`,
        ...form.getHeaders()
      },
      body: form,
      timeout: 30000 // 30 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Cloud scan failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Adjust based on your cloud service response format
    const isClean = result.status === 'clean' || result.clean === true;
    
    if (!isClean) {
      return {
        clean: false,
        scanner: 'cloud',
        infected: true,
        threats: result.threats || [],
        message: `File is infected: ${result.threats?.join(', ') || 'Unknown threat'}`
      };
    }
    
    return {
      clean: true,
      scanner: 'cloud',
      message: 'File is clean'
    };
  } catch (error) {
    logger.error('Cloud scan error:', error);
    // Don't fail upload if scanner is unavailable - log and allow
    return {
      clean: true,
      scanner: 'cloud',
      error: error.message,
      message: 'Cloud scanner unavailable, file allowed (logged)'
    };
  }
}

/**
 * Scan file for viruses
 * BE-041: Virus scanning integration
 */
async function scanFile(fileBuffer, fileName) {
  // Try ClamAV first (local, faster)
  const clamavResult = await scanWithClamAV(fileBuffer);
  
  if (!clamavResult.clean) {
    return clamavResult; // File is infected, reject
  }
  
  // If ClamAV is not available and cloud scanning is enabled, try cloud service
  if (clamavResult.scanner === 'none' && CLOUD_SCAN_ENABLED) {
    const cloudResult = await scanWithCloudService(fileBuffer, fileName);
    return cloudResult;
  }
  
  return clamavResult;
}

module.exports = {
  scanFile,
  scanWithClamAV,
  scanWithCloudService
};

