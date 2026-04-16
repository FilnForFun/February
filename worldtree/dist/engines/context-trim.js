"use strict";
/**
 * 上下文自动裁剪模块 - 负责上下文溢出降级、自动压缩、关联度裁剪
 * 复用关联关系引擎(relation.ts)和主动提炼引擎(refine.ts)能力
 * 合规要求：裁剪后核心要点保留率≤原长30%，禁止全量数据返回
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextTrimEngine = void 0;
exports.trimContext = trimContext;
exports.batchTrimContext = batchTrimContext;
exports.overflowDowngrade = overflowDowngrade;
const refine_1 = require("./refine");
const relation_1 = require("./relation");
class ContextTrimEngine {
    constructor(defaultConfig = {}) {
        this.config = {
            targetCompressionRate: 0.3,
            enableRelationTrim: true,
            enableOverflowDowngrade: true,
            overflowThreshold: 2000,
            ...defaultConfig
        };
    }
    /**
     * 自动裁剪上下文核心方法
     * @param originalContent 原始上下文内容
     * @param options 裁剪选项
     * @returns 裁剪结果
     */
    async trimContext(originalContent, options = {}) {
        const mergedOptions = { ...this.config, ...options };
        return trimContext(originalContent, mergedOptions);
    }
    /**
     * 批量裁剪上下文
     * @param contents 原始内容列表
     * @param options 裁剪选项
     * @returns 批量裁剪结果
     */
    async batchTrimContext(contents, options = {}) {
        const mergedOptions = { ...this.config, ...options };
        return batchTrimContext(contents, mergedOptions);
    }
    /**
     * 溢出降级专用方法：用于大上下文场景自动降级
     * @param content 原始上下文
     * @param maxAllowedLength 最大允许长度
     * @returns 降级后的内容
     */
    async overflowDowngrade(content, maxAllowedLength = 2000) {
        return overflowDowngrade(content, maxAllowedLength);
    }
}
exports.ContextTrimEngine = ContextTrimEngine;
/**
 * 自动裁剪上下文核心方法
 * @param originalContent 原始上下文内容
 * @param options 裁剪选项
 * @returns 裁剪结果
 */
async function trimContext(originalContent, options = {}) {
    const { relatedEntityId, targetCompressionRate = 0.3, enableRelationTrim = true, enableOverflowDowngrade = true, overflowThreshold = 2000 } = options;
    const originalLength = originalContent.length;
    const result = {
        originalLength,
        trimmedLength: 0,
        compressionRate: 0,
        trimmedContent: '',
        trimmedAt: Date.now()
    };
    // 溢出降级触发判断
    if (enableOverflowDowngrade && originalLength <= overflowThreshold) {
        // 未超过阈值，仅做最小程度提炼
        const refineRes = await (0, refine_1.refineContent)(originalContent, {
            generateSummary: true,
            maxSummaryLength: Math.floor(originalLength * targetCompressionRate)
        });
        result.trimmedContent = refineRes.summary || originalContent.slice(0, Math.floor(originalLength * targetCompressionRate));
        result.refineResult = refineRes;
    }
    else {
        // 超过阈值或主动裁剪，执行完整裁剪流程
        let contentToTrim = originalContent;
        // 1. 关联度裁剪：如果指定了关联实体，优先保留关联内容
        if (enableRelationTrim && relatedEntityId) {
            const relations = await (0, relation_1.queryRelations)(relatedEntityId, 'both', { minWeight: 0.6 });
            result.relatedRelations = relations;
            // 基于关联权重过滤内容片段（实际实现可结合实体匹配）
        }
        // 2. 主动提炼压缩
        const maxLength = Math.floor(originalLength * targetCompressionRate);
        const refineRes = await (0, refine_1.refineContent)(contentToTrim, {
            generateSummary: true,
            extractKeywords: true,
            extractEntities: true,
            maxSummaryLength: maxLength
        });
        result.trimmedContent = refineRes.summary || contentToTrim.slice(0, maxLength);
        result.refineResult = refineRes;
    }
    // 强制合规校验：确保压缩比例不超过30%
    result.trimmedLength = result.trimmedContent.length;
    result.compressionRate = result.trimmedLength / originalLength;
    if (result.compressionRate > targetCompressionRate) {
        result.trimmedContent = result.trimmedContent.slice(0, Math.floor(originalLength * targetCompressionRate));
        result.trimmedLength = result.trimmedContent.length;
        result.compressionRate = result.trimmedLength / originalLength;
    }
    return result;
}
/**
 * 批量裁剪上下文
 * @param contents 原始内容列表
 * @param options 裁剪选项
 * @returns 批量裁剪结果
 */
async function batchTrimContext(contents, options = {}) {
    return Promise.all(contents.map(content => trimContext(content, options)));
}
/**
 * 溢出降级专用方法：用于大上下文场景自动降级
 * @param content 原始上下文
 * @param maxAllowedLength 最大允许长度
 * @returns 降级后的内容
 */
async function overflowDowngrade(content, maxAllowedLength = 2000) {
    if (content.length <= maxAllowedLength)
        return content;
    const trimRes = await trimContext(content, {
        targetCompressionRate: maxAllowedLength / content.length,
        enableOverflowDowngrade: true
    });
    return trimRes.trimmedContent;
}
