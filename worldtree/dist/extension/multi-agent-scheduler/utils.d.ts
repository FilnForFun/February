export declare const MemoryBase: {
    writeTaskResult(taskId: string, result: any): Promise<void>;
    readTaskContext(taskId: string): Promise<any>;
    cleanTaskData(taskId: string): Promise<void>;
};
export declare const autoRecycleAgent: (agentId: string) => Promise<void>;
