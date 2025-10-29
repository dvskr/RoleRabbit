/**
 * API Versioning Utilities
 * Handles API version routing and deprecation
 */

const SUPPORTED_VERSIONS = ['v1'];

/**
 * Get API version from request
 */
function getVersion(request) {
  const version = request.headers['api-version'] || 
                 request.headers['x-api-version'] ||
                 request.query?.version ||
                 'v1';
  
  return version.toLowerCase();
}

/**
 * Validate API version
 */
function validateVersion(version) {
  return SUPPORTED_VERSIONS.includes(version);
}

/**
 * Create versioned route handler
 */
function createVersionedRoute(fastify, basePath, handlers) {
  SUPPORTED_VERSIONS.forEach(version => {
    if (handlers[version]) {
      fastify.get(`${basePath}`, async (request, reply) => {
        const requestedVersion = getVersion(request);
        
        if (!validateVersion(requestedVersion)) {
          return reply.status(400).send({
            success: false,
            error: 'Unsupported API version',
            supportedVersions: SUPPORTED_VERSIONS,
            requestedVersion
          });
        }

        // Return version-specific response
        if (handlers[requestedVersion]) {
          return handlers[requestedVersion](request, reply);
        }

        // Fallback to latest if version handler doesn't exist
        const latestVersion = SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1];
        return handlers[latestVersion](request, reply);
      });
    }
  });
}

/**
 * Version middleware
 */
function versionMiddleware(request, reply, next) {
  const version = getVersion(request);
  
  if (!validateVersion(version)) {
    return reply.status(400).send({
      success: false,
      error: 'Unsupported API version',
      supportedVersions: SUPPORTED_VERSIONS,
      requestedVersion: version,
      defaultVersion: SUPPORTED_VERSIONS[0]
    });
  }

  // Attach version to request object
  request.apiVersion = version;
  next();
}

/**
 * Get version info
 */
function getVersionInfo() {
  return {
    currentVersion: 'v1',
    supportedVersions: SUPPORTED_VERSIONS,
    latestVersion: SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1],
    deprecationWarnings: {}
  };
}

/**
 * Check if endpoint is deprecated
 */
function checkDeprecation(version, endpoint) {
  const deprecations = {
    v1: {
      '/api/old-endpoint': {
        deprecated: true,
        removeDate: '2025-12-31',
        alternative: '/api/new-endpoint',
        reason: 'Replaced with new endpoint'
      }
    }
  };

  return deprecations[version]?.[endpoint] || null;
}

/**
 * Add deprecation header
 */
function addDeprecationHeader(reply, deprecationInfo) {
  if (deprecationInfo) {
    reply.header('X-API-Deprecated', 'true');
    reply.header('X-API-Deprecated-Reason', deprecationInfo.reason);
    reply.header('X-API-Deprecated-Alternative', deprecationInfo.alternative);
    reply.header('X-API-Deprecated-Remove-Date', deprecationInfo.removeDate);
  }
}

/**
 * Versioned response wrapper
 */
function versionedResponse(version, data) {
  return {
    version,
    data,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  SUPPORTED_VERSIONS,
  getVersion,
  validateVersion,
  createVersionedRoute,
  versionMiddleware,
  getVersionInfo,
  checkDeprecation,
  addDeprecationHeader,
  versionedResponse
};

