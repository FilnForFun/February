/**
 * 上下文自动裁剪模块 - 负责上下文溢出降级、自动压缩、关联度裁剪
 * 复用关联关系引擎(relation.ts)和主动提炼引擎(refine.ts)能力
 * 合规要求：裁剪后核心要点保留率≤原长30%，禁止全量数据返回
 */
import { type RefineResult } from './refine';
import { type Relation } from './relation';
export declare class ContextTrimEngine {
    private config;
    constructor(defaultConfig?: ContextTrimOptions);
    /**
     * 自动裁剪上下文核心方法
     * @param originalContent 原始上下文内容
     * @param options 裁剪选项
     * @returns 裁剪结果
     */
    trimContext(originalContent: string, options?: ContextTrimOptions): Promise<ContextTrimResult>;
    /**
     * 批量裁剪上下文
     * @param contents 原始内容列表
     * @param options 裁剪选项
     * @returns 批量裁剪结果
     */
    batchTrimContext(contents: string[], options?: ContextTrimOptions): Promise<ContextTrimResult[]>;
    /**
     * 溢出降级专用方法：用于大上下文场景自动降级
     * @param content 原始上下文
     * @param maxAllowedLength 最大允许长度
     * @returns 降级后的内容
     */
    overflowDowngrade(content: string, maxAllowedLength?: number): Promise<string>;
}
export interface ContextTrimOptions {
    relatedEntityId?: string;
    targetCompressionRate?: number;
    enableRelationTrim?: boolean;
    enableOverflowDowngrade?: boolean;
    overflowThreshold?: number;
}
export interface ContextTrimResult {
    originalLength: number;
    trimmedLength: number;
    compressionRate: number;
    trimmedContent: string;
    refineResult?: RefineResult;
    relatedRelations?: Relation[];
    trimmedAt: number;
}
/**
 * 自动裁剪上下文核心方法
 * @param originalContent 原始上下文内容
 * @param options 裁剪选项
 * @returns 裁剪结果
 */
export declare function trimContext(originalContent: string, options?: ContextTrimOptions): Promise<ContextTrimResult>;
/**
 * 批量裁剪上下文
 * @param contents 原始内容列表
 * @param options 裁剪选项
 * @returns 批量裁剪结果
 */
export declare function batchTrimContext(contents: string[], options?: ContextTrimOptions): Promise<ContextTrimResult[]>;
/**
 * 溢出降级专用方法：用于大上下文场景自动降级
 * @param content 原始上下文
 * @param maxAllowedLength 最大允许长度
 * @returns 降级后的内容
 */
export declare function overflowDowngrade(content: string, maxAllowedLength?: number): Promise<string>;
