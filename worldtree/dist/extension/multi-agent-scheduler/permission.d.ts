import type { AgentInstance, TaskContext } from './types';
export declare class PermissionController {
    private static readonly GLOBAL_DENY_PERMISSIONS;
    validateAgentPermission(agent: AgentInstance, task: TaskContext): boolean;
    validateTaskCompliance(task: TaskContext): boolean;
}
