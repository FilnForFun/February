import type { AgentInstance, SchedulerConfig, TaskContext, LoadBalanceStrategy } from './types';
import { PermissionController } from './permission';
import { MemoryBase } from './utils';

export class MultiAgentScheduler {
  private config: SchedulerConfig;
  private permissionController: PermissionController;
  private roundRobinCounter = 0;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      loadBalanceStrategy: 'least-load',
      autoRecycleThreshold: 300000,
      maxAgentInstances: 10,
      enforceSummaryLimit: 500,
      ...config
    };
    this.permissionController = new PermissionController();
    this.startAutoRecycleJob();
  }

  private selectAgentByStrategy(strategy: LoadBalanceStrategy, eligibleAgents: AgentInstance[]): AgentInstance | null {
    if (eligibleAgents.length === 0) return null;
    switch (strategy) {
      case 'round-robin':
        const idx = this.roundRobinCounter % eligibleAgents.length;
        this.roundRobinCounter++;
        return eligibleAgents[idx];
      case 'least-load':
        return eligibleAgents.sort((a, b) => a.currentLoad - b.currentLoad)[0];
      case 'random':
        return eligibleAgents[Math.floor(Math.random() * eligibleAgents.length)];
      default:
        return eligibleAgents[0];
    }
  }

  async scheduleTask(task: TaskContext): Promise<string | null> {
    if (!this.permissionController.validateTaskCompliance(task)) return null;
    const { agentManager } = await import('@worldtree/core/agent-manager');
    const allAgents = await agentManager.list() as AgentInstance[];
    const eligibleAgents = allAgents.filter(agent => 
      this.permissionController.validateAgentPermission(agent, task)
    );
    const selectedAgent = this.selectAgentByStrategy(this.config.loadBalanceStrategy, eligibleAgents);
    if (!selectedAgent) return null;
    await MemoryBase.writeTaskResult(task.taskId, { assignedAgent: selectedAgent.id, status: 'pending' });
    await agentManager.dispatch(selectedAgent.id, task);
    return selectedAgent.id;
  }

  private startAutoRecycleJob(): void {
    setInterval(async () => {
      const { agentManager } = await import('@worldtree/core/agent-manager');
      const allAgents = await agentManager.list() as AgentInstance[];
      const now = Date.now();
      for (const agent of allAgents) {
        if (agent.status === 'idle' && now - agent.lastActive > this.config.autoRecycleThreshold) {
          await autoRecycleAgent(agent.id);
        }
      }
    }, 60000);
  }
}
