/**
 * BE-049: File content validation to prevent malicious files
 * Detects PDF exploits, malicious scripts, etc.
 */

const logger = require('./logger');

// Known malicious patterns
const MALICIOUS_PATTERNS = {
  // PDF exploits
  pdfExploit: /\/JavaScript|\/JS|\/OpenAction|\/Launch/i,
  
  // Executable content in non-executable files
  executableInText: /MZ\x90\x00|PE\x00\x00|ELF|#!/,
  
  // Script injection attempts
  scriptInjection: /<script[^>]*>|javascript:|on\w+\s*=/i,
  
  // Suspicious file headers
  suspiciousHeader: /PK\x03\x04.*\.(exe|bat|cmd|scr|vbs|js|jar)/i
};

/**
 * Check if file content appears malicious
 * BE-049: File content validation to prevent malicious files
 */
function detectMaliciousContent(fileBuffer, contentType, fileName) {
  const results = {
    isMalicious: false,
    threats: [],
    warnings: []
  };

  try {
    // Convert buffer to string for pattern matching (first 10KB)
    const sample = fileBuffer.slice(0, Math.min(10000, fileBuffer.length));
    const text = sample.toString('utf-8', 0, sample.length);

    // Check PDF files for JavaScript/exploits
    if (contentType?.includes('pdf') || fileName?.toLowerCase().endsWith('.pdf')) {
      if (MALICIOUS_PATTERNS.pdfExploit.test(text)) {
        results.isMalicious = true;
        results.threats.push('PDF contains JavaScript or auto-execution code');
      }
    }

    // Check for executable content in text files
    if (contentType?.includes('text') || contentType?.includes('json') || contentType?.includes('xml')) {
      if (MALICIOUS_PATTERNS.executableInText.test(sample)) {
        results.isMalicious = true;
        results.threats.push('Text file contains executable content');
      }
    }

    // Check for script injection
    if (MALICIOUS_PATTERNS.scriptInjection.test(text)) {
      results.warnings.push('File contains potential script injection patterns');
      // Only mark as malicious if it's a text-based file
      if (contentType?.includes('text') || contentType?.includes('html') || contentType?.includes('xml')) {
        results.isMalicious = true;
        results.threats.push('File contains script injection patterns');
      }
    }

    // Check file header for suspicious patterns
    if (MALICIOUS_PATTERNS.suspiciousHeader.test(sample)) {
      results.warnings.push('File header suggests executable content');
    }

    // Additional checks based on file type
    if (contentType?.includes('zip') || fileName?.toLowerCase().endsWith('.zip')) {
      // Check for zip bombs (extremely compressed files)
      const compressionRatio = fileBuffer.length / (text.length || 1);
      if (compressionRatio > 1000) {
        results.warnings.push('File has suspiciously high compression ratio (possible zip bomb)');
      }
    }

  } catch (error) {
    logger.error('Error detecting malicious content:', error);
    // Don't block file if detection fails
    results.warnings.push('Malicious content detection failed, file allowed');
  }

  return results;
}

/**
 * Check if file should be blocked as malicious
 * BE-049: File content validation to prevent malicious files
 */
function shouldBlockMaliciousFile(fileBuffer, contentType, fileName) {
  const detection = detectMaliciousContent(fileBuffer, contentType, fileName);
  
  if (detection.isMalicious) {
    logger.warn(`File ${fileName} detected as malicious:`, detection.threats);
    return {
      shouldBlock: true,
      reason: 'File contains malicious content',
      threats: detection.threats,
      warnings: detection.warnings
    };
  }

  return {
    shouldBlock: false,
    warnings: detection.warnings
  };
}

module.exports = {
  detectMaliciousContent,
  shouldBlockMaliciousFile
};

