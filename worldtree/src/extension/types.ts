export enum ExtensionPoint {
  NODE_CREATE = 'node:create',
  NODE_DELETE = 'node:delete',
  NODE_UPDATE = 'node:update',
  AGENT_SPAWN = 'agent:spawn',
  AGENT_TERMINATE = 'agent:terminate',
  KNOWLEDGE_INSERT = 'knowledge:insert',
  KNOWLEDGE_QUERY = 'knowledge:query',
  PERM_CHECK = 'perm:check',
  RESOURCE_ALLOCATE = 'resource:allocate',
  RESOURCE_RELEASE = 'resource:release'
}

export interface ExtensionContext {
  requestId: string;
  timestamp: number;
  user: {
    userId: string;
    roles: string[];
  };
  metadata: Record<string, any>;
}

export interface Extension<T = any, R = any> {
  id: string;
  name: string;
  version: string;
  description?: string;
  points: ExtensionPoint[];
  enabled: boolean;
  priority: number;
  handler: (context: ExtensionContext, data: T) => Promise<R | void>;
}

export interface ExtensionRegistration {
  extension: Extension;
  registerTime: number;
  lastActiveTime: number;
}
