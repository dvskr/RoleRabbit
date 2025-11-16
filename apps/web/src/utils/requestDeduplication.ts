/**
 * Request Deduplication Utility
 * FE-044: Prevent multiple simultaneous calls to same endpoint
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_TIMEOUT = 30000; // 30 seconds

export function deduplicateRequest<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Check if there's a pending request for this key
  const existing = pendingRequests.get(key);
  
  if (existing) {
    // Check if request is still valid (not too old)
    const age = Date.now() - existing.timestamp;
    if (age < REQUEST_TIMEOUT) {
      return existing.promise as Promise<T>;
    } else {
      // Request is too old, remove it
      pendingRequests.delete(key);
    }
  }

  // Create new request
  const promise = requestFn()
    .then((result) => {
      pendingRequests.delete(key);
      return result;
    })
    .catch((error) => {
      pendingRequests.delete(key);
      throw error;
    });

  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  });

  return promise;
}

export function clearPendingRequest(key: string) {
  pendingRequests.delete(key);
}

export function clearAllPendingRequests() {
  pendingRequests.clear();
}

/**
 * Generate a request key from endpoint and params
 */
export function generateRequestKey(endpoint: string, params?: Record<string, any>): string {
  const sortedParams = params
    ? Object.keys(params)
        .sort()
        .map((key) => `${key}=${JSON.stringify(params[key])}`)
        .join('&')
    : '';
  return `${endpoint}${sortedParams ? `?${sortedParams}` : ''}`;
}

