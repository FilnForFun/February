import { refineContent, batchRefine } from '../src/engines/refine';

describe('refine engine', () => {
  test('refineContent returns basic result', async () => {
    const content = '测试内容，这是一段用于提炼的示例文本';
    const result = await refineContent(content);
    expect(result.originalContent).toBe(content);
    expect(result.processedAt).toBeGreaterThan(0);
  });

  test('refineContent generates summary when enabled', async () => {
    const content = '测试内容，这是一段用于提炼的示例文本，长度超过200字的话会被截断'.repeat(10);
    const result = await refineContent(content, { generateSummary: true, maxSummaryLength: 100 });
    expect(result.summary).toBeDefined();
    expect(result.summary?.length).toBeLessThanOrEqual(100);
  });

  test('batchRefine processes multiple contents', async () => {
    const contents = ['测试1', '测试2', '测试3'];
    const results = await batchRefine(contents);
    expect(results.length).toBe(3);
    expect(results[0].originalContent).toBe('测试1');
    expect(results[1].originalContent).toBe('测试2');
    expect(results[2].originalContent).toBe('测试3');
  });
});
