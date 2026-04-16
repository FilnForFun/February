import { createRelation, queryRelations, updateRelation, deleteRelation } from '../src/engines/relation';

describe('relation engine', () => {
  test('createRelation returns valid relation object', async () => {
    const from = { id: 'ent_1', type: 'person', value: '张三' };
    const to = { id: 'ent_2', type: 'company', value: '阿里巴巴' };
    const relation = await createRelation(from, to, 'works_at', 0.9, 0.95);
    expect(relation.id).toStartWith('rel_');
    expect(relation.fromEntityId).toBe('ent_1');
    expect(relation.toEntityId).toBe('ent_2');
    expect(relation.relationType).toBe('works_at');
    expect(relation.weight).toBe(0.9);
    expect(relation.confidence).toBe(0.95);
    expect(relation.createdAt).toBeGreaterThan(0);
  });

  test('queryRelations returns empty array by default', async () => {
    const relations = await queryRelations('ent_1');
    expect(relations).toEqual([]);
  });

  test('deleteRelation returns true', async () => {
    const result = await deleteRelation('rel_test');
    expect(result).toBe(true);
  });
});
