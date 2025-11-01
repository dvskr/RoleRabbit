/**
 * Dashboard Routes Module
 * 
 * Handles all dashboard-related routes including:
 * - Activities feed
 * - Smart todos
 * - Progress metrics
 * - Intelligent alerts
 */

const { authenticate } = require('../middleware/auth');
const { errorHandler } = require('../utils/errorMiddleware');
const { prisma } = require('../utils/db');

/**
 * Register all dashboard routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function dashboardRoutes(fastify, options) {
  // Get dashboard activities (from jobs, emails, etc.)
  fastify.get('/api/dashboard/activities', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const limit = parseInt(request.query.limit || 20);
    
    // Get recent job applications
    const recentJobs = await prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        company: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // Get recent emails
    const recentEmails = await prisma.email.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.floor(limit / 2),
      select: {
        id: true,
        subject: true,
        status: true,
        createdAt: true
      }
    });
    
    // Transform to activities format
    const activities = [
      ...recentJobs.map(job => ({
        id: `job-${job.id}`,
        type: 'application',
        title: `Applied to ${job.title} at ${job.company}`,
        description: `Status: ${job.status}`,
        timestamp: job.createdAt,
        priority: job.status === 'interview' ? 'high' : 'medium',
        status: 'completed',
        relatedJobId: job.id,
        actionUrl: `/dashboard?tab=tracker&job=${job.id}`
      })),
      ...recentEmails.map(email => ({
        id: `email-${email.id}`,
        type: email.status === 'sent' ? 'response' : 'follow_up',
        title: email.subject,
        description: `Email ${email.status}`,
        timestamp: email.createdAt,
        priority: 'medium',
        status: 'completed',
        actionUrl: `/dashboard?tab=email&email=${email.id}`
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
    
    return { activities };
  }));

  // Get dashboard todos (smart generated from user data)
  fastify.get('/api/dashboard/todos', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    
    // Get user's incomplete jobs
    const incompleteJobs = await prisma.job.findMany({
      where: {
        userId,
        status: { notIn: ['rejected', 'accepted'] }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    // Get user's resumes
    const resumes = await prisma.resume.findMany({
      where: { userId },
      take: 5
    });
    
    // Generate smart todos
    const todos = [];
    
    // Todo: Update resume if last updated > 30 days
    const oldResumes = resumes.filter(r => {
      const daysSinceUpdate = (Date.now() - new Date(r.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 30;
    });
    
    oldResumes.forEach(resume => {
      todos.push({
        id: `update-resume-${resume.id}`,
        title: `Update resume: ${resume.name}`,
        description: 'Your resume hasn\'t been updated in over 30 days',
        priority: 'medium',
        category: 'resume',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isCompleted: false,
        actionUrl: `/dashboard?tab=editor&resume=${resume.id}`
      });
    });
    
    // Todo: Follow up on pending applications
    incompleteJobs.forEach(job => {
      const daysSinceUpdate = (Date.now() - new Date(job.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 7 && job.status === 'applied') {
        todos.push({
          id: `follow-up-${job.id}`,
          title: `Follow up on ${job.company}`,
          description: `Applied ${Math.floor(daysSinceUpdate)} days ago`,
          priority: 'high',
          category: 'application',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          isCompleted: false,
          relatedJobId: job.id,
          actionUrl: `/dashboard?tab=tracker&job=${job.id}`
        });
      }
    });
    
    // Todo: Complete profile if missing data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true }
    });
    
    if (!user.name || user.name.trim() === '') {
      todos.push({
        id: 'complete-profile',
        title: 'Complete your profile',
        description: 'Add your name and basic information',
        priority: 'high',
        category: 'profile',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        isCompleted: false,
        actionUrl: '/dashboard?tab=profile'
      });
    }
    
    // If no jobs, suggest creating first application
    if (incompleteJobs.length === 0 && resumes.length > 0) {
      todos.push({
        id: 'start-applying',
        title: 'Start applying to jobs',
        description: 'You have resumes ready. Time to apply!',
        priority: 'high',
        category: 'application',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isCompleted: false,
        actionUrl: '/dashboard?tab=tracker'
      });
    }
    
    return { todos: todos.slice(0, 10) };
  }));

  // Complete a todo
  fastify.post('/api/dashboard/todos/:id/complete', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const { id } = request.params;
    const { completed = true } = request.body;
    
    // Note: Todos are generated on-the-fly, so we don't store them
    // This endpoint acknowledges the todo completion
    // In a real implementation, you might store completed todos in a separate table
    
    return { 
      success: true, 
      message: `Todo ${id} marked as ${completed ? 'completed' : 'incomplete'}`
    };
  }));

  // Get dashboard metrics
  fastify.get('/api/dashboard/metrics', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    
    // Get job statistics
    const jobs = await prisma.job.findMany({
      where: { userId }
    });
    
    const totalApplications = jobs.length;
    const applicationsByStatus = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    
    const responseRate = totalApplications > 0
      ? Math.round((applicationsByStatus.interview || 0) / totalApplications * 100)
      : 0;
    
    // Get resume count
    const resumeCount = await prisma.resume.count({
      where: { userId }
    });
    
    // Get email count
    const emailCount = await prisma.email.count({
      where: { userId }
    });
    
    // Get cover letter count
    const coverLetterCount = await prisma.coverLetter.count({
      where: { userId }
    });
    
    // Calculate success metrics
    const interviewCount = applicationsByStatus.interview || 0;
    const offerCount = applicationsByStatus.accepted || 0;
    
    const metrics = {
      totalApplications,
      activeApplications: applicationsByStatus.applied || 0,
      interviewCount,
      offerCount,
      responseRate,
      resumeCount,
      coverLetterCount,
      emailCount,
      applicationsByStatus
    };
    
    return { metrics };
  }));

  // Get intelligent alerts
  fastify.get('/api/dashboard/alerts', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    const userId = request.user.userId;
    const alerts = [];
    
    // Check for stale applications
    const staleJobs = await prisma.job.findMany({
      where: {
        userId,
        status: 'applied',
        updatedAt: {
          lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) // 14 days ago
        }
      },
      take: 5
    });
    
    staleJobs.forEach(job => {
      alerts.push({
        id: `stale-${job.id}`,
        type: 'warning',
        title: 'Follow up needed',
        message: `You applied to ${job.company} ${Math.floor((Date.now() - new Date(job.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago. Consider following up.`,
        priority: 'medium',
        actionUrl: `/dashboard?tab=tracker&job=${job.id}`,
        dismissible: true
      });
    });
    
    // Check for interviews coming up (if you store interview dates)
    // This would require adding interviewDate field to Job model
    
    // Check for incomplete profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });
    
    if (!user.name || user.name.trim() === '') {
      alerts.push({
        id: 'incomplete-profile',
        type: 'info',
        title: 'Complete your profile',
        message: 'Add your name and basic information to get personalized recommendations.',
        priority: 'low',
        actionUrl: '/dashboard?tab=profile',
        dismissible: true
      });
    }
    
    return { alerts };
  }));

  // Dismiss an alert
  fastify.delete('/api/dashboard/alerts/:id', {
    preHandler: authenticate
  }, errorHandler(async (request, reply) => {
    // Note: Alerts are generated on-the-fly
    // In a real implementation, you might store dismissed alerts
    // For now, we just acknowledge the dismissal
    
    return { 
      success: true, 
      message: 'Alert dismissed'
    };
  }));
}

module.exports = dashboardRoutes;

