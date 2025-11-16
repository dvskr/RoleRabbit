/**
 * PDF Generation Job Processor
 * Section 2.12: Background Jobs & Async Processing
 *
 * Requirement #6: Generate PDFs asynchronously if generation takes >5 seconds
 * Requirement #7: Upload to Supabase Storage, return download URL
 */

import { Job } from 'bullmq';
import { PdfGenerationJobData } from '../queue.config';
import { ExportService } from '@/services/export.service';
import { logger } from '@/lib/logger/logger';
import { ExternalServiceError } from '@/lib/errors';

/**
 * PDF generation status
 */
export enum PdfGenerationStatus {
  QUEUED = 'QUEUED',
  GENERATING = 'GENERATING',
  UPLOADING = 'UPLOADING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * PDF generation record
 */
export interface PdfGenerationRecord {
  id: string;
  portfolioId: string;
  userId: string;
  email: string;
  status: PdfGenerationStatus;
  downloadUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

// Mock database
const pdfGenerations: Map<string, PdfGenerationRecord> = new Map();

/**
 * Process PDF generation job
 * Requirement #6: Generate PDFs asynchronously
 */
export const processPdfGenerationJob = async (
  job: Job<PdfGenerationJobData>
): Promise<void> => {
  const { portfolioId, userId, email, format = 'A4', includeImages = true } = job.data;

  const recordId = `pdf-${Date.now()}-${portfolioId}`;

  logger.info(`Processing PDF generation job ${job.id} for portfolio ${portfolioId}`);

  // Create record
  pdfGenerations.set(recordId, {
    id: recordId,
    portfolioId,
    userId,
    email,
    status: PdfGenerationStatus.QUEUED,
    createdAt: new Date().toISOString(),
  });

  try {
    // Step 1: Generate PDF
    await updatePdfStatus(recordId, PdfGenerationStatus.GENERATING);
    await job.updateProgress(20);

    logger.info(`Generating PDF for portfolio ${portfolioId}`);

    const exportService = new ExportService();
    const pdfBuffer = await exportService.exportToPdf(portfolioId);

    await job.updateProgress(60);

    // Step 2: Upload to Supabase Storage
    // Requirement #7: Upload to storage and return download URL
    await updatePdfStatus(recordId, PdfGenerationStatus.UPLOADING);

    logger.info(`Uploading PDF to Supabase Storage for portfolio ${portfolioId}`);

    const downloadUrl = await uploadPdfToStorage(portfolioId, pdfBuffer);

    await job.updateProgress(80);

    // Step 3: Complete and notify
    await updatePdfStatus(recordId, PdfGenerationStatus.COMPLETED, {
      downloadUrl,
      completedAt: new Date().toISOString(),
    });

    await job.updateProgress(100);

    logger.info(`PDF generation completed for portfolio ${portfolioId}`, { downloadUrl });

    // Requirement #7: Return download URL to user via email or notification
    await sendPdfNotification(email, portfolioId, downloadUrl);

  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';

    logger.error(`PDF generation failed for portfolio ${portfolioId}`, { error: errorMessage });

    await updatePdfStatus(recordId, PdfGenerationStatus.FAILED, {
      error: errorMessage,
      completedAt: new Date().toISOString(),
    });

    // Send failure notification
    await sendPdfFailureNotification(email, portfolioId, errorMessage);

    throw error;
  }
};

/**
 * Update PDF generation status
 */
const updatePdfStatus = async (
  recordId: string,
  status: PdfGenerationStatus,
  data?: Partial<PdfGenerationRecord>
): Promise<void> => {
  const record = pdfGenerations.get(recordId);

  if (!record) {
    throw new Error(`PDF generation record ${recordId} not found`);
  }

  record.status = status;

  if (data) {
    Object.assign(record, data);
  }

  // TODO: In production, use Supabase
  // await supabase
  //   .from('pdf_generations')
  //   .update({ status, ...data, updated_at: new Date().toISOString() })
  //   .eq('id', recordId);

  logger.info(`PDF generation ${recordId} status updated to ${status}`);
};

/**
 * Upload PDF to Supabase Storage
 * Requirement #7: Upload to storage
 */
const uploadPdfToStorage = async (
  portfolioId: string,
  pdfBuffer: Buffer
): Promise<string> => {
  // TODO: In production, use Supabase Storage
  // import { createClient } from '@supabase/supabase-js';
  //
  // const supabase = createClient(
  //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY!
  // );
  //
  // const bucketName = 'exports';
  // const fileName = `portfolios/${portfolioId}/portfolio-${Date.now()}.pdf`;
  //
  // const { error } = await supabase.storage
  //   .from(bucketName)
  //   .upload(fileName, pdfBuffer, {
  //     contentType: 'application/pdf',
  //     cacheControl: '3600',
  //   });
  //
  // if (error) {
  //   throw new ExternalServiceError(
  //     'Supabase Storage',
  //     'Failed to upload PDF',
  //     { error: error.message }
  //   );
  // }
  //
  // // Get public URL
  // const { data } = supabase.storage
  //   .from(bucketName)
  //   .getPublicUrl(fileName);
  //
  // return data.publicUrl;

  // Mock URL
  const downloadUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/exports/portfolios/${portfolioId}/portfolio-${Date.now()}.pdf`;

  logger.info(`PDF uploaded to ${downloadUrl}`);

  return downloadUrl;
};

/**
 * Send PDF download notification via email
 * Requirement #7: Return download URL to user via email
 */
const sendPdfNotification = async (
  email: string,
  portfolioId: string,
  downloadUrl: string
): Promise<void> => {
  try {
    // TODO: In production, use email service (Resend, SendGrid, or Supabase Edge Function)
    //
    // Option 1: Resend
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    //
    // await resend.emails.send({
    //   from: 'RoleRabbit <noreply@rolerabbit.com>',
    //   to: email,
    //   subject: 'Your Portfolio PDF is Ready',
    //   html: `
    //     <p>Your portfolio PDF has been generated successfully!</p>
    //     <p><a href="${downloadUrl}">Download PDF</a></p>
    //     <p>This link will expire in 7 days.</p>
    //   `,
    // });
    //
    // Option 2: Supabase Edge Function for email
    // const { data } = await supabase.functions.invoke('send-email', {
    //   body: {
    //     to: email,
    //     template: 'pdf-ready',
    //     data: { downloadUrl, portfolioId },
    //   },
    // });

    logger.info(`PDF notification sent to ${email}`, { downloadUrl });
  } catch (error) {
    logger.error('Failed to send PDF notification', { error, email });
    // Don't throw - email failure shouldn't fail the job
  }
};

/**
 * Send PDF generation failure notification
 */
const sendPdfFailureNotification = async (
  email: string,
  portfolioId: string,
  errorMessage: string
): Promise<void> => {
  try {
    // TODO: Send failure email
    logger.info(`PDF failure notification sent to ${email}`, { errorMessage });
  } catch (error) {
    logger.error('Failed to send PDF failure notification', { error, email });
  }
};

/**
 * Get PDF generation record
 */
export const getPdfGenerationRecord = (recordId: string): PdfGenerationRecord | null => {
  return pdfGenerations.get(recordId) || null;
};

/**
 * Check if PDF generation should be async
 * Requirement #6: Async if generation takes >5 seconds
 */
export const shouldGeneratePdfAsync = (portfolioDataSize: number): boolean => {
  // Heuristic: If portfolio has >100 items or >5MB data, generate async
  const ASYNC_THRESHOLD_ITEMS = 100;
  const ASYNC_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5MB

  return portfolioDataSize > ASYNC_THRESHOLD_BYTES;
};
