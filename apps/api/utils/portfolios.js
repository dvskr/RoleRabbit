/**
 * Portfolio Management Utilities
 * Handles portfolio website generation and management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all portfolios for a user
 */
async function getPortfoliosByUserId(userId) {
  return await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Get portfolio by ID
 */
async function getPortfolioById(portfolioId) {
  return await prisma.portfolio.findUnique({
    where: { id: portfolioId }
  });
}

/**
 * Create a new portfolio
 */
async function createPortfolio(userId, portfolioData) {
  return await prisma.portfolio.create({
    data: {
      userId,
      name: portfolioData.name,
      description: portfolioData.description,
      data: JSON.stringify(portfolioData.data),
      templateId: portfolioData.templateId || 'modern',
      subdomain: portfolioData.subdomain,
      customDomain: portfolioData.customDomain
    }
  });
}

/**
 * Update portfolio
 */
async function updatePortfolio(portfolioId, updates) {
  const updateData = { ...updates };
  if (updates.data) {
    updateData.data = JSON.stringify(updates.data);
  }

  return await prisma.portfolio.update({
    where: { id: portfolioId },
    data: updateData
  });
}

/**
 * Delete portfolio
 */
async function deletePortfolio(portfolioId) {
  return await prisma.portfolio.delete({
    where: { id: portfolioId }
  });
}

/**
 * Publish portfolio
 */
async function publishPortfolio(portfolioId, config) {
  return await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      isPublished: true,
      subdomain: config.subdomain,
      customDomain: config.customDomain,
      publishedAt: new Date()
    }
  });
}

module.exports = {
  getPortfoliosByUserId,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  publishPortfolio
};
