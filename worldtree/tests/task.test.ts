import { createTask, startTask, updateTaskProgress, completeTask, failTask, cancelTask, getTask } from '../src/engines/task';

describe('task lifecycle manager', () => {
  test('createTask returns valid task object', async () => {
    const task = await createTask('测试任务', 'refine_content', { content: '测试内容' });
    expect(task.id).toStartWith('task_');
    expect(task.name).toBe('测试任务');
    expect(task.type).toBe('refine_content');
    expect(task.status).toBe('pending');
    expect(task.progress).toBe(0);
    expect(task.payload.content).toBe('测试内容');
    expect(task.createdAt).toBeGreaterThan(0);
  });

  test('getTask returns null for non-existent task', async () => {
    const task = await getTask('non_existent_task');
    expect(task).toBeNull();
  });

  test('cancelTask returns null for non-existent task', async () => {
    const task = await cancelTask('non_existent_task');
    expect(task).toBeNull();
  });

  test('failTask returns null for non-existent task', async () => {
    const task = await failTask('non_existent_task', '测试错误');
    expect(task).toBeNull();
  });
});
