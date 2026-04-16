import { describe, it, expect } from 'vitest';
import { AdaptorFactory, OpenClawAdaptor, FeishuAdaptor } from '../src/adaptors';

describe('AdaptorFactory', () => {
  it('should return supported adaptor types', () => {
    const types = AdaptorFactory.getSupportedTypes();
    expect(types).toContain('openclaw');
    expect(types).toContain('feishu');
  });

  it('should create OpenClaw adaptor instance', () => {
    const adaptor = AdaptorFactory.createAdaptor('openclaw', {
      type: 'openclaw',
      endpoint: 'http://localhost:7412',
      apiKey: 'test-key'
    });

    expect(adaptor).toBeInstanceOf(OpenClawAdaptor);
    expect(adaptor.getInfo().name).toBe('openclaw');
    expect(adaptor.getInfo().version).toBe('1.0.0');
  });

  it('should create Feishu adaptor instance', () => {
    const adaptor = AdaptorFactory.createAdaptor('feishu', {
      type: 'feishu',
      options: {
        appId: 'test-app-id',
        appSecret: 'test-app-secret'
      }
    });

    expect(adaptor).toBeInstanceOf(FeishuAdaptor);
    expect(adaptor.getInfo().name).toBe('feishu');
    expect(adaptor.getInfo().version).toBe('1.0.0');
  });

  it('should throw error for unsupported adaptor type', () => {
    expect(() => {
      AdaptorFactory.createAdaptor('unsupported', { type: 'unsupported' });
    }).toThrowError('不支持的适配层类型: unsupported');
  });

  it('should register new adaptor type', () => {
    class TestAdaptor extends OpenClawAdaptor {
      constructor(config: any) {
        super(config);
      }
    }

    AdaptorFactory.registerAdaptor('test', TestAdaptor);
    expect(AdaptorFactory.getSupportedTypes()).toContain('test');

    const adaptor = AdaptorFactory.createAdaptor('test', { type: 'test' });
    expect(adaptor).toBeInstanceOf(TestAdaptor);
  });
});
