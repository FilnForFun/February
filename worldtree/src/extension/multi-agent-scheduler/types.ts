export type AgentRole = 'worker' | 'reviewer' | 'supervisor' | 'scheduler';
export type LoadBalanceStrategy = 'round-robin' | 'least-load' | 'random';
export interface AgentInstance {
  id: string;
  role: AgentRole;
  currentLoad: number;
  maxLoad: number;
  permissions: string[];
  status: 'idle' | 'running' | 'recycling';
  lastActive: number;
}
export interface SchedulerConfig {
  loadBalanceStrategy: LoadBalanceStrategy;
  autoRecycleThreshold: number;
  maxAgentInstances: number;
  enforceSummaryLimit: number;
}
export interface TaskContext {
  taskId: string;
  requiredPermissions: string[];
  priority: number;
  payload: Record<string, any>;
}
