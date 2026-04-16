/**
 * 任务生命周期管理模块 - 负责任务状态管理、生命周期钩子、调度、进度跟踪、错误处理
 * 遵循世界树架构数据结构规范
 */
export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface Task {
    id: string;
    name: string;
    type: string;
    status: TaskStatus;
    progress: number;
    payload: Record<string, any>;
    result?: Record<string, any>;
    error?: string;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    updatedAt: number;
}
export interface TaskHooks {
    onStart?: (task: Task) => Promise<void>;
    onProgress?: (task: Task, progress: number) => Promise<void>;
    onComplete?: (task: Task, result: Record<string, any>) => Promise<void>;
    onFail?: (task: Task, error: string) => Promise<void>;
    onCancel?: (task: Task) => Promise<void>;
}
/**
 * 创建新任务
 * @param name 任务名称
 * @param type 任务类型
 * @param payload 任务负载
 * @returns 创建的任务对象
 */
export declare function createTask(name: string, type: string, payload?: Record<string, any>): Promise<Task>;
/**
 * 启动任务
 * @param taskId 任务ID
 * @param hooks 生命周期钩子
 * @returns 更新后的任务对象
 */
export declare function startTask(taskId: string, hooks?: TaskHooks): Promise<Task | null>;
/**
 * 更新任务进度
 * @param taskId 任务ID
 * @param progress 进度值 0-100
 * @returns 更新后的任务对象
 */
export declare function updateTaskProgress(taskId: string, progress: number): Promise<Task | null>;
/**
 * 完成任务
 * @param taskId 任务ID
 * @param result 任务结果
 * @returns 更新后的任务对象
 */
export declare function completeTask(taskId: string, result: Record<string, any>): Promise<Task | null>;
/**
 * 标记任务失败
 * @param taskId 任务ID
 * @param error 错误信息
 * @returns 更新后的任务对象
 */
export declare function failTask(taskId: string, error: string): Promise<Task | null>;
/**
 * 取消任务
 * @param taskId 任务ID
 * @returns 更新后的任务对象
 */
export declare function cancelTask(taskId: string): Promise<Task | null>;
/**
 * 查询任务信息
 * @param taskId 任务ID
 * @returns 任务对象
 */
export declare function getTask(taskId: string): Promise<Task | null>;
