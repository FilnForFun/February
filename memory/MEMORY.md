# 🧠 MEMORY.md - 长期记忆

_最后更新：2026-04-12 21:56_

---

## 📌 核心状态

- **工作空间**: `C:\Users\filnf\.openclaw\workspace`
- **时区**: Asia/Shanghai (UTC+8)
- **渠道**: 飞书 ✅运行中 | 钉钉 ⏳待配置 | Webchat ✅
- **模型**: dashscope/qwen3.5-plus (小米/豆包额度耗尽后的备用选择)
- **定时任务**: 7 个（6 个 Windows + 1 个 HEARTBEAT 每日三思）
- **飞书 App**: cli_a94dcda9a5611ccc

---

## 🛡️ 安全规则（必须遵守）

1. **C 盘系统区** (C:\Windows\, C:\Program Files\, 注册表, ini) → 禁止操作
2. **C 盘用户区** (Desktop\, Documents\, Downloads) → 需用户明确授权
3. **外部操作** (邮件/推文/公开发布) → 必须先确认
4. **修改 openclaw.json 前** → 必须备份（配置覆写是全量覆盖，非增量合并）
5. **插件安装** → 不在活跃会话中进行，必须编译成 .js

---

## 🔥 关键教训（按重要度排序）

### 插件事故 (2026-04-04) [→ 详见 memory/2026-04-04.md]
- Gateway 配置覆写 = 全量覆盖，插件安装会丢失已有配置
- TypeScript 插件必须先编译，Gateway 不内置 TS 编译器
- npm install 对无依赖的插件也会执行，可能因网络失败
- **操作前必须备份配置**

### 多渠道共享教训 (2026-03-16) [→ 详见 memory/]
- 不同渠道的 AI 实例不共享上下文
- 统一记忆文件（SYSTEM-CONTEXT.md, SAFETY-RULES.md 等）解决此问题
- 任何渠道修改配置前必须读架构文档

### 上下文膨胀根因 (2026-04-04) [→ 详见 memory/2026-04-04.md]
- AGENTS.md/TOOLS.md 过大导致 token 消耗剧增
- 已修复：文件精简 + bootstrapMaxChars 配置 + heartbeat 隔离
- **核心公式**: 上下文弹性管理 + 记忆主动提炼 = 双引擎并行

### Qdrant HNSW 索引未构建 (2026-04-12)
- `indexing_threshold: 0` 意味着永远不构建索引（非默认值），419 向量全部 O(n) 暴力扫描
- 修复：indexing_threshold → 100, HNSW m=32/ef=256, 创建 payload 索引 (source, directory, embedding_model)
- 结果：搜索 480ms → 8ms（60x 提速），indexed 0 → 100%

### BM25 累积计数 bug (2026-04-11)
- `index_document` 对已存在文档也递增 `num_docs`，导致 469 → 1,851 虚高
- 已修复：doc_id 检测 + save() 时重新计算 + 删除文档清理

### TurboQuant 安装陷阱 (2026-04-12)
- `pip install turboquant` 默认安装 KV Cache 版 (v0.2.0)，import 报错 `DynamicLayer` 不存在
- 必须从 GitHub 安装: `pip install git+https://github.com/Firmamento-Technologies/TurboQuant.git`
- 向量搜索版 (Firmamento) 与 KV Cache 版 (PyPI) 是两个不同的包

### TurboQuant 真实性能数据 (2026-04-12)
- 419 个 bge-m3 向量 (768d), 真实 Qdrant 数据
- 6-bit: Recall@10=93-94%, 压缩比 5.3x, 搜索 0.4-0.9ms vs Qdrant 2.7-3.9ms
- 技能: `skills/turboquant-compressor/`, 索引: `skills/data/turboquant/openclaw_memory_6bit.tq`

---

## 📊 进行中项目

| 项目 | 状态 | 下一步 |
|------|------|--------|
| TASK-2026-003 架构改造 | ✅ 100% 已关闭 | - |
| Phase 1+2 自主进化引擎 | ✅ 已完成 | 运行验证 |
| TASK-2026-017 Multica 集成 | ❌ 已取消 | 用户认为无用，已删除 |
| TASK-2026-018 YAML 工作流 | ✅ 100% | 已关闭 |
| TASK-2026-019 用户画像 | ✅ 100% | 已关闭 |
| TurboQuant-Compressor P0 | ✅ 100% | 创建技能 + 桥接验证完成 |
| Hybrid Search P1 | ✅ 100% | 双引擎混合: Qdrant HNSW 召回 + TQ 精排 |
| TASK-2026-020 融合度优化 | ✅ 100% | 73% → 92%，6/6 子任务完成，FINAL-REPORT 已生成 |
| OpenClaw 原生 Cron | ✅ 已迁移 | 6 个任务替代 Windows Task Scheduler |
| Dreaming 自动记忆 | ✅ 已启用 | memory-core + Dreaming 02:00 每日 |

**已完成**: 001~003, 004~015 (全部 14 个完成), Phase 1+2, markitdown 集成, markitdown+蒸馏集成, YAML 工作流(100%), 用户画像(100%), BM25 去重
**已取消**: 002, 017 (Multica)

---

## 🏷️ 交叉引用标签

- `#架构` → TASK-2026-003, memory/2026-04-04.md, project-task-definition.md, world-tree.md（七层架构）
- `#反思` → 每日三思, HEARTBEAT.md, memory/self-improvement/, L7 自检层
- `#安全` → SAFETY-RULES.md, 插件事故教训
- `#上下文` → bootstrapMaxChars=15000, heartbeat.lightContext=true
- `#记忆` → memory/*.md, 本文件
- `#飞书` → openclaw.json channels.feishu, cli_a94dcda9a5611ccc

---

_记忆分层：原始 → daily/*.md | 提炼 → 本文件 | 核心 → AGENTS.md / SOUL.md_
