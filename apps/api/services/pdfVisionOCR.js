/**
 * PDF Vision OCR Service
 * Uses GPT-4o Vision to extract text from scanned PDFs
 * 
 * Note: GPT-4o Vision can read PDFs directly, no need to convert to images!
 */

const logger = require('../utils/logger');
const { retryOpenAIOperation } = require('../utils/retryWithBackoff');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Extract text from scanned PDF using GPT-4o Vision
 * @param {Buffer} imageBuffer - PNG image buffer or PDF buffer
 * @param {number} pageNumber - Page number (for logging)
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPdf(pdfBuffer, fileName) {
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    logger.info(`🔍 Extracting text from PDF using GPT-4o Vision`, { fileName });

    // Convert buffer to base64
    const base64Pdf = pdfBuffer.toString('base64');
    const pdfDataUrl = `data:application/pdf;base64,${base64Pdf}`;

    // Use GPT-4o Vision to extract text from the entire PDF
    const response = await retryOpenAIOperation(
      async (attempt) => {
        logger.info(`🤖 GPT-4o Vision attempt ${attempt} for ${fileName}`);
        
        return await openai.chat.completions.create({
          model: 'gpt-4o', // GPT-4o has vision capabilities and can read PDFs
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `This is a scanned resume PDF. Extract ALL text from every page of this resume. 

IMPORTANT:
- Extract text from ALL pages
- Preserve the structure and formatting
- Include ALL information: name, contact, experience, education, skills, etc.
- Do NOT add any commentary or explanations
- Return ONLY the extracted text

Format the output as clean, readable text with sections clearly separated.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: pdfDataUrl,
                    detail: 'high' // High detail for better text recognition
                  }
                }
              ]
            }
          ],
          max_tokens: 4000,
          temperature: 0.1, // Low temperature for accurate extraction
        });
      },
      {
        operationName: `GPT-4o Vision OCR (${fileName})`,
        maxAttempts: 3,
        initialDelay: 1000,
        onRetry: (error, attempt, delay) => {
          logger.warn(`[Vision OCR] Retrying ${fileName} after error: ${error.message}`, {
            attempt,
            nextDelay: delay
          });
        }
      }
    );

    const extractedText = response.choices[0]?.message?.content || '';
    const tokensUsed = response.usage?.total_tokens || 0;

    logger.info(`✅ Extracted text from PDF`, {
      fileName,
      textLength: extractedText.length,
      tokensUsed,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens
    });

    return {
      text: extractedText,
      tokensUsed
    };
  } catch (error) {
    logger.error(`Failed to extract text from PDF:`, { fileName, error: error.message });
    throw error;
  }
}

/**
 * Parse scanned PDF using GPT-4o Vision OCR
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @param {string} fileName - Original file name
 * @returns {Promise<{text: string, pageCount: number, totalTokens: number, method: string}>}
 */
async function parseScannedPdfWithVision(pdfBuffer, fileName) {
  const startTime = Date.now();
  
  try {
    logger.info('🔬 Starting GPT-4o Vision OCR for scanned PDF', {
      fileName,
      bufferSize: pdfBuffer.length
    });

    // Extract text from the entire PDF using GPT-4o Vision
    const result = await extractTextFromPdf(pdfBuffer, fileName);

    const duration = Date.now() - startTime;

    logger.info('✅ GPT-4o Vision OCR completed', {
      fileName,
      extractedTextLength: result.text.length,
      totalTokens: result.tokensUsed,
      durationMs: duration
    });

    return {
      text: result.text,
      pageCount: 1, // We process the entire PDF at once
      totalTokens: result.tokensUsed,
      method: 'gpt-4o-vision-ocr',
      durationMs: duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('❌ GPT-4o Vision OCR failed', {
      fileName,
      error: error.message,
      durationMs: duration
    });
    throw error;
  }
}

module.exports = {
  parseScannedPdfWithVision,
  extractTextFromPdf
};
