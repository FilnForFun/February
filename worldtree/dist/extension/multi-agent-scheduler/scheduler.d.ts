import type { SchedulerConfig, TaskContext } from './types';
export declare class MultiAgentScheduler {
    private config;
    private permissionController;
    private roundRobinCounter;
    constructor(config?: Partial<SchedulerConfig>);
    private selectAgentByStrategy;
    scheduleTask(task: TaskContext): Promise<string | null>;
    private startAutoRecycleJob;
}
