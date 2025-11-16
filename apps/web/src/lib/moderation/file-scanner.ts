/**
 * File Malware Scanner - Section 6.4
 *
 * Scan uploaded files for malware using ClamAV or VirusTotal API
 */

import crypto from 'crypto';

export interface FileScanResult {
  safe: boolean;
  infected: boolean;
  scanEngine: 'clamav' | 'virustotal' | 'local';
  threats: string[];
  scanDate: string;
  fileHash: string;
}

/**
 * Scan file for malware using ClamAV
 * Requires ClamAV daemon running
 */
export async function scanFileWithClamAV(
  filePath: string
): Promise<FileScanResult> {
  // Placeholder for ClamAV integration
  // In production, use node-clam or clamd client

  /*
  const NodeClam = require('clamscan');

  const clamscan = await new NodeClam().init({
    clamdscan: {
      host: process.env.CLAMAV_HOST || 'localhost',
      port: process.env.CLAMAV_PORT || 3310,
    },
  });

  const { isInfected, viruses } = await clamscan.isInfected(filePath);

  return {
    safe: !isInfected,
    infected: isInfected,
    scanEngine: 'clamav',
    threats: viruses,
    scanDate: new Date().toISOString(),
    fileHash: await calculateFileHash(filePath),
  };
  */

  // Placeholder response
  return {
    safe: true,
    infected: false,
    scanEngine: 'clamav',
    threats: [],
    scanDate: new Date().toISOString(),
    fileHash: '',
  };
}

/**
 * Scan file for malware using VirusTotal API
 */
export async function scanFileWithVirusTotal(
  fileBuffer: Buffer,
  fileName: string
): Promise<FileScanResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    console.warn('VirusTotal API key not configured');
    return {
      safe: true,
      infected: false,
      scanEngine: 'virustotal',
      threats: [],
      scanDate: new Date().toISOString(),
      fileHash: calculateBufferHash(fileBuffer),
    };
  }

  try {
    // Calculate file hash
    const fileHash = calculateBufferHash(fileBuffer);

    // First, check if file hash already exists in VirusTotal
    const lookupResponse = await fetch(
      `https://www.virustotal.com/api/v3/files/${fileHash}`,
      {
        headers: {
          'x-apikey': apiKey,
        },
      }
    );

    if (lookupResponse.ok) {
      const data = await lookupResponse.json();
      const stats = data.data.attributes.last_analysis_stats;

      const infected = stats.malicious > 0 || stats.suspicious > 0;
      const threats: string[] = [];

      if (infected) {
        const results = data.data.attributes.last_analysis_results;
        for (const [engine, result] of Object.entries(results)) {
          if ((result as any).category === 'malicious') {
            threats.push(`${engine}: ${(result as any).result}`);
          }
        }
      }

      return {
        safe: !infected,
        infected,
        scanEngine: 'virustotal',
        threats,
        scanDate: new Date().toISOString(),
        fileHash,
      };
    }

    // File not in database, upload for scanning
    const formData = new FormData();
    const blob = new Blob([fileBuffer]);
    formData.append('file', blob, fileName);

    const uploadResponse = await fetch(
      'https://www.virustotal.com/api/v3/files',
      {
        method: 'POST',
        headers: {
          'x-apikey': apiKey,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to VirusTotal');
    }

    const uploadData = await uploadResponse.json();
    const analysisId = uploadData.data.id;

    // Poll for results (may take a few seconds)
    await new Promise(resolve => setTimeout(resolve, 5000));

    const analysisResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          'x-apikey': apiKey,
        },
      }
    );

    if (!analysisResponse.ok) {
      throw new Error('Failed to get analysis results');
    }

    const analysisData = await analysisResponse.json();
    const stats = analysisData.data.attributes.stats;

    const infected = stats.malicious > 0 || stats.suspicious > 0;

    return {
      safe: !infected,
      infected,
      scanEngine: 'virustotal',
      threats: infected ? ['Malware detected'] : [],
      scanDate: new Date().toISOString(),
      fileHash,
    };
  } catch (error) {
    console.error('VirusTotal scan error:', error);

    // Fail safe - reject file if scan fails
    return {
      safe: false,
      infected: false,
      scanEngine: 'virustotal',
      threats: ['Scan failed - rejecting file for safety'],
      scanDate: new Date().toISOString(),
      fileHash: calculateBufferHash(fileBuffer),
    };
  }
}

/**
 * Local file type validation
 * Check file extension and MIME type
 */
