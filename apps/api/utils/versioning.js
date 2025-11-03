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
 * Get version info
 */
function getVersionInfo() {
  return {
    currentVersion: 'v1',
    supportedVersions: SUPPORTED_VERSIONS,
    latestVersion: SUPPORTED_VERSIONS[SUPPORTED_VERSIONS.length - 1]
  };
}

module.exports = {
  SUPPORTED_VERSIONS,
  getVersion,
  validateVersion,
  getVersionInfo
};

