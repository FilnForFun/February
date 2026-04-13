declare module '@openclaw/worldtree' {
  // 数据结构定义
  export enum NodeType {
    ROOT = 'root',
    LAYER = 'layer',
    MODULE = 'module',
    AGENT = 'agent',
    RESOURCE = 'resource'
  }

  export enum AgentStatus {
    IDLE = 'idle',
    RUNNING = 'running',
    PAUSED = 'paused',
    ERROR = 'error'
  }

  export enum PermissionEffect {
    ALLOW = 'allow',
    DENY = 'deny'
  }

  export interface WorldTreeNode {
    nodeId: string;
    nodeType: NodeType;
    parentId?: string;
    name: string;
    metadata?: Record<string, any>;
    createTime: number;
    updateTime: number;
  }

  export interface AgentInstance {
    agentId: string;
    role: string;
    status: AgentStatus;
    capabilities: string[];
    nodeId: string;
  }

  export interface KnowledgeEntry {
    entryId: string;
    content: string;
    vector?: number[];
    tags?: string[];
    owner: string;
  }

  export interface PermissionRule {
    ruleId: string;
    subject: string;
    resource: string;
    action: string[];
    effect: PermissionEffect;
  }

  // API响应
  export interface ApiResponse<T = any> {
    code: number;
    msg: string;
    data: T;
  }

  // 扩展点定义
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

  // 世界树客户端
  export class WorldTreeClient {
    constructor(config: {
      endpoint: string;
      apiKey: string;
      timeout?: number;
    });

    // 节点管理接口
    createNode(node: Omit<WorldTreeNode, 'nodeId' | 'createTime' | 'updateTime'>): Promise<ApiResponse<WorldTreeNode>>;
    getNode(nodeId: string): Promise<ApiResponse<WorldTreeNode>>;
    updateNode(nodeId: string, update: Partial<Omit<WorldTreeNode, 'nodeId' | 'createTime' | 'updateTime'>>): Promise<ApiResponse<WorldTreeNode>>;
    deleteNode(nodeId: string): Promise<ApiResponse<void>>;
    listNodes(parentId?: string): Promise<ApiResponse<WorldTreeNode[]>>;

    // Agent管理接口
    spawnAgent(nodeId: string, role: string, capabilities: string[]): Promise<ApiResponse<AgentInstance>>;
    getAgent(agentId: string): Promise<ApiResponse<AgentInstance>>;
    terminateAgent(agentId: string): Promise<ApiResponse<void>>;
    listAgents(nodeId?: string): Promise<ApiResponse<AgentInstance[]>>;

    // 知识图谱接口
    insertKnowledge(entry: Omit<KnowledgeEntry, 'entryId'>): Promise<ApiResponse<KnowledgeEntry>>;
    queryKnowledge(query: string, filters?: Record<string, any>): Promise<ApiResponse<KnowledgeEntry[]>>;
    deleteKnowledge(entryId: string): Promise<ApiResponse<void>>;

    // 权限管理接口
    createPermissionRule(rule: Omit<PermissionRule, 'ruleId'>): Promise<ApiResponse<PermissionRule>>;
    checkPermission(subject: string, resource: string, action: string): Promise<ApiResponse<boolean>>;
    listPermissionRules(subject?: string): Promise<ApiResponse<PermissionRule[]>>;

    // 扩展管理接口
    registerExtension(extension: Extension): Promise<ApiResponse<void>>;
    unregisterExtension(extensionId: string): Promise<ApiResponse<void>>;
    listExtensions(): Promise<ApiResponse<Extension[]>>;
    triggerExtensionPoint<T = any, R = any>(point: ExtensionPoint, data: T): Promise<ApiResponse<R[]>>;
  }

  export default WorldTreeClient;
}
