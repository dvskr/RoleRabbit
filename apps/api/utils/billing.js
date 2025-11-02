const { prisma } = require('./db');
const logger = require('./logger');

const PLAN_CATALOG = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Job tracker basics',
      'Resume builder core features',
      '1GB storage limit'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Professional Plan',
    price: 29,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited job applications',
      'Advanced analytics dashboard',
      'Priority email support',
      '5GB secure storage'
    ]
  },
  premium: {
    id: 'premium',
    name: 'Premium Plan',
    price: 59,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Everything in Professional',
      'AI-powered application reviewer',
      'Weekly strategy sessions',
      'Unlimited secure storage'
    ]
  }
};

const DEFAULT_PLAN_ID = 'free';

const getPlanDefinition = (planId) => {
  const plan = PLAN_CATALOG[planId];
  if (!plan) {
    throw new Error('Invalid subscription plan selected');
  }
  return plan;
};

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const addYears = (date, years) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
};

const computePeriodEnd = (start, interval) => {
  if (interval === 'yearly') {
    return addYears(start, 1);
  }
  return addMonths(start, 1);
};

const formatSubscription = (subscription) => {
  const plan = getPlanDefinition(subscription.plan);
  return {
    id: subscription.id,
    planId: subscription.plan,
    planName: plan.name,
    price: subscription.price,
    currency: subscription.currency,
    billingInterval: subscription.billingInterval,
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
    trialEndsAt: subscription.trialEndsAt ? subscription.trialEndsAt.toISOString() : null,
    features: plan.features
  };
};

const formatInvoice = (invoice) => {
  const plan = PLAN_CATALOG[invoice.plan] || PLAN_CATALOG[DEFAULT_PLAN_ID];
  return {
    id: invoice.id,
    planId: invoice.plan,
    planName: plan.name,
    amount: invoice.amount,
    currency: invoice.currency,
    status: invoice.status,
    billingInterval: invoice.billingInterval,
    invoiceDate: invoice.invoiceDate.toISOString(),
    dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
    paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
    invoiceUrl: invoice.invoiceUrl || null
  };
};

const formatPaymentMethod = (method) => ({
  id: method.id,
  type: method.type,
  brand: method.brand,
  last4: method.last4,
  expiryMonth: method.expiryMonth,
  expiryYear: method.expiryYear,
  isDefault: method.isDefault,
  createdAt: method.createdAt.toISOString()
});

const detectCardBrand = (cardNumber = '') => {
  if (cardNumber.startsWith('4')) return 'Visa';
  if (/^(5[1-5])/.test(cardNumber)) return 'Mastercard';
  if (/^3[47]/.test(cardNumber)) return 'American Express';
  if (/^6/.test(cardNumber)) return 'Discover';
  return 'Card';
};

const ensureSubscription = async (userId) => {
  let subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  if (subscription) {
    return subscription;
  }

  const plan = PLAN_CATALOG[DEFAULT_PLAN_ID];
  const now = new Date();

  subscription = await prisma.subscription.create({
    data: {
      userId,
      plan: plan.id,
      status: 'active',
      price: plan.price,
      currency: plan.currency,
      billingInterval: plan.interval,
      currentPeriodStart: now,
      currentPeriodEnd: computePeriodEnd(now, plan.interval)
    }
  });

  return subscription;
};

const calculateUsageSummary = async (userId) => {
  const [resumeCount, jobCount, interviewCount, storageAggregate, user] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.job.count({ where: { userId } }),
    prisma.job.count({ where: { userId, status: { in: ['interview', 'screening'] } } }),
    prisma.cloudFile.aggregate({ where: { userId }, _sum: { size: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { storageLimit: true } })
  ]);

  const storageUsedBytes = storageAggregate._sum.size || 0;
  const storageLimitBytes = user?.storageLimit || 0;
  const storageUsedMB = Math.round(storageUsedBytes / (1024 * 1024));
  const storageLimitMB = storageLimitBytes > 0 ? Math.round(storageLimitBytes / (1024 * 1024)) : null;

  const stats = [
    { label: 'Applications Sent', value: jobCount },
    { label: 'Interviews Scheduled', value: interviewCount },
    { label: 'Resumes Created', value: resumeCount }
  ];

  if (storageLimitMB !== null) {
    stats.push({ label: 'Storage Used (MB)', value: storageUsedMB });
  }

  return stats;
};

