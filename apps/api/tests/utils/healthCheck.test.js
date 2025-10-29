const { getHealthStatus, isHealthy } = require('../../utils/healthCheck');

describe('Health Check', () => {
  test('should return health status', async () => {
    const health = await getHealthStatus();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('services');
    expect(health).toHaveProperty('system');
  });

  test('should determine if system is healthy', async () => {
    const healthy = await isHealthy();
    expect(typeof healthy).toBe('boolean');
  });
});

