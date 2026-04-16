/**
 * 索引管理模块 - 负责向量索引、全文索引的创建、更新、删除、查询
 * 遵循世界树架构数据结构规范
 */
export type IndexType = 'vector' | 'fulltext' | 'hybrid';
export interface IndexConfig {
    indexName: string;
    indexType: IndexType;
    dimension?: number;
    fields: string[];
}
export interface IndexItem {
    id: string;
    content: string;
    vector?: number[];
    metadata?: Record<string, any>;
    timestamp: number;
}
export interface SearchOptions {
    topK?: number;
    minScore?: number;
    filter?: Record<string, any>;
}
export interface SearchResult {
    item: IndexItem;
    score: number;
}
/**
 * 创建索引
 * @param config 索引配置
 * @returns 是否创建成功
 */
export declare function createIndex(config: IndexConfig): Promise<boolean>;
/**
 * 删除索引
 * @param indexName 索引名称
 * @returns 是否删除成功
 */
export declare function dropIndex(indexName: string): Promise<boolean>;
/**
 * 向索引中添加数据
 * @param indexName 索引名称
 * @param items 数据项列表
 * @returns 添加是否成功
 */
export declare function addToIndex(indexName: string, items: IndexItem[]): Promise<boolean>;
/**
 * 从索引中删除数据
 * @param indexName 索引名称
 * @param itemIds 数据项ID列表
 * @returns 删除是否成功
 */
export declare function removeFromIndex(indexName: string, itemIds: string[]): Promise<boolean>;
/**
 * 搜索索引
 * @param indexName 索引名称
 * @param query 查询内容/向量
 * @param options 搜索选项
 * @returns 搜索结果列表
 */
export declare function searchIndex(indexName: string, query: string | number[], options?: SearchOptions): Promise<SearchResult[]>;
/**
 * 获取索引状态
 * @param indexName 索引名称
 * @returns 索引状态信息
 */
export declare function getIndexStatus(indexName: string): Promise<{
    exists: boolean;
    itemCount: number;
    indexType: IndexType;
    lastUpdated: number;
} | null>;
/**
 * 增量更新索引（索引优先核心能力）
 * @param indexName 索引名称
 * @param items 变更数据项
 * @param detectConflicts 是否开启冲突检测
 * @returns 更新结果，包含冲突项和成功项
 */
export declare function incrementalUpdate(indexName: string, items: IndexItem[], detectConflicts?: boolean): Promise<{
    successCount: number;
    conflictItems: Array<{
        id: string;
        reason: string;
        existing: IndexItem;
        new: IndexItem;
    }>;
    updatedAt: number;
}>;
/**
 * 全量重建索引
 * @param indexName 索引名称
 * @param sourcePath 数据源路径（.index目录）
 * @returns 重建结果
 */
export declare function fullRebuildIndex(indexName: string, sourcePath?: string): Promise<{
    totalItems: number;
    successCount: number;
    failedItems: string[];
    duration: number;
}>;
/**
 * 解决索引冲突
 * @param indexName 索引名称
 * @param conflictId 冲突数据ID
 * @param resolveStrategy 解决策略：'use-new' | 'use-existing' | 'merge'
 * @returns 解决是否成功
 */
export declare function resolveIndexConflict(indexName: string, conflictId: string, resolveStrategy: 'use-new' | 'use-existing' | 'merge'): Promise<boolean>;
/**
 * 自动更新触发器（监听.index目录变更）
 * @param indexName 索引名称
 * @param watchPath 监听路径
 * @returns 监听器ID
 */
export declare function startAutoUpdate(indexName: string, watchPath?: string): Promise<string>;
/**
 * 停止自动更新
 * @param listenerId 监听器ID
 */
export declare function stopAutoUpdate(listenerId: string): Promise<void>;
