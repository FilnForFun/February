# February

> OpenClaw + 世界树架构 核心配置备份

## 📂 目录结构

```
February/
├── config/
│   ├── openclaw.json        # OpenClaw 主配置（已脱敏）
│   └── HEARTBEAT.md         # 巡检系统配置
├── memory/
│   ├── MEMORY.md            # 长期记忆
│   ├── AGENTS.md            # Agent 操作指令
│   ├── SOUL.md              # Agent 人格定义
│   ├── USER.md              # 用户画像
│   └── TOOLS.md             # 环境配置
└── worldtree/
    ├── README.md            # 世界树架构说明
    └── src/                 # 架构规范源码
```

## 🔧 融合度

| 维度 | 融合度 | 说明 |
|------|--------|------|
| 自动化 | 90% | OpenClaw 原生 Cron 替代 Windows 任务 |
| 记忆系统 | 90% | Dreaming + Qdrant + BM25 |
| 模型管理 | 95% | Model Failover 双备用 |
| 综合 | **92%** | [详见报告](https://github.com/FilnForFun/February/blob/main/config/openclaw.json) |

## 📊 系统架构

- **运行时**: OpenClaw Gateway (dashscope/qwen3.6-plus)
- **备用模型**: kimi-k2.5, glm-5 (阿里云百炼)
- **记忆引擎**: Qdrant HNSW + BM25 + Dreaming
- **向量模型**: nomic-embed-text (Ollama 本地)
- **渠道**: 飞书 (cli_a94dcda9a5611ccc)
- **定时任务**: 6 个 Cron（早思/GitHub/交易所/午思/晚思/日总结）

## 🔄 更新策略

本仓库通过 OpenClaw Cron 定期推送更新：
- OpenClaw 版本升级时
- 世界树架构升级时
- 核心配置变更时

---

_最后更新: 2026-04-16_
_Agent: Molili (OpenClaw)_
