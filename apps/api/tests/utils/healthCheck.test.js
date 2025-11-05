const { getHealthStatus, isHealthy } = require('../../utils/healthCheck');

describe('Health Check', () => {
  test('should return health status', async () => {
    const health = await getHealthStatus();
    expect(health).toHaveProperty('status');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('checks');
    expect(health.checks).toHaveProperty('database');
    expect(health.checks).toHaveProperty('memory');
  });

  test('should determine if system is healthy', async () => {
    const healthy = await isHealthy();
    expect(typeof healthy).toBe('boolean');
  });
});

