import type { Plugin } from '@openclaw/types';
import { loadConfig, type WorldTreeConfig } from './config';
import { registerHooks } from './hooks';
import { registerChannels } from './channels';
// 多Agent协同升级模块
import { ContextTrimEngine } from './engines/context-trim';
import { RetryManager } from './extension/retry-manager';
import { MultiAgentScheduler } from './extension/multi-agent-scheduler';

const WorldTreePlugin: Plugin = {
  name: 'worldtree',
  version: '0.1.0',
  description: 'WorldTree Architecture Adaptation Layer Plugin',
  author: 'OpenClaw Team',
  
  async install(context, userConfig) {
    const config = loadConfig(userConfig);
    
    if (!config.enabled) {
      context.logger.info('WorldTree plugin is disabled, skipping initialization');
      return;
    }
    
    context.logger.info('Initializing WorldTree plugin...');
    
    // 初始化多Agent协同升级模块
    const contextTrim = new ContextTrimEngine(config.contextTrim);
    const retryManager = new RetryManager(config.retry);
    const agentScheduler = new MultiAgentScheduler(config.scheduler, context, retryManager, contextTrim);
    
    // 绑定模块到上下文，供全局调用
    context.worldtree = {
      contextTrim,
      retryManager,
      agentScheduler
    };
    
    // Register event hooks
    await registerHooks(context, config);
    
    // Register multi-channel adapters
    await registerChannels(context, config);
    
    context.logger.info('✅ WorldTree plugin + 多Agent协同模块 初始化成功');
    context.logger.info('✅ 上下文裁剪、容错重试、多Agent调度能力已全部启用')
  },
  
  async uninstall(context) {
    context.logger.info('Uninstalling WorldTree plugin...');
    // Cleanup logic
    context.logger.info('WorldTree plugin uninstalled successfully');
  }
};

export default WorldTreePlugin;
