/**
 * Task Queue Manager
 * Handles background job processing
 */

class TaskQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  /**
   * Add task to queue
   */
  add(task) {
    this.queue.push({ ...task, id: this.generateId(), createdAt: new Date() });
    
    if (!this.processing) {
      this.process();
    }
  }

  /**
   * Process queue
   */
  async process() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      
      try {
        await this.executeTask(task);
      } catch (error) {
        console.error('Task failed:', task.id, error);
      }
    }
    
    this.processing = false;
  }

  /**
   * Execute a task
   */
  async executeTask(task) {
    console.log(`Executing task: ${task.type} (ID: ${task.id})`);
    
    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return { success: true, taskId: task.id };
  }

  /**
   * Generate task ID
   */
  generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing
    };
  }
}

module.exports = new TaskQueue();

