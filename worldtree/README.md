# 世界树架构规范（归档）

> 原 `worldtree-core-engines` 插件，2026-04-13 从插件系统移除，归档至知识库。

## 为什么归档

- 插件代码全部为 **stub/占位符实现**，无实际运行业务逻辑
- 所有功能已被 OpenClaw 原生能力替代（compaction, Dreaming, Cron, Failover, Background Tasks）
- 作为**架构设计文档**保留，供未来参考七层架构理念

## 包含内容

| 目录 | 内容 |
|------|------|
| `src/engines/` | 上下文裁剪、提炼、关联关系、任务引擎（接口定义） |
| `src/extension/` | 多 Agent 调度器、重试管理器 |
| `src/adaptors/` | 飞书/OpenClaw 适配层 |
| `docs/` | 用户指南 |

## 当前系统融合度

**92%** — 世界树七层架构已全面对齐 OpenClaw 原生能力。详见 `tasks/TASK-2026-020-integration/FINAL-REPORT.md`

---

_归档时间：2026-04-13_
