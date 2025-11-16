/**
 * Test Fixtures: Analytics Data (Section 5.5)
 *
 * Realistic analytics data with varying view counts, traffic sources, countries
 */

export const testAnalytics = {
  dailyViews: [
    // Last 30 days of data
    ...Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));

      return {
        portfolioId: 'portfolio-fullstack-1',
        date: date.toISOString().split('T')[0],
        views: Math.floor(50 + Math.random() * 150), // 50-200 views per day
        uniqueVisitors: Math.floor(30 + Math.random() * 100), // 30-130 unique visitors
        bounceRate: 0.3 + Math.random() * 0.3, // 30-60% bounce rate
        avgTimeOnPage: 120 + Math.random() * 180, // 2-5 minutes
      };
    }),
  ],

  trafficSources: [
    {
      portfolioId: 'portfolio-fullstack-1',
      source: 'Google',
      type: 'organic',
      visitors: 3420,
      percentage: 45.2,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      source: 'LinkedIn',
      type: 'social',
      visitors: 2150,
      percentage: 28.4,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      source: 'GitHub',
      type: 'referral',
      visitors: 980,
      percentage: 12.9,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      source: 'Direct',
      type: 'direct',
      visitors: 685,
      percentage: 9.0,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      source: 'Twitter',
      type: 'social',
      visitors: 340,
      percentage: 4.5,
    },
  ],

  geographicData: [
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'United States',
      countryCode: 'US',
      visitors: 3800,
      percentage: 50.2,
      topCities: [
        { city: 'San Francisco', visitors: 850 },
        { city: 'New York', visitors: 720 },
        { city: 'Seattle', visitors: 580 },
        { city: 'Austin', visitors: 450 },
        { city: 'Boston', visitors: 380 },
      ],
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'United Kingdom',
      countryCode: 'GB',
      visitors: 980,
      percentage: 12.9,
      topCities: [
        { city: 'London', visitors: 520 },
        { city: 'Manchester', visitors: 180 },
        { city: 'Edinburgh', visitors: 140 },
      ],
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'Canada',
      countryCode: 'CA',
      visitors: 720,
      percentage: 9.5,
      topCities: [
        { city: 'Toronto', visitors: 310 },
        { city: 'Vancouver', visitors: 220 },
        { city: 'Montreal', visitors: 190 },
      ],
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'Germany',
      countryCode: 'DE',
      visitors: 620,
      percentage: 8.2,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'India',
      countryCode: 'IN',
      visitors: 580,
      percentage: 7.7,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'Australia',
      countryCode: 'AU',
      visitors: 450,
      percentage: 5.9,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'France',
      countryCode: 'FR',
      visitors: 280,
      percentage: 3.7,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      country: 'Netherlands',
      countryCode: 'NL',
      visitors: 145,
      percentage: 1.9,
    },
  ],

  deviceData: [
    {
      portfolioId: 'portfolio-fullstack-1',
      deviceType: 'desktop',
      visitors: 4550,
      percentage: 60.1,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      deviceType: 'mobile',
      visitors: 2280,
      percentage: 30.1,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      deviceType: 'tablet',
      visitors: 740,
      percentage: 9.8,
    },
  ],

  browserData: [
    {
      portfolioId: 'portfolio-fullstack-1',
      browser: 'Chrome',
      version: '120.0',
      visitors: 4175,
      percentage: 55.1,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      browser: 'Safari',
      version: '17.2',
      visitors: 1820,
      percentage: 24.0,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      browser: 'Firefox',
      version: '121.0',
      visitors: 910,
      percentage: 12.0,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      browser: 'Edge',
      version: '120.0',
      visitors: 530,
      percentage: 7.0,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      browser: 'Other',
      version: 'Various',
      visitors: 145,
      percentage: 1.9,
    },
  ],

  pageViews: [
    {
      portfolioId: 'portfolio-fullstack-1',
      page: '/',
      path: '/',
      views: 7580,
      uniqueViews: 5230,
      avgTimeOnPage: 245,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      page: 'Projects',
      path: '#projects',
      views: 4320,
      uniqueViews: 3150,
      avgTimeOnPage: 320,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      page: 'About',
      path: '#about',
      views: 3890,
      uniqueViews: 2940,
      avgTimeOnPage: 180,
    },
    {
      portfolioId: 'portfolio-fullstack-1',
      page: 'Contact',
      path: '#contact',
      views: 1250,
      uniqueViews: 980,
      avgTimeOnPage: 90,
    },
  ],

  hourlyDistribution: [
    ...Array.from({ length: 24 }, (_, hour) => ({
      portfolioId: 'portfolio-fullstack-1',
      hour,
      // Peak hours: 9am-5pm (work hours)
      visitors: hour >= 9 && hour <= 17
        ? Math.floor(200 + Math.random() * 150)
        : Math.floor(50 + Math.random() * 100),
    })),
  ],

  weeklyDistribution: [
    { day: 'Monday', visitors: 1150 },
    { day: 'Tuesday', visitors: 1320 },
    { day: 'Wednesday', visitors: 1280 },
    { day: 'Thursday', visitors: 1190 },
    { day: 'Friday', visitors: 980 },
    { day: 'Saturday', visitors: 550 },
    { day: 'Sunday', visitors: 480 },
  ],
};

export const generateAnalyticsForPortfolio = (portfolioId: string, days: number = 30) => {
  return {
    dailyViews: Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      return {
        portfolioId,
        date: date.toISOString().split('T')[0],
        views: Math.floor(50 + Math.random() * 150),
        uniqueVisitors: Math.floor(30 + Math.random() * 100),
        bounceRate: 0.3 + Math.random() * 0.3,
        avgTimeOnPage: 120 + Math.random() * 180,
      };
    }),
  };
};

export default testAnalytics;
