import { BaseAdaptor, AdaptorConfig, AdaptorResponse } from './base';
import axios from 'axios';

export class OpenClawAdaptor extends BaseAdaptor {
  private client: axios.AxiosInstance;

  constructor(config: AdaptorConfig) {
    super(config, 'openclaw', '1.0.0');
    this.client = axios.create({
      baseURL: config.endpoint || 'http://localhost:7412',
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`
      }
    });
  }

  async init(): Promise<boolean> {
    try {
      await this.test();
      return true;
    } catch (err) {
      console.error('OpenClaw适配层初始化失败:', err);
      return false;
    }
  }

  async test(): Promise<AdaptorResponse> {
    try {
      const response = await this.client.get('/api/v1/status');
      return {
        success: true,
        data: response.data
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        code: err.response?.status || 500
      };
    }
  }

  /**
   * 调用OpenClaw工具
   */
  async callTool(toolName: string, parameters: Record<string, any>): Promise<AdaptorResponse> {
    try {
      const response = await this.client.post('/api/v1/tools/call', {
        tool: toolName,
        parameters
      });
      return {
        success: true,
        data: response.data
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        code: err.response?.status || 500
      };
    }
  }

  /**
   * 获取Agent列表
   */
  async listAgents(): Promise<AdaptorResponse> {
    try {
      const response = await this.client.get('/api/v1/agents');
      return {
        success: true,
        data: response.data
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        code: err.response?.status || 500
      };
    }
  }
}