const getSubscriptionOverview = async (userId) => {
  const subscription = await ensureSubscription(userId);
  const usage = await calculateUsageSummary(userId);
  return {
    subscription: formatSubscription(subscription),
    usage
  };
};

const listInvoices = async (userId, page = 1, pageSize = 10) => {
  const skip = (page - 1) * pageSize;

  const [totalCount, invoiceRecords] = await Promise.all([
    prisma.invoice.count({ where: { userId } }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { invoiceDate: 'desc' },
      skip,
      take: pageSize
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return {
    invoices: invoiceRecords.map(formatInvoice),
    pagination: {
      page,
      pageSize,
      totalPages,
      totalCount
    }
  };
};

const listPaymentMethods = async (userId) => {
  const methods = await prisma.paymentMethod.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
  });
  return methods.map(formatPaymentMethod);
};

const setDefaultPaymentMethod = async (userId, paymentMethodId) => {
  await prisma.paymentMethod.updateMany({
    where: { userId },
    data: { isDefault: false }
  });

  await prisma.paymentMethod.update({
    where: { id: paymentMethodId },
    data: { isDefault: true }
  });
};

const addPaymentMethod = async (userId, payload) => {
  const { cardNumber, cardHolder, expiryMonth, expiryYear, setDefault = false, type = 'card' } = payload;

  const sanitizedNumber = (cardNumber || '').replace(/\D/g, '');
  if (sanitizedNumber.length < 4) {
    throw new Error('Card number is invalid');
  }

  const method = await prisma.paymentMethod.create({
    data: {
      userId,
      type,
      brand: detectCardBrand(sanitizedNumber),
      last4: sanitizedNumber.slice(-4),
      expiryMonth: expiryMonth ? parseInt(expiryMonth, 10) : null,
      expiryYear: expiryYear ? parseInt(expiryYear, 10) : null,
      isDefault: false
    }
  });

  if (setDefault) {
    await setDefaultPaymentMethod(userId, method.id);
    method.isDefault = true;
  }

  return formatPaymentMethod(method);
};

const removePaymentMethod = async (userId, paymentMethodId) => {
  const existing = await prisma.paymentMethod.findUnique({
    where: { id: paymentMethodId },
    select: { id: true, userId: true, isDefault: true }
  });

  if (!existing || existing.userId !== userId) {
    throw new Error('Payment method not found');
  }

  await prisma.paymentMethod.delete({ where: { id: paymentMethodId } });

  if (existing.isDefault) {
    const fallback = await prisma.paymentMethod.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    if (fallback) {
      await prisma.paymentMethod.update({
        where: { id: fallback.id },
        data: { isDefault: true }
      });
    }
  }
};

const createInvoice = async (subscription, userId, plan) => {
  return prisma.invoice.create({
    data: {
      subscriptionId: subscription.id,
      userId,
      amount: plan.price,
      currency: plan.currency,
      status: plan.price === 0 ? 'paid' : 'paid',
      plan: plan.id,
      billingInterval: plan.interval,
      invoiceDate: new Date(),
      paidAt: plan.price === 0 ? new Date() : new Date()
    }
  });
};

const subscribeUser = async (userId, planId, paymentMethodId) => {
  const plan = getPlanDefinition(planId);
  const subscription = await ensureSubscription(userId);
  const now = new Date();

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      plan: plan.id,
      status: 'active',
      price: plan.price,
      currency: plan.currency,
      billingInterval: plan.interval,
      cancelAtPeriodEnd: false,
      currentPeriodStart: now,
      currentPeriodEnd: computePeriodEnd(now, plan.interval)
    }
  });

  if (paymentMethodId) {
    const method = await prisma.paymentMethod.findFirst({ where: { id: paymentMethodId, userId } });
    if (!method) {
      throw new Error('Payment method not found');
    }
    await setDefaultPaymentMethod(userId, paymentMethodId);
  }

  const invoiceRecord = await createInvoice(updatedSubscription, userId, plan);

  return {
    subscription: formatSubscription(updatedSubscription),
    invoice: formatInvoice(invoiceRecord)
  };
};

const cancelSubscription = async (userId) => {
  const subscription = await ensureSubscription(userId);

  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      cancelAtPeriodEnd: true,
      status: 'cancelling'
    }
  });

  return formatSubscription(updatedSubscription);
};

module.exports = {
  PLAN_CATALOG,
  getSubscriptionOverview,
  subscribeUser,
  cancelSubscription,
  listInvoices,
  listPaymentMethods,
  addPaymentMethod,
  removePaymentMethod
};


