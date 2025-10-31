/**
 * Generic CRUD Service Base Class
 * 
 * Provides reusable CRUD operations for Prisma models
 * Reduces code duplication across utility files (jobs, resumes, emails, etc.)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const logger = require('./logger');
const { ApiError } = require('./errorHandler');

/**
 * Base CRUD Service Class
 * @template T - Prisma model type
 */
class CrudService {
  /**
   * @param {string} modelName - Prisma model name (e.g., 'job', 'resume', 'email')
   * @param {Object} options - Configuration options
   * @param {string} options.userIdField - Field name for userId (default: 'userId')
   * @param {string} options.orderBy - Default orderBy field (default: 'createdAt')
   * @param {string} options.orderDirection - Order direction (default: 'desc')
   */
  constructor(modelName, options = {}) {
    this.modelName = modelName;
    this.model = prisma[modelName];
    this.userIdField = options.userIdField || 'userId';
    this.orderBy = options.orderBy || 'createdAt';
    this.orderDirection = options.orderDirection || 'desc';
    
    if (!this.model) {
      throw new Error(`Prisma model '${modelName}' not found`);
    }
  }

  /**
   * Get all records for a user
   * @param {string} userId - User ID
   * @param {Object} where - Additional where conditions
   * @param {Object} orderBy - Custom orderBy
   * @returns {Promise<Array>} Array of records
   */
  async getAllByUserId(userId, where = {}, orderBy = null) {
    try {
      const records = await this.model.findMany({
        where: {
          [this.userIdField]: userId,
          ...where
        },
        orderBy: orderBy || {
          [this.orderBy]: this.orderDirection
        }
      });
      return records;
    } catch (error) {
      logger.error(`Error fetching ${this.modelName}s:`, error);
      throw new ApiError(500, `Failed to fetch ${this.modelName}s`);
    }
  }

  /**
   * Get a single record by ID
   * @param {string} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async getById(id) {
    try {
      const record = await this.model.findUnique({
        where: { id }
      });
      return record;
    } catch (error) {
      logger.error(`Error fetching ${this.modelName}:`, error);
      throw new ApiError(500, `Failed to fetch ${this.modelName}`);
    }
  }

  /**
   * Verify record exists and belongs to user
   * @param {string} id - Record ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Record
   * @throws {ApiError} 404 if not found, 403 if doesn't belong to user
   */
  async verifyOwnership(id, userId) {
    const record = await this.getById(id);
    if (!record) {
      throw new ApiError(404, `${this.modelName} not found`);
    }
    if (record[this.userIdField] !== userId) {
      throw new ApiError(403, 'Forbidden');
    }
    return record;
  }

  /**
   * Create a new record
   * @param {string} userId - User ID
   * @param {Object} data - Record data
   * @param {Function} transformData - Optional function to transform data before creating
   * @returns {Promise<Object>} Created record
   */
  async create(userId, data, transformData = null) {
    try {
      const createData = transformData 
        ? transformData(userId, data)
        : { [this.userIdField]: userId, ...data };

      const record = await this.model.create({
        data: createData
      });
      return record;
    } catch (error) {
      logger.error(`Error creating ${this.modelName}:`, error);
      throw new ApiError(500, `Failed to create ${this.modelName}`);
    }
  }

  /**
   * Update a record
   * @param {string} id - Record ID
   * @param {Object} updates - Updates to apply
   * @param {Function} transformUpdates - Optional function to transform updates
   * @returns {Promise<Object>} Updated record
   */
  async update(id, updates, transformUpdates = null) {
    try {
      // Filter out undefined fields
      const cleanUpdates = {};
      Object.keys(updates).forEach(key => {
        if (updates[key] !== undefined) {
          cleanUpdates[key] = updates[key];
        }
      });

      const finalUpdates = transformUpdates 
        ? transformUpdates(cleanUpdates)
        : cleanUpdates;

      const record = await this.model.update({
        where: { id },
        data: finalUpdates
      });
      return record;
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma record not found
        throw new ApiError(404, `${this.modelName} not found`);
      }
      logger.error(`Error updating ${this.modelName}:`, error);
      throw new ApiError(500, `Failed to update ${this.modelName}`);
    }
  }

  /**
   * Delete a record
   * @param {string} id - Record ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await this.model.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma record not found
        throw new ApiError(404, `${this.modelName} not found`);
      }
      logger.error(`Error deleting ${this.modelName}:`, error);
      throw new ApiError(500, `Failed to delete ${this.modelName}`);
    }
  }

  /**
   * Get records by a specific field
   * @param {string} field - Field name
   * @param {*} value - Field value
   * @param {Object} where - Additional where conditions
   * @returns {Promise<Array>} Array of records
   */
  async getByField(field, value, where = {}) {
    try {
      const records = await this.model.findMany({
        where: {
          [field]: value,
          ...where
        },
        orderBy: {
          [this.orderBy]: this.orderDirection
        }
      });
      return records;
    } catch (error) {
      logger.error(`Error fetching ${this.modelName}s by ${field}:`, error);
      throw new ApiError(500, `Failed to fetch ${this.modelName}s`);
    }
  }

  /**
   * Count records for a user
   * @param {string} userId - User ID
   * @param {Object} where - Additional where conditions
   * @returns {Promise<number>} Count
   */
  async count(userId, where = {}) {
    try {
      const count = await this.model.count({
        where: {
          [this.userIdField]: userId,
          ...where
        }
      });
      return count;
    } catch (error) {
      logger.error(`Error counting ${this.modelName}s:`, error);
      throw new ApiError(500, `Failed to count ${this.modelName}s`);
    }
  }
}

module.exports = CrudService;

