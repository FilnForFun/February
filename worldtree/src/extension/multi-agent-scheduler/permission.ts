import type { AgentInstance, TaskContext } from './types';

export class PermissionController {
  private static readonly GLOBAL_DENY_PERMISSIONS = new Set([
    'global.state.write',
    'system.modify',
    'user.data.exfiltrate'
  ]);

  validateAgentPermission(agent: AgentInstance, task: TaskContext): boolean {
    if (agent.status !== 'idle') return false;
    if (task.requiredPermissions.some(p => PermissionController.GLOBAL_DENY_PERMISSIONS.has(p))) return false;
    return task.requiredPermissions.every(p => agent.permissions.includes(p));
  }

  validateTaskCompliance(task: TaskContext): boolean {
    if (task.payload?.summaryLength && task.payload.summaryLength > 500) return false;
    if (task.payload?.mode && task.payload.mode !== 'run') return false;
    if (task.payload?.requiresGlobalSync === true) return false;
    return true;
  }
}
