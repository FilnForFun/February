import { BaseAdaptor, AdaptorConfig, AdaptorResponse } from './base';
import axios from 'axios';

export class FeishuAdaptor extends BaseAdaptor {
  private tenantAccessToken: string | null = null;
  private tokenExpireTime: number = 0;

  constructor(config: AdaptorConfig) {
    super(config, 'feishu', '1.0.0');
  }

  async init(): Promise<boolean> {
    try {
      await this.refreshTenantToken();
      return true;
    } catch (err) {
      console.error('飞书适配层初始化失败:', err);
      return false;
    }
  }

  async test(): Promise<AdaptorResponse> {
    try {
      if (!this.tenantAccessToken || Date.now() > this.tokenExpireTime) {
        await this.refreshTenantToken();
      }

      const response = await axios.get('https://open.feishu.cn/open-apis/contact/v3/users/me', {
        headers: {
          'Authorization': `Bearer ${this.tenantAccessToken}`
        }
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
   * 刷新租户访问令牌
   */
  private async refreshTenantToken(): Promise<void> {
    const response = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      app_id: this.config.options?.appId,
      app_secret: this.config.options?.appSecret
    });

    this.tenantAccessToken = response.data.tenant_access_token;
    this.tokenExpireTime = Date.now() + (response.data.expire * 1000) - 60000; // 提前1分钟过期
  }

  /**
   * 发送消息
   */
  async sendMessage(receiveId: string, content: string, msgType: string = 'text'): Promise<AdaptorResponse> {
    try {
      if (!this.tenantAccessToken || Date.now() > this.tokenExpireTime) {
        await this.refreshTenantToken();
      }

      const response = await axios.post('https://open.feishu.cn/open-apis/im/v1/messages', {
        receive_id: receiveId,
        content: JSON.stringify({ text: content }),
        msg_type: msgType
      }, {
        headers: {
          'Authorization': `Bearer ${this.tenantAccessToken}`
        },
        params: {
          receive_id_type: 'open_id'
        }
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
}
