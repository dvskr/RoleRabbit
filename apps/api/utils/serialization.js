/**
 * Serialization Utility
 * Safe JSON serialization and deserialization
 */

const logger = require('./logger');

/**
 * Safely serialize object to JSON
 */
function safeSerialize(obj) {
  try {
    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  } catch (error) {
    logger.error('Serialization failed', error);
    return JSON.stringify({ error: 'Serialization failed' });
  }
}

// Helper for circular reference detection
const seen = new WeakSet();

/**
 * Safely deserialize JSON to object
 */
function safeDeserialize(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error('Deserialization failed', error);
    return null;
  }
}

/**
 * Serialize for caching
 */
function serializeForCache(data) {
  return JSON.stringify(data);
}

/**
 * Deserialize from cache
 */
function deserializeFromCache(cachedData) {
  return JSON.parse(cachedData);
}

module.exports = {
  safeSerialize,
  safeDeserialize,
  serializeForCache,
  deserializeFromCache
};
