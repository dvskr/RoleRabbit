/**
 * Task Scheduler
 * Handles cron jobs and scheduled tasks
 */

const cron = require('node-cron');

const jobs = new Map();

function scheduleTask(name, cronExpression, callback) {
  if (jobs.has(name)) {
    throw new Error(`Task ${name} is already scheduled`);
  }

  const task = cron.schedule(cronExpression, callback, {
    scheduled: false,
    timezone: 'UTC'
  });

  jobs.set(name, {
    task,
    expression: cronExpression,
    running: false
  });

  return task;
}

function startTask(name) {
  const job = jobs.get(name);
  if (!job) {
    throw new Error(`Task ${name} not found`);
  }
  
  job.task.start();
  job.running = true;
  console.log(`✅ Task "${name}" started`);
}

function stopTask(name) {
  const job = jobs.get(name);
  if (!job) {
    throw new Error(`Task ${name} not found`);
  }
  
  job.task.stop();
  job.running = false;
  console.log(`⏸️ Task "${name}" stopped`);
}

function removeTask(name) {
  const job = jobs.get(name);
  if (!job) {
    throw new Error(`Task ${name} not found`);
  }
  
  job.task.stop();
  job.task.destroy();
  jobs.delete(name);
  console.log(`🗑️ Task "${name}" removed`);
}

function getAllTasks() {
  return Array.from(jobs.entries()).map(([name, job]) => ({
    name,
    expression: job.expression,
    running: job.running
  }));
}

// Predefined common tasks
const TASKS = {
  HOURLY: '0 * * * *',
  DAILY: '0 0 * * *',
  WEEKLY: '0 0 * * 0',
  MONTHLY: '0 0 1 * *',
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *'
};

module.exports = {
  scheduleTask,
  startTask,
  stopTask,
  removeTask,
  getAllTasks,
  TASKS
};
