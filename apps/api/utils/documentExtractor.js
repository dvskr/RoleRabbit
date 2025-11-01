/**
 * Document Text Extractor
 * Extracts text from PDF and DOCX files
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract text from PDF file
 * Note: This requires pdf-parse package. Install with: npm install pdf-parse
 */
async function extractTextFromPDF(buffer) {
  try {
    // Dynamic import to handle optional dependency
    const pdf = require('pdf-parse');
    
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer is empty');
    }
    
    const data = await pdf(buffer);
    
    // Check if text was extracted
    if (!data || !data.text || data.text.trim().length === 0) {
      // Check page count - if PDF has pages but no text, it's likely image-based
      if (data && data.numpages && data.numpages > 0) {
        throw new Error('PDF appears to be image-based (scanned). Please use a text-based PDF or convert scanned images to text first.');
      }
      throw new Error('PDF file contains no extractable text. The file may be empty or image-based.');
    }
    
    // Check if we got very little text (might be mostly images)
    const textLength = data.text.trim().length;
    if (textLength < 50 && data.numpages > 0) {
      throw new Error('PDF appears to be mostly image-based. Very little text could be extracted. Please use a text-based PDF.');
    }
    
    return data.text.trim();
  } catch (error) {
    // If pdf-parse is not installed, throw helpful error
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('pdf-parse package not installed. Run: npm install pdf-parse');
    }
    
    // Re-throw our custom error messages
    if (error.message && (error.message.includes('image-based') || error.message.includes('scanned'))) {
      throw error;
    }
    
    // Provide more specific error messages based on error type
    const errorMsg = error.message || '';
    
    if (errorMsg.includes('Invalid PDF') || errorMsg.includes('InvalidVersion') || errorMsg.includes('Malformed')) {
      throw new Error('Invalid PDF file. The file may be corrupted or not a valid PDF.');
    }
    
    if (errorMsg.includes('encrypted') || errorMsg.includes('password')) {
      throw new Error('PDF is encrypted or password-protected. Please remove the password and try again.');
    }
    
    if (errorMsg.includes('empty')) {
      throw new Error('PDF file is empty or could not be read.');
    }
    
    // Log the actual error for debugging
    console.error('PDF extraction error:', error.message, error.stack);
    
    // Provide generic but helpful error
    throw new Error(`Failed to extract text from PDF: ${errorMsg || 'The PDF may be corrupted, encrypted, or image-based (scanned). Please try a text-based PDF.'}`);
  }
}

/**
 * Extract text from DOCX file
 * Note: This requires mammoth package. Install with: npm install mammoth
 */
async function extractTextFromDOCX(buffer) {
  try {
    // Dynamic import to handle optional dependency
    const mammoth = require('mammoth');
    
    if (!buffer || buffer.length === 0) {
      throw new Error('DOCX buffer is empty');
    }
    
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result || !result.value) {
      return '';
    }
    
    return result.value.trim();
  } catch (error) {
    // If mammoth is not installed, throw helpful error
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new Error('mammoth package not installed. Run: npm install mammoth');
    }
    
    // Provide more specific error messages
    if (error.message && (error.message.includes('Invalid') || error.message.includes('corrupted'))) {
      throw new Error('Invalid DOCX file. The file may be corrupted or not a valid Word document.');
    }
    
    throw new Error(`Failed to extract text from DOCX: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Extract text from file based on MIME type
 */
async function extractTextFromFile(buffer, mimeType) {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('File buffer is empty');
    }

    if (mimeType === 'application/pdf') {
      return await extractTextFromPDF(buffer);
    } else if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return await extractTextFromDOCX(buffer);
    } else if (mimeType === 'text/plain') {
      const text = buffer.toString('utf-8');
      if (!text || text.trim().length === 0) {
        throw new Error('Text file is empty');
      }
      return text.trim();
    } else {
      throw new Error(`Unsupported file type: ${mimeType}. Supported types: PDF, DOC, DOCX, TXT`);
    }
  } catch (error) {
    // Re-throw with more context
    if (error.message && !error.message.includes('Failed to extract')) {
      throw new Error(`Failed to extract text from file (${mimeType}): ${error.message}`);
    }
    throw error;
  }
}

module.exports = {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractTextFromFile
};

