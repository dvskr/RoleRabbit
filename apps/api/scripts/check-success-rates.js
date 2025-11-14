#!/usr/bin/env node

/**
 * Automated Success Rate Monitoring Script
 * 
 * Run this script periodically (e.g., every hour) to check success rates
 * and trigger alerts when thresholds are breached.
 * 
 * Usage:
 *   node scripts/check-success-rates.js
 * 
 * Cron example (every hour):
 *   0 * * * * cd /path/to/app && node apps/api/scripts/check-success-rates.js
 */

const { checkSuccessRatesAndAlert } = require('../services/monitoring/successRateMonitor');
const logger = require('../utils/logger');

async function main() {
  try {
    logger.info('Starting success rate check...');
    
    const report = await checkSuccessRatesAndAlert();
    
    logger.info('Success rate check complete', {
      healthScore: report.overview.healthScore,
      status: report.overview.status,
      alertCount: report.alerts.length,
      avgSuccessRate: report.overview.avgSuccessRate,
      featuresAboveTarget: report.overview.featuresAboveTarget
    });
    
    // Log summary
    console.log('\n=== Success Rate Report ===');
    console.log(`Health Score: ${report.overview.healthScore}/100 (${report.overview.status})`);
    console.log(`Average Success Rate: ${report.overview.avgSuccessRate}%`);
    console.log(`Features Above Target: ${report.overview.featuresAboveTarget}/${report.overview.totalFeatures}`);
    
    console.log('\n=== Feature Success Rates ===');
    for (const rate of report.successRates) {
      const status = rate.meetsTarget ? '✅' : '❌';
      console.log(`${status} ${rate.feature}: ${rate.successRate}% (target: ${rate.target}%) - ${rate.total} requests`);
    }
    
    console.log('\n=== Response Times ===');
    for (const time of report.responseTimes) {
      if (time.sampleSize === 0) continue;
      const status = time.meetsTarget ? '✅' : '❌';
      console.log(`${status} ${time.feature}: ${time.avgResponseTime}ms avg (target: ${time.target}ms) - p95: ${time.p95}ms`);
    }
    
    if (report.alerts.length > 0) {
      console.log('\n=== Alerts ===');
      for (const alert of report.alerts) {
        const icon = alert.severity === 'critical' ? '🚨' : '⚠️';
        console.log(`${icon} [${alert.severity.toUpperCase()}] ${alert.message}`);
      }
    } else {
      console.log('\n✅ No alerts - All systems operating within targets');
    }
    
    console.log('\n');
    
    // Exit with error code if critical alerts
    const criticalAlerts = report.alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      logger.error(`Found ${criticalAlerts.length} critical alerts`);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    logger.error('Success rate check failed', {
      error: error.message,
      stack: error.stack
    });
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled rejection in success rate check', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

main();

