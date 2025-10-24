// Error reporting API endpoint for the Node.js backend
// This would be added to apps/api/src/server.ts

import { FastifyRequest, FastifyReply } from 'fastify';

interface ErrorReport {
  id: string;
  error: {
    message: string;
    stack?: string;
    name: string;
  };
  context: string;
  timestamp: string;
  userAgent: string;
  url: string;
  userId?: string;
  level?: string;
  retryCount?: number;
}

// Error storage (in production, use a proper database)
const errorReports: ErrorReport[] = [];

export const errorRoutes = async (fastify: any) => {
  // POST /api/errors - Report an error
  fastify.post('/api/errors', async (request: FastifyRequest<{ Body: ErrorReport }>, reply: FastifyReply) => {
    try {
      const errorReport = request.body;
      
      // Validate error report
      if (!errorReport.id || !errorReport.error?.message) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid error report format'
        });
      }

      // Add timestamp if not provided
      if (!errorReport.timestamp) {
        errorReport.timestamp = new Date().toISOString();
      }

      // Store error report
      errorReports.push(errorReport);

      // In production, you would:
      // 1. Store in database
      // 2. Send to monitoring service (Sentry, LogRocket, etc.)
      // 3. Send alerts for critical errors
      // 4. Aggregate error statistics

      console.log('Error reported:', {
        id: errorReport.id,
        message: errorReport.error.message,
        context: errorReport.context,
        url: errorReport.url
      });

      // Send to external monitoring service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(errorReport.error, {
        //   tags: {
        //     context: errorReport.context,
        //     userId: errorReport.userId
        //   },
        //   extra: {
        //     url: errorReport.url,
        //     userAgent: errorReport.userAgent,
        //     timestamp: errorReport.timestamp
        //   }
        // });
      }

      return reply.send({
        success: true,
        message: 'Error reported successfully',
        errorId: errorReport.id
      });

    } catch (error) {
      console.error('Failed to process error report:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to process error report'
      });
    }
  });

  // GET /api/errors - Get error statistics (admin only)
  fastify.get('/api/errors', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // In production, add authentication check here
      // const isAdmin = await checkAdminAuth(request);
      // if (!isAdmin) {
      //   return reply.status(403).send({ success: false, message: 'Unauthorized' });
      // }

      const stats = {
        totalErrors: errorReports.length,
        errorsByContext: errorReports.reduce((acc, report) => {
          acc[report.context] = (acc[report.context] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentErrors: errorReports
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10)
          .map(report => ({
            id: report.id,
            message: report.error.message,
            context: report.context,
            timestamp: report.timestamp,
            url: report.url
          })),
        errorRate: {
          last24h: errorReports.filter(r => 
            new Date(r.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ).length,
          last7d: errorReports.filter(r => 
            new Date(r.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length
        }
      };

      return reply.send({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Failed to get error statistics:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get error statistics'
      });
    }
  });

  // GET /api/errors/:id - Get specific error details
  fastify.get('/api/errors/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const errorReport = errorReports.find(r => r.id === id);

      if (!errorReport) {
        return reply.status(404).send({
          success: false,
          message: 'Error report not found'
        });
      }

      return reply.send({
        success: true,
        data: errorReport
      });

    } catch (error) {
      console.error('Failed to get error details:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get error details'
      });
    }
  });

  // DELETE /api/errors/:id - Delete error report (admin only)
  fastify.delete('/api/errors/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    try {
      const { id } = request.params;
      const index = errorReports.findIndex(r => r.id === id);

      if (index === -1) {
        return reply.status(404).send({
          success: false,
          message: 'Error report not found'
        });
      }

      errorReports.splice(index, 1);

      return reply.send({
        success: true,
        message: 'Error report deleted successfully'
      });

    } catch (error) {
      console.error('Failed to delete error report:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete error report'
      });
    }
  });
};

// Error monitoring middleware
export const errorMonitoringMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const startTime = Date.now();
  
  // Log request
  console.log(`${request.method} ${request.url} - ${request.ip}`);
  
  // Monitor response time
  reply.addHook('onSend', async (request, reply, payload) => {
    const responseTime = Date.now() - startTime;
    
    // Log slow requests
    if (responseTime > 1000) {
      console.warn(`Slow request: ${request.method} ${request.url} took ${responseTime}ms`);
    }
    
    return payload;
  });
  
  // Monitor errors
  reply.addHook('onError', async (request, reply, error) => {
    console.error(`Request error: ${request.method} ${request.url}`, error);
    
    // Report to error service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, {
      //   tags: {
      //     method: request.method,
      //     url: request.url,
      //     statusCode: reply.statusCode
      //   }
      // });
    }
  });
};

export default errorRoutes;
