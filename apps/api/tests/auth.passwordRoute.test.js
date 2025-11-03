/**
 * Tests for password change route
 */

const Fastify = require('fastify');

jest.mock('../middleware/auth', () => ({
  authenticate: async (request) => {
    request.user = { userId: 'user-abc' };
  }
}));

jest.mock('../auth', () => ({
  updateUserPassword: jest.fn()
}));

const { updateUserPassword } = require('../auth');

describe('Auth password route', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();
    await app.register(require('../routes/auth.routes'));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const changePassword = (payload) =>
    app.inject({
      method: 'PUT',
      url: '/api/auth/password',
      headers: { 'content-type': 'application/json' },
      payload: JSON.stringify(payload)
    });

  it('changes password when payload is valid', async () => {
    updateUserPassword.mockResolvedValue(true);

    const response = await changePassword({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass123',
      confirmPassword: 'NewPass123'
    });

    expect(response.statusCode).toBe(200);
    expect(updateUserPassword).toHaveBeenCalledWith('user-abc', 'OldPass123', 'NewPass123');
  });

  it('rejects requests with missing fields', async () => {
    const response = await changePassword({
      currentPassword: '',
      newPassword: 'NewPass123',
      confirmPassword: ''
    });

    expect(response.statusCode).toBe(400);
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('rejects when confirmation does not match', async () => {
    const response = await changePassword({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass123',
      confirmPassword: 'Mismatch'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toContain('do not match');
  });

  it('propagates validation errors from password policy', async () => {
    const response = await changePassword({
      currentPassword: 'OldPass123',
      newPassword: 'short',
      confirmPassword: 'short'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toContain('Password must be at least 8 characters');
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('returns error message from updateUserPassword', async () => {
    updateUserPassword.mockRejectedValue(new Error('Current password incorrect'));

    const response = await changePassword({
      currentPassword: 'OldPass123',
      newPassword: 'NewPass123',
      confirmPassword: 'NewPass123'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().error).toBe('Current password incorrect');
  });
});


