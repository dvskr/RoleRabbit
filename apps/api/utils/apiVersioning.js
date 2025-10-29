/**
 * API Versioning Utility
 * Manages API version compatibility and migration
 */

const supportedVersions = ['v1', 'v2'];
const currentVersion = 'v1';

/**
 * Parse version from request
 */
function parseVersion(request) {
  const versionHeader = request.headers['api-version'];
  const pathVersion = request.url.match(/\/api\/(v\d+)\//);
  
  return versionHeader || (pathVersion ? pathVersion[1] : currentVersion);
}

/**
 * Validate API version
 */
function validateVersion(version) {
  return supportedVersions.includes(version);
}

/**
 * Get API version info
 */
function getVersionInfo() {
  return {
    currentVersion,
    supportedVersions,
    deprecatedVersions: [],
    sunsetDate: null
  };
}

/**
 * Version compatibility middleware
 */
function versionMiddleware(request, reply, done) {
  const version = parseVersion(request);
  
  if (!validateVersion(version)) {
    return reply.code(400).send({
      error: 'Unsupported API version',
      supportedVersions,
      currentVersion
    });
  }
  
  request.apiVersion = version;
  reply.header('API-Version', version);
  done();
}

/**
 * Transform response based on version
 */
function transformResponse(version, data) {
  if (version === 'v1') {
    return data;
  }
  
  // Add version-specific transformations
  return data;
}

module.exports = {
  parseVersion,
  validateVersion,
  getVersionInfo,
  versionMiddleware,
  transformResponse,
  currentVersion,
  supportedVersions
};

