/**
 * 关联关系引擎 - 负责实体关系映射、关联挖掘、关系权重计算、关系查询
 * 遵循世界树架构数据结构规范
 */
export interface Entity {
    id: string;
    type: string;
    value: string;
}
export interface Relation {
    id: string;
    fromEntityId: string;
    toEntityId: string;
    relationType: string;
    weight: number;
    confidence: number;
    createdAt: number;
    updatedAt: number;
}
export interface RelationQueryOptions {
    relationType?: string;
    minWeight?: number;
    minConfidence?: number;
    limit?: number;
}
/**
 * 创建实体间关系
 * @param from 源实体
 * @param to 目标实体
 * @param relationType 关系类型
 * @param weight 关系权重
 * @param confidence 置信度
 * @returns 创建的关系对象
 */
export declare function createRelation(from: Entity, to: Entity, relationType: string, weight?: number, confidence?: number): Promise<Relation>;
/**
 * 查询实体关联关系
 * @param entityId 实体ID
 * @param direction 查询方向: 'in' | 'out' | 'both'
 * @param options 查询选项
 * @returns 关系列表
 */
export declare function queryRelations(entityId: string, direction?: 'in' | 'out' | 'both', options?: RelationQueryOptions): Promise<Relation[]>;
/**
 * 更新关系权重和置信度
 * @param relationId 关系ID
 * @param weight 新权重
 * @param confidence 新置信度
 * @returns 更新后的关系对象
 */
export declare function updateRelation(relationId: string, weight?: number, confidence?: number): Promise<Relation | null>;
/**
 * 删除关系
 * @param relationId 关系ID
 * @returns 删除是否成功
 */
export declare function deleteRelation(relationId: string): Promise<boolean>;
