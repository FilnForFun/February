import type { Context } from '@openclaw/types';
import type { WorldTreeConfig } from '../config';
import { messageHook } from './message';
import { lifecycleHook } from './lifecycle';

export async function registerHooks(context: Context, config: WorldTreeConfig) {
  if (config.hooks.includes('message')) {
    context.hooks.register('message:received', messageHandler);
    context.hooks.register('message:sent', messageHandler);
  }
  
  if (config.hooks.includes('lifecycle')) {
    context.hooks.register('plugin:loaded', lifecycleHandler);
    context.hooks.register('plugin:unloaded', lifecycleHandler);
  }
  
  context.logger.info(`Registered ${config.hooks.length} WorldTree hooks`);
}

async function messageHandler(payload: any) {
  // Message hook logic
}

async function lifecycleHandler(payload: any) {
  // Lifecycle hook logic
}
