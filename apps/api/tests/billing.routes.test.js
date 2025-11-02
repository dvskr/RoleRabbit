const Fastify = require('fastify');

jest.mock('../middleware/auth', () => ({
  authenticate: async (request) => {
    request.user = { userId: 'user-1' };
  }
}));

jest.mock('../utils/billing', () => ({
  getSubscriptionOverview: jest.fn(),
  listInvoices: jest.fn(),
  subscribeUser: jest.fn(),
  cancelSubscription: jest.fn(),
  listPaymentMethods: jest.fn(),
  addPaymentMethod: jest.fn(),
  removePaymentMethod: jest.fn()
}));

const billingService = require('../utils/billing');

describe('Billing routes', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();
    await app.register(require('../routes/billing.routes'));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    Object.values(billingService).forEach((fn) => jest.isMockFunction(fn) && fn.mockReset());
  });

  it('returns subscription overview', async () => {
    billingService.getSubscriptionOverview.mockResolvedValue({
      subscription: { planId: 'free' },
      usage: []
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/billing/subscription'
    });

    expect(response.statusCode).toBe(200);
    expect(billingService.getSubscriptionOverview).toHaveBeenCalledWith('user-1');
    expect(response.json()).toEqual({ subscription: { planId: 'free' }, usage: [] });
  });

  it('returns invoices with pagination', async () => {
    billingService.listInvoices.mockResolvedValue({
      invoices: [],
      pagination: { page: 1, pageSize: 10, totalPages: 1, totalCount: 0 }
    });

    const response = await app.inject({
      method: 'GET',
      url: '/api/billing/invoices?page=2&pageSize=5'
    });

    expect(response.statusCode).toBe(200);
    expect(billingService.listInvoices).toHaveBeenCalledWith('user-1', 2, 5);
  });

  it('subscribes user to plan', async () => {
    billingService.subscribeUser.mockResolvedValue({
      subscription: { planId: 'pro' },
      invoice: { id: 'inv-1' }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/billing/subscribe',
      payload: { plan: 'pro', paymentMethodId: 'pm_123' }
    });

    expect(response.statusCode).toBe(200);
    expect(billingService.subscribeUser).toHaveBeenCalledWith('user-1', 'pro', 'pm_123');
    expect(response.json().subscription.planId).toBe('pro');
  });

  it('cancels subscription', async () => {
    billingService.cancelSubscription.mockResolvedValue({ planId: 'pro', cancelAtPeriodEnd: true });

    const response = await app.inject({
      method: 'POST',
      url: '/api/billing/cancel'
    });

    expect(response.statusCode).toBe(200);
    expect(billingService.cancelSubscription).toHaveBeenCalledWith('user-1');
    expect(response.json()).toEqual({ subscription: { planId: 'pro', cancelAtPeriodEnd: true } });
  });

  it('returns payment methods', async () => {
    billingService.listPaymentMethods.mockResolvedValue([{ id: 'pm_1' }]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/billing/payment-methods'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ paymentMethods: [{ id: 'pm_1' }] });
  });

  it('adds a payment method', async () => {
    billingService.addPaymentMethod.mockResolvedValue({ id: 'pm_2' });

    const response = await app.inject({
      method: 'POST',
      url: '/api/billing/payment-methods',
      payload: {
        cardNumber: '4242424242424242',
        cardHolder: 'Pat Example',
        expiryMonth: '12',
        expiryYear: '30',
        setDefault: true
      }
    });

    expect(response.statusCode).toBe(200);
    expect(billingService.addPaymentMethod).toHaveBeenCalledWith('user-1', expect.objectContaining({
      cardNumber: '4242424242424242',
      cardHolder: 'Pat Example',
      expiryMonth: '12',
      expiryYear: '30',
      setDefault: true,
      type: 'card'
    }));
  });

  it('removes a payment method', async () => {
    billingService.removePaymentMethod.mockResolvedValue(undefined);

    const response = await app.inject({
      method: 'DELETE',
      url: '/api/billing/payment-methods/pm_3'
    });

    expect(response.statusCode).toBe(200);
    expect(billingService.removePaymentMethod).toHaveBeenCalledWith('user-1', 'pm_3');
  });
});


