/**
 * Portfolios API utilities
 * Handles database operations for portfolio management
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all portfolios for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of portfolios
 */
async function getPortfoliosByUserId(userId) {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return portfolios;
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    throw error;
  }
}

/**
 * Get a single portfolio by ID
 * @param {string} portfolioId - Portfolio ID
 * @returns {Promise<Object>} Portfolio object
 */
async function getPortfolioById(portfolioId) {
  try {
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: portfolioId
      }
    });
    return portfolio;
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    throw error;
  }
}

/**
 * Create a new portfolio
 * @param {string} userId - User ID
 * @param {Object} portfolioData - Portfolio data
 * @returns {Promise<Object>} Created portfolio
 */
async function createPortfolio(userId, portfolioData) {
  try {
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: portfolioData.name || 'Untitled Portfolio',
        description: portfolioData.description,
        data: typeof portfolioData.data === 'string' 
          ? portfolioData.data 
          : JSON.stringify(portfolioData.data || {}),
        templateId: portfolioData.templateId || 'modern',
        isPublished: portfolioData.isPublished || false
      }
    });
    return portfolio;
  } catch (error) {
    console.error('Error creating portfolio:', error);
    throw error;
  }
}

/**
 * Update a portfolio
 * @param {string} portfolioId - Portfolio ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} Updated portfolio
 */
async function updatePortfolio(portfolioId, updates) {
  try {
    // Filter out undefined fields and stringify data if it's an object
    const cleanUpdates = {};
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        if (key === 'data' && typeof updates[key] === 'object') {
          cleanUpdates[key] = JSON.stringify(updates[key]);
        } else {
          cleanUpdates[key] = updates[key];
        }
      }
    });

    const portfolio = await prisma.portfolio.update({
      where: {
        id: portfolioId
      },
      data: cleanUpdates
    });
    return portfolio;
  } catch (error) {
    console.error('Error updating portfolio:', error);
    throw error;
  }
}

/**
 * Delete a portfolio
 * @param {string} portfolioId - Portfolio ID
 * @returns {Promise<boolean>} Success status
 */
async function deletePortfolio(portfolioId) {
  try {
    await prisma.portfolio.delete({
      where: {
        id: portfolioId
      }
    });
    return true;
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    throw error;
  }
}

module.exports = {
  getPortfoliosByUserId,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio
};

