/**
 * Tests for Task Queue
 */

const TaskQueue = require('../../utils/taskQueue');

describe('TaskQueue', () => {
  let queue;

  beforeEach(() => {
    queue = new TaskQueue({ maxConcurrent: 2 });
  });

  test('should initialize with empty queue', () => {
    expect(queue.queue).toEqual([]);
    expect(queue.activeTasks).toBe(0);
  });

  test('should enqueue tasks', () => {
    const task = async () => {};
    queue.enqueue(task);

    expect(queue.queue.length).toBe(1);
  });

  test('should get stats', () => {
    const stats = queue.getStats();
    
    expect(stats).toHaveProperty('queued');
    expect(stats).toHaveProperty('active');
    expect(stats).toHaveProperty('processed');
    expect(stats).toHaveProperty('failed');
  });

  test('should clear queue', () => {
    queue.enqueue(async () => {});
    queue.clear();

    expect(queue.queue.length).toBe(0);
  });
});

