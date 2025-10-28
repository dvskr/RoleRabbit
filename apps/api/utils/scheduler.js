/**
 * Background Job Scheduler
 * Handles scheduled tasks with cron-like functionality
 */

const cron = require('node-cron');

class JobScheduler {
  constructor() {
    this.jobs = new Map();
  }

  /**
   * Schedule a job
   */
  schedule(name, cronExpression, callback) {
    if (this.jobs.has(name)) {
      this.stop(name);
    }

    const task = cron.schedule(cronExpression, callback, {
      scheduled: true,
      timezone: 'America/New_York'
    });

    this.jobs.set(name, task);
    console.log(`Scheduled job: ${name} with expression ${cronExpression}`);
  }

  /**
   * Stop a job
   */
  stop(name) {
    const task = this.jobs.get(name);
    if (task) {
      task.stop();
      this.jobs.delete(name);
      console.log(`Stopped job: ${name}`);
    }
  }

  /**
   * Get job status
   */
  getStatus() {
    return {
      activeJobs: this.jobs.size,
      jobs: Array.from(this.jobs.keys())
    };
  }

  /**
   * Stop all jobs
   */
  stopAll() {
    this.jobs.forEach((task, name) => {
      task.stop();
    });
    this.jobs.clear();
  }
}

module.exports = new JobScheduler();

