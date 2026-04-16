import { BaseAdaptor, AdaptorConfig } from './base';
import { OpenClawAdaptor } from './openclaw';
import { FeishuAdaptor } from './feishu';

export class AdaptorFactory {
  private static adaptorMap: Record<string, new (config: AdaptorConfig) => BaseAdaptor> = {
    'openclaw': OpenClawAdaptor,
    'feishu': FeishuAdaptor
  };

  /**
   * 创建适配层实例
   */
  static createAdaptor(type: string, config: AdaptorConfig): BaseAdaptor {
    const AdaptorClass = this.adaptorMap[type];
    if (!AdaptorClass) {
      throw new Error(`不支持的适配层类型: ${type}`);
    }
    return new AdaptorClass(config);
  }

  /**
   * 注册新的适配层类型
   */
  static registerAdaptor(type: string, adaptorClass: new (config: AdaptorConfig) => BaseAdaptor): void {
    this.adaptorMap[type] = adaptorClass;
    console.log(`适配层类型 ${type} 已注册`);
  }

  /**
   * 获取支持的适配层类型列表
   */
  static getSupportedTypes(): string[] {
    return Object.keys(this.adaptorMap);
  }
}

export default AdaptorFactory;
