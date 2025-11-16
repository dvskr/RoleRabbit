/**
 * BE-042: Content scanning for sensitive data (PII, credit cards, SSN)
 */

const logger = require('./logger');

// Optional dependencies for PDF/DOCX text extraction
let pdfParse = null;
let mammoth = null;

try {
  pdfParse = require('pdf-parse');
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('PDF text extraction available');
  }
} catch (error) {
  // Only warn if actually missing (not just module resolution issue)
  if (error.code === 'MODULE_NOT_FOUND') {
    logger.warn('pdf-parse not installed. PDF text extraction will be limited. Run: npm install pdf-parse');
  } else {
    // Other errors (like require issues) - just log at debug level
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('pdf-parse require issue:', error.message);
    }
  }
}

try {
  mammoth = require('mammoth');
  if (process.env.NODE_ENV !== 'production') {
    logger.debug('DOCX text extraction available');
  }
} catch (error) {
  // Only warn if actually missing (not just module resolution issue)
  if (error.code === 'MODULE_NOT_FOUND') {
    logger.warn('mammoth not installed. DOCX text extraction will be limited. Run: npm install mammoth');
  } else {
    // Other errors (like require issues) - just log at debug level
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('mammoth require issue:', error.message);
    }
  }
}

// Regex patterns for sensitive data detection
const SENSITIVE_PATTERNS = {
  // US Social Security Number (SSN): XXX-XX-XXXX
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  
  // Credit card numbers (various formats)
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  
  // Email addresses (basic)
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Phone numbers (US format)
  phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  
  // Bank account numbers (basic - 8-17 digits)
  bankAccount: /\b\d{8,17}\b/g,
  
  // Driver's license (varies by state, basic pattern)
  driversLicense: /\b[A-Z]{1,2}\d{6,9}\b/g,
  
  // Passport numbers (varies by country)
  passport: /\b[A-Z]{1,2}\d{6,9}\b/g
};

/**
 * Check if text contains sensitive data
 */
function scanTextForSensitiveData(text) {
  if (!text || typeof text !== 'string') {
    return { hasSensitiveData: false, findings: [] };
  }

  const findings = [];
  
  for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      findings.push({
        type,
        count: matches.length,
        samples: matches.slice(0, 3) // Only log first 3 samples
      });
    }
  }
  
  return {
    hasSensitiveData: findings.length > 0,
    findings
  };
}

/**
 * Scan file buffer for sensitive data
 * Supports text-based files (PDF, DOCX, TXT, etc.)
 */
async function scanFileForSensitiveData(fileBuffer, contentType, fileName) {
  const results = {
    hasSensitiveData: false,
    findings: [],
    scanned: false
  };

  try {
    // Only scan text-based content types
    const textContentTypes = [
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml'
    ];

    const isTextFile = textContentTypes.some(type => contentType?.includes(type));
    
    // For PDF and DOCX, we'd need a library to extract text
    // For now, we'll scan if it's a text file
    if (isTextFile) {
      const text = fileBuffer.toString('utf-8');
      const scanResult = scanTextForSensitiveData(text);
      results.hasSensitiveData = scanResult.hasSensitiveData;
      results.findings = scanResult.findings;
      results.scanned = true;
    } else if (contentType?.includes('pdf')) {
      // Extract text from PDF using pdf-parse
      if (pdfParse) {
        try {
          const pdfData = await pdfParse(fileBuffer);
          const text = pdfData.text || '';
          const scanResult = scanTextForSensitiveData(text);
          if (scanResult.hasSensitiveData) {
            results.hasSensitiveData = true;
            results.findings = scanResult.findings;
            results.scanned = true;
          } else {
            results.scanned = true;
            results.message = 'PDF scanned successfully, no sensitive data found';
          }
        } catch (error) {
          logger.error('Error extracting text from PDF:', error);
          // Fallback to basic scan
          const text = fileBuffer.toString('utf-8', 0, Math.min(fileBuffer.length, 10000));
          const scanResult = scanTextForSensitiveData(text);
          if (scanResult.hasSensitiveData) {
            results.hasSensitiveData = true;
            results.findings = scanResult.findings;
            results.scanned = true;
            results.warning = 'PDF text extraction failed, basic scan performed';
          } else {
            results.scanned = false;
            results.warning = 'PDF text extraction failed, unable to scan';
          }
        }
      } else {
        // Fallback to basic scan if pdf-parse not available
        const text = fileBuffer.toString('utf-8', 0, Math.min(fileBuffer.length, 10000));
        const scanResult = scanTextForSensitiveData(text);
        if (scanResult.hasSensitiveData) {
          results.hasSensitiveData = true;
          results.findings = scanResult.findings;
          results.scanned = true;
          results.warning = 'pdf-parse not installed, basic scan performed';
        } else {
          results.scanned = false;
          results.message = 'pdf-parse not installed, unable to extract PDF text';
        }
      }
    } else if (contentType?.includes('wordprocessingml') || contentType?.includes('msword')) {
      // Extract text from DOCX using mammoth
      if (mammoth && contentType?.includes('wordprocessingml')) {
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          const text = result.value || '';
          const scanResult = scanTextForSensitiveData(text);
          if (scanResult.hasSensitiveData) {
            results.hasSensitiveData = true;
            results.findings = scanResult.findings;
            results.scanned = true;
          } else {
            results.scanned = true;
            results.message = 'DOCX scanned successfully, no sensitive data found';
          }
        } catch (error) {
          logger.error('Error extracting text from DOCX:', error);
          results.scanned = false;
          results.warning = 'DOCX text extraction failed, unable to scan';
        }
      } else if (contentType?.includes('msword')) {
        // DOC (old format) - mammoth doesn't support it, skip
        results.scanned = false;
        results.message = 'DOC (old format) text extraction not supported. Please convert to DOCX.';
      } else {
        results.scanned = false;
        results.message = 'mammoth not installed, unable to extract DOCX text';
      }
    } else {
      // For binary files, we can't easily scan
      results.scanned = false;
      results.message = 'Binary file type. Sensitive data scan skipped.';
    }
  } catch (error) {
    logger.error('Error scanning file for sensitive data:', error);
    results.error = error.message;
    results.scanned = false;
  }

  return results;
}

/**
 * Check if file should be blocked due to sensitive data
 * BE-042: Content scanning for sensitive data
 */
async function shouldBlockFileForSensitiveData(fileBuffer, contentType, fileName) {
  const scanResult = await scanFileForSensitiveData(fileBuffer, contentType, fileName);
  
  if (scanResult.hasSensitiveData) {
    logger.warn(`File ${fileName} contains sensitive data:`, scanResult.findings);
    
    // In production, you might want to:
    // 1. Block the file
    // 2. Encrypt the file
    // 3. Alert security team
    // 4. Log to audit system
    
    // For now, we'll log but not block (configurable)
    const BLOCK_ON_SENSITIVE_DATA = process.env.BLOCK_FILES_WITH_SENSITIVE_DATA === 'true';
    
    if (BLOCK_ON_SENSITIVE_DATA) {
      return {
        shouldBlock: true,
        reason: 'File contains sensitive data (PII, credit cards, SSN, etc.)',
        findings: scanResult.findings
      };
    }
  }
  
  return {
    shouldBlock: false,
    findings: scanResult.findings
  };
}

module.exports = {
  scanFileForSensitiveData,
  scanTextForSensitiveData,
  shouldBlockFileForSensitiveData
};

