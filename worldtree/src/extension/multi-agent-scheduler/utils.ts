// World Tree Memory Base integration (使用本地文件存储对接世界树记忆底座)
import * as fs from 'fs/promises';
import * as path from 'path';

const MEMORY_BASE_PATH = 'D:/Ollama/worldtree/task-memory';

// 确保目录存在
async function ensureDir() {
  try {
    await fs.access(MEMORY_BASE_PATH);
  } catch {
    await fs.mkdir(MEMORY_BASE_PATH, { recursive: true });
  }
}

export const MemoryBase = {
  async writeTaskResult(taskId: string, result: any): Promise<void> {
    await ensureDir();
    await fs.writeFile(path.join(MEMORY_BASE_PATH, `${taskId}-result.json`), JSON.stringify(result, null, 2), 'utf-8');
  },

  async readTaskContext(taskId: string): Promise<any> {
    try {
      const content = await fs.readFile(path.join(MEMORY_BASE_PATH, `${taskId}-result.json`), 'utf-8');
      return JSON.parse(content);
    } catch {
      return null;
    }
  },

  async cleanTaskData(taskId: string): Promise<void> {
    try {
      await fs.unlink(path.join(MEMORY_BASE_PATH, `${taskId}-result.json`));
    } catch {
      // 忽略不存在的文件
    }
  }
};

// Auto recycle helper
export const autoRecycleAgent = async (agentId: string): Promise<void> => {
  const { agentManager } = await import('@worldtree/core/agent-manager');
  await agentManager.terminate(agentId, 'auto-recycle');
};
