# 数据结构定义

## 1. 世界树节点 (WorldTreeNode)
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nodeId | string | 是 | 全局唯一节点ID |
| nodeType | enum | 是 | 节点类型：root/layer/module/agent/resource |
| parentId | string | 否 | 父节点ID |
| name | string | 是 | 节点名称 |
| metadata | object | 否 | 自定义元数据 |
| createTime | number | 是 | 创建时间戳 |
| updateTime | number | 是 | 更新时间戳 |

## 2. Agent实例 (AgentInstance)
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| agentId | string | 是 | 全局唯一AgentID |
| role | string | 是 | Agent角色 |
| status | enum | 是 | 状态：idle/running/paused/error |
| capabilities | array<string> | 是 | 能力列表 |
| nodeId | string | 是 | 所属节点ID |

## 3. 知识条目 (KnowledgeEntry)
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| entryId | string | 是 | 知识ID |
| content | string | 是 | 知识内容 |
| vector | array<number> | 否 | 向量embedding |
| tags | array<string> | 否 | 标签列表 |
| owner | string | 是 | 所属Agent/节点ID |

## 4. 权限规则 (PermissionRule)
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ruleId | string | 是 | 规则ID |
| subject | string | 是 | 授权主体 |
| resource | string | 是 | 资源路径 |
| action | array<string> | 是 | 允许的操作 |
| effect | enum | 是 | 效果：allow/deny |
