/**
 * Task Queue Utility
 * Manages background job processing
 */

const EventEmitter = require('events');
const logger = require('./logger');

class TaskQueue extends EventEmitter {
  constructor(options = {}) {
    super();
    this.concurrent = options.concurrent || 3;
    this.queue = [];
    this.running = [];
  }
  
  /**
   * Add task to queue
   */
  enqueue(task) {
    this.queue.push(task);
    this.process();
  }
  
  /**
   * Process tasks
   */
  async process() {
    if (this.running.length >= this.concurrent) {
      return;
    }
    
    const task = this.queue.shift();
    if (!task) {
      return;
    }
    
    this.running.push(task);
    
    try {
      await task();
      this.emit('completed', task);
    } catch (error) {
      logger.error('Task failed', error);
      this.emit('failed', task, error);
    } finally {
      const index = this.running.indexOf(task);
      if (index > -1) {
        this.running.splice(index, 1);
      }
      this.process();
    }
  }
  
  /**
   * Get queue size
   */
  getSize() {
    return this.queue.length + this.running.length;
  }
  
  /**
   * Clear queue
   */
  clear() {
    this.queue = [];
  }
}

// Singleton instance
const taskQueue = new TaskQueue();

module.exports = taskQueue;
