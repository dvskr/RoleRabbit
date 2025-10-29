/**
 * Job Scheduler Utility
 * Manages recurring jobs and tasks
 */

const cron = require('node-cron');
const logger = require('./logger');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }
  
  /**
   * Schedule a job
   */
  schedule(name, pattern, task) {
    const job = cron.schedule(pattern, task);
    this.jobs.set(name, job);
    logger.info(`Scheduled job: ${name}`);
  }
  
  /**
   * Start a job
   */
  start(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.start();
      logger.info(`Started job: ${name}`);
    }
  }
  
  /**
   * Stop a job
   */
  stop(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      logger.info(`Stopped job: ${name}`);
    }
  }
  
  /**
   * Remove a job
   */
  remove(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.destroy();
      this.jobs.delete(name);
      logger.info(`Removed job: ${name}`);
    }
  }
  
  /**
   * Get all jobs
   */
  getJobs() {
    return Array.from(this.jobs.keys());
  }
}

// Singleton instance
const scheduler = new JobScheduler();

module.exports = scheduler;
