export interface AdaptorConfig {
  type: string;
  endpoint?: string;
  apiKey?: string;
  timeout?: number;
  options?: Record<string, any>;
}

export interface AdaptorResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

export abstract class BaseAdaptor {
  protected config: AdaptorConfig;
  protected name: string;
  protected version: string;

  constructor(config: AdaptorConfig, name: string, version: string) {
    this.config = {
      timeout: 10000,
      ...config
    };
    this.name = name;
    this.version = version;
  }

  /**
   * 初始化适配层
   */
  abstract init(): Promise<boolean>;

  /**
   * 测试连接
   */
  abstract test(): Promise<AdaptorResponse>;

  /**
   * 获取适配层信息
   */
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      type: this.config.type
    };
  }

  /**
   * 销毁适配层
   */
  async destroy(): Promise<void> {
    // 默认空实现，子类可重写
  }
}
