/**
 * 主动提炼引擎 - 负责内容提炼、实体抽取、关键信息提取、摘要生成
 * 遵循世界树架构数据结构规范
 */
export interface RefineOptions {
    extractEntities?: boolean;
    generateSummary?: boolean;
    extractKeywords?: boolean;
    maxSummaryLength?: number;
}
export interface RefineResult {
    originalContent: string;
    summary?: string;
    entities?: Array<{
        type: string;
        value: string;
        confidence: number;
    }>;
    keywords?: Array<{
        word: string;
        weight: number;
    }>;
    processedAt: number;
}
/**
 * 提炼内容核心信息
 * @param content 原始内容
 * @param options 提炼选项
 * @returns 提炼结果
 */
export declare function refineContent(content: string, options?: RefineOptions): Promise<RefineResult>;
/**
 * 批量提炼内容
 * @param contents 内容列表
 * @param options 提炼选项
 * @returns 批量提炼结果
 */
export declare function batchRefine(contents: string[], options?: RefineOptions): Promise<RefineResult[]>;