export function validateFileType(
  fileName: string,
  mimeType: string,
  allowedTypes: string[]
): { valid: boolean; error?: string } {
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (!ext) {
    return { valid: false, error: 'File has no extension' };
  }

  // Check if extension is allowed
  const allowedExtensions = allowedTypes.map(t => t.split('/')[1]);

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: `File type .${ext} is not allowed. Allowed types: ${allowedExtensions.join(', ')}`,
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `MIME type ${mimeType} is not allowed`,
    };
  }

  return { valid: true };
}

/**
 * Check file size
 */
export function validateFileSize(
  fileSize: number,
  maxSizeMB: number
): { valid: boolean; error?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (fileSize > maxSizeBytes) {
    return {
      valid: false,
      error: `File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Scan image for inappropriate content
 * Placeholder for image moderation service
 */
export async function scanImageContent(
  imageBuffer: Buffer
): Promise<{
  safe: boolean;
  categories: string[];
  confidence: number;
}> {
  // Placeholder for image moderation API
  // In production, integrate with:
  // - AWS Rekognition (DetectModerationLabels)
  // - Google Cloud Vision API (SafeSearch)
  // - Azure Content Moderator (Image Moderation)

  /*
  // Example with AWS Rekognition
  const rekognition = new AWS.Rekognition();

  const result = await rekognition.detectModerationLabels({
    Image: {
      Bytes: imageBuffer,
    },
    MinConfidence: 75,
  }).promise();

  const unsafe = result.ModerationLabels && result.ModerationLabels.length > 0;
  const categories = result.ModerationLabels?.map(label => label.Name) || [];
  const confidence = Math.max(...(result.ModerationLabels?.map(l => l.Confidence || 0) || [0]));

  return {
    safe: !unsafe,
    categories,
    confidence: confidence / 100,
  };
  */

  return {
    safe: true,
    categories: [],
    confidence: 0,
  };
}

/**
 * Calculate file hash (SHA-256)
 */
function calculateBufferHash(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Scan PDF for malicious content
 */
export async function scanPDF(
  pdfBuffer: Buffer
): Promise<{
  safe: boolean;
  issues: string[];
}> {
  // Basic PDF validation
  const issues: string[] = [];

  // Check PDF header
  const header = pdfBuffer.slice(0, 5).toString();
  if (header !== '%PDF-') {
    issues.push('Invalid PDF header');
  }

  // Check for embedded JavaScript (common in malicious PDFs)
  const content = pdfBuffer.toString();
  if (content.includes('/JavaScript') || content.includes('/JS')) {
    issues.push('PDF contains JavaScript');
  }

  // Check for embedded executables
  if (content.includes('/EmbeddedFile')) {
    issues.push('PDF contains embedded files');
  }

  // Check for suspicious actions
  const suspiciousActions = ['/Launch', '/SubmitForm', '/ImportData'];
  for (const action of suspiciousActions) {
    if (content.includes(action)) {
      issues.push(`PDF contains suspicious action: ${action}`);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}

/**
 * Combined file safety check
 */
export async function performFileSafetyCheck(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<{
  safe: boolean;
  issues: string[];
  scanResults: FileScanResult | null;
}> {
  const issues: string[] = [];

  // 1. Validate file type
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  const typeValidation = validateFileType(fileName, mimeType, allowedTypes);
  if (!typeValidation.valid) {
    issues.push(typeValidation.error!);
  }

  // 2. Validate file size (10MB max)
  const sizeValidation = validateFileSize(fileBuffer.length, 10);
  if (!sizeValidation.valid) {
    issues.push(sizeValidation.error!);
  }

  // 3. Scan for malware
  let scanResults: FileScanResult | null = null;

  if (process.env.VIRUSTOTAL_API_KEY) {
    scanResults = await scanFileWithVirusTotal(fileBuffer, fileName);
    if (scanResults.infected) {
      issues.push(...scanResults.threats);
    }
  }

  // 4. Additional checks for PDFs
  if (mimeType === 'application/pdf') {
    const pdfScan = await scanPDF(fileBuffer);
    if (!pdfScan.safe) {
      issues.push(...pdfScan.issues);
    }
  }

  // 5. Image content moderation
  if (mimeType.startsWith('image/')) {
    const imageScan = await scanImageContent(fileBuffer);
    if (!imageScan.safe) {
      issues.push(`Inappropriate image content: ${imageScan.categories.join(', ')}`);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
    scanResults,
  };
}

/**
 * Quarantine infected file
 */
export async function quarantineFile(
  fileId: string,
  reason: string
): Promise<void> {
  // Move file to quarantine storage
  // Mark in database as quarantined
  // Notify administrators

  console.warn(`File ${fileId} quarantined: ${reason}`);

  // In production:
  // - Move file to quarantine bucket
  // - Update database record
  // - Send alert to security team
}
