import { describe, it, expect, beforeEach } from 'vitest';
import { extensionManager, Extension, ExtensionPoint } from '../src/extension';

describe('ExtensionManager', () => {
  beforeEach(() => {
    // 清空所有扩展
    const extensions = extensionManager.listExtensions();
    extensions.forEach(reg => {
      extensionManager.unregister(reg.extension.id);
    });
  });

  it('should register extension successfully', () => {
    const testExtension: Extension = {
      id: 'test-extension',
      name: 'Test Extension',
      version: '1.0.0',
      points: [ExtensionPoint.NODE_CREATE],
      enabled: true,
      priority: 10,
      handler: async () => {}
    };

    const result = extensionManager.register(testExtension);
    expect(result).toBe(true);
    expect(extensionManager.listExtensions().length).toBe(1);
  });

  it('should unregister extension successfully', () => {
    const testExtension: Extension = {
      id: 'test-extension',
      name: 'Test Extension',
      version: '1.0.0',
      points: [ExtensionPoint.NODE_CREATE],
      enabled: true,
      priority: 10,
      handler: async () => {}
    };

    extensionManager.register(testExtension);
    const result = extensionManager.unregister('test-extension');
    expect(result).toBe(true);
    expect(extensionManager.listExtensions().length).toBe(0);
  });

  it('should trigger extension point and return results', async () => {
    const testExtension1: Extension = {
      id: 'test-extension-1',
      name: 'Test Extension 1',
      version: '1.0.0',
      points: [ExtensionPoint.NODE_CREATE],
      enabled: true,
      priority: 10,
      handler: async (_, data) => {
        return { result: `processed1-${data.name}` };
      }
    };

    const testExtension2: Extension = {
      id: 'test-extension-2',
      name: 'Test Extension 2',
      version: '1.0.0',
      points: [ExtensionPoint.NODE_CREATE],
      enabled: true,
      priority: 20,
      handler: async (_, data) => {
        return { result: `processed2-${data.name}` };
      }
    };

    extensionManager.register(testExtension1);
    extensionManager.register(testExtension2);

    const results = await extensionManager.trigger(
      ExtensionPoint.NODE_CREATE,
      {
        requestId: 'test-request',
        timestamp: Date.now(),
        user: { userId: 'test-user', roles: ['admin'] },
        metadata: {}
      },
      { name: 'test-node' }
    );

    expect(results.length).toBe(2);
    // 优先级高的先执行
    expect(results[0].result).toBe('processed2-test-node');
    expect(results[1].result).toBe('processed1-test-node');
  });

  it('should skip disabled extensions', async () => {
    const testExtension: Extension = {
      id: 'test-extension',
      name: 'Test Extension',
      version: '1.0.0',
      points: [ExtensionPoint.NODE_CREATE],
      enabled: false,
      priority: 10,
      handler: async () => {
        throw new Error('Should not be called');
      }
    };

    extensionManager.register(testExtension);
    const results = await extensionManager.trigger(
      ExtensionPoint.NODE_CREATE,
      {
        requestId: 'test-request',
        timestamp: Date.now(),
        user: { userId: 'test-user', roles: ['admin'] },
        metadata: {}
      },
      { name: 'test-node' }
    );

    expect(results.length).toBe(0);
  });
});
