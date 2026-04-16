import { createIndex, dropIndex, addToIndex, searchIndex, getIndexStatus } from '../src/engines/index';

describe('index manager', () => {
  test('createIndex returns true', async () => {
    const result = await createIndex({
      indexName: 'test_index',
      indexType: 'vector',
      dimension: 1536,
      fields: ['content']
    });
    expect(result).toBe(true);
  });

  test('dropIndex returns true', async () => {
    const result = await dropIndex('test_index');
    expect(result).toBe(true);
  });

  test('addToIndex returns true', async () => {
    const items = [{
      id: 'item_1',
      content: '测试内容',
      vector: Array(1536).fill(0.5),
      timestamp: Date.now()
    }];
    const result = await addToIndex('test_index', items);
    expect(result).toBe(true);
  });

  test('searchIndex returns empty array by default', async () => {
    const results = await searchIndex('test_index', '测试查询', { topK: 10 });
    expect(results).toEqual([]);
  });

  test('getIndexStatus returns null for non-existent index', async () => {
    const status = await getIndexStatus('non_existent_index');
    expect(status).toBeNull();
  });
});
