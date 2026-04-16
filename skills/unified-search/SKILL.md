---
name: unified-search
description: 统一搜索引擎 — 本地知识唯一搜索入口。SQLite记忆 + BM25 + TurboQuant，RRF融合，三级去重，Token预算≤4000
version: 2.2.0
created_by: manual-design
created_from: 统一搜索引擎架构设计 (2026-04-16)
created_date: 2026-04-16
tags: [搜索引擎, RRF, 融合排序, 去重, 上下文控制, 唯一入口]
---

# Unified Search Engine — 统一搜索引擎

## ⚠️ 核心纪律

**这是本地知识搜索的唯一入口。** 禁止直接调用 memory_search、BM25 脚本或 Neo4j 查询。所有搜索必须经过此 Skill。

## 何时使用
- 用户问"上次/最近/之前"相关记忆
- 用户搜索文档、概念、关系
- 需要跨数据源综合检索

## 执行命令

```bash
python skills/unified-search/unified_search.py "搜索关键词" --top 10 --verbose
```

### 参数
| 参数 | 默认 | 说明 |
|------|------|------|
| `--top` | 10 | 返回结果数 |
| `--mode` | auto | 自动路由 |
| `--budget` | 4000 | Token 预算上限 |
| `--verbose` | false | 显示引擎调用详情 |

## 引擎说明（Agent 无需手动选择，内部自动路由）

| 引擎 | 触发场景 | 数据量 | 延迟 |
|------|----------|--------|------|
| SQLite FTS5 + Vector | 记忆/对话检索 | 720 chunks | ~130ms |
| BM25 | 关键词精确匹配 | 50K 条目 | ~100ms |
| TurboQuant 8-bit | 向量精排 | 419 向量 | ~3.8s (首次) / ~50ms (缓存) |

**已降级**: Neo4j（按需启动）

## 已知 Bug 及修复

| Bug | 根因 | 修复方案 | 修复日期 |
|-----|------|----------|----------|
| SQLite 向量搜索 0 结果 | embedding 存为 JSON 文本，代码用 `np.frombuffer()` 读二进制 | 改用 `json.loads()` 解析，兼容两种格式 | 2026-04-16 |
| BM25 中文匹配 0 结果 | 查询 regex 把整个中文串当一 token，索引用 jieba 分词 | 中文 token 展开为 2-gram 匹配词级索引 | 2026-04-16 |
| TurboQuant .tq 空文件 | 索引未保存，`.tq` 文件 0 bytes | 从 `.npy` 重建 8-bit 索引并保存 | 2026-04-16 |

## 输出保证
- **去重**: 三级去重（path → content_hash → 语义）
- **预算**: ≤4000 tokens（给 Agent 留 60% 窗口）
- **融合**: RRF (Reciprocal Rank Fusion, k=60)
- **时效加权**: 半衰期 30 天，近期文档得分加成
- **速度**: ≤600ms（双引擎），含 TurboQuant 约 3.8s

## 版本历史
| 版本 | 日期 | 变更 |
|------|------|------|
| 2.2.0 | 2026-04-16 | 修复 3 个 P0 bug（SQLite 向量/BM25 中文/TurboQuant 空文件），添加时效加权 |
| 2.1.0 | 2026-04-16 | 精简为双引擎（SQLite + BM25），Token 预算 4000 |
