/**
 * Task Queue
 * Manages background tasks with concurrency control
 */

class TaskQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.queue = [];
    this.running = [];
  }

  async enqueue(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        task,
        resolve,
        reject
      });
      this.process();
    });
  }

  async process() {
    if (this.running.length >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    if (!item) return;

    this.running.push(item);

    try {
      const result = await item.task();
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.running = this.running.filter(r => r !== item);
      this.process();
    }
  }

  getQueueLength() {
    return this.queue.length;
  }

  getRunningCount() {
    return this.running.length;
  }

  clear() {
    this.queue = [];
  }
}

const taskQueue = new TaskQueue();

module.exports = taskQueue;
