module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/dashboard?tab=storage', // Storage page specifically
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'ready - started server',
      numberOfRuns: 3, // Run 3 times for better average metrics
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10 * 1024,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }], // Stricter requirement for production
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 500 }], // TBT under 500ms
        'interactive': ['warn', { maxNumericValue: 3000 }], // TTI under 3 seconds
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouse',
    },
  },
};


