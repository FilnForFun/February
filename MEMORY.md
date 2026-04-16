# 🧠 MEMORY.md - 长期记忆

_最后更新：2026-04-16 11:30_

---

## 📌 核心状态

- **工作空间**: `C:\Users\filnf\.openclaw\workspace`
- **时区**: Asia/Shanghai (UTC+8)
- **渠道**: 飞书 ✅运行中 | 钉钉 ⏳待配置 | Webchat ✅
- **模型**: dashscope/qwen3.6-plus (04-15 408 超时已恢复，04-16 API 200 正常)
- **统一搜索引擎**: v2.0，唯一入口，禁用原生 memorySearch，默认双引擎 SQLite+BM25
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

### 交易所公告爬虫失败 (2026-04-13)
- 10+ 版本迭代全部失败：curl_cffi ❌, DrissionPage ❌ (Handshake 404), Playwright ❌ (超时), 上期所 XML API ❌ (已 404)
- 根因：四大交易所官网均为动态渲染 + 反爬，CSC 聚合页为 React SPA
- 教训：①不要用爬虫对付专业反爬的金融网站 ②迭代超过 3 版仍失败应立即换数据源 ③DrissionPage WebSocket 在高安全网站不可靠

### Qwen2.5-VL 4-bit 量化性能 (2026-04-13)
- ModelScope 国内源下载速度 12-18 MB/s，7.52GB 用时 5.8 分钟
- bitsandbytes 4-bit 量化：VRAM 6.58GB → 2.46GB (↓63%)，速度 0.3 → 5.0 tok/s (16x↑)
- 技能: `skills/qwen25vl/`, transformers 5.5.3 + bitsandbytes

### ChatTTS 本地 TTS 验证 (2026-04-13)
- 1.96x 实时因子, 1.21GB VRAM
- transformers 5.5.3 验证通过
- 技能: `skills/chattts/`

### 基础设施事故 (2026-04-14~15) → 04-16 已恢复
- Qdrant/Neo4j/DashScope 全部于 04-16 07:15 确认恢复正常
- Qdrant: Docker container up, v1.17.1, port 6333 OK
- Neo4j: Docker container up, healthy, port 7687 OK
- DashScope: qwen3.6-plus API 200, 响应正常
- **根因**: RAM 耗尽 (84%→Gateway 被杀)，04-15 23:34 重启后恢复
- ⚠️ **当前 RAM 84% (2.5GB free / 15.8GB)**，有重演风险
- **教训**: ①必须建立服务自动恢复机制 ②限制 Docker 内存上限 ③增加虚拟内存

### 架构审计结论 (2026-04-15)
- 世界树 7 层架构中 12+ 组件与 OpenClaw 原生功能重叠（重复造轮子）
- 重叠组件：darwin-evolution, self-evolve-loop, task-scheduler, agent-memory-mcp, search-decay, intent-classifier, intent-router, skill-dispatcher, context-compression, YAML 工作流引擎, 多 Agent 调度器, 容错重试管理器
- 用户决策：先配置原生功能，再清理冗余
- 已执行：移除 context-compress + memory-qdrant 插件，Gateway 重启
- **教训**: OpenClaw 4.11 原生功能（Heartbeat/Cron/Memory/Dreaming/Compaction/Subagent/TaskFlow）已覆盖大部分自定义架构需求

### VLM 模型可用性验证 (2026-04-15)
- Qwen2.5-VL GGUF 版本不存在（bartowski/Ollama/HuggingFace/ModelScope 全部 404）
- 豆包推荐的 "社区权威转制版" 不实
- llama3.2-vision:7b 7.8GB 下载速度 ~1.4 MB/s（预计 1.5 小时）
- 待验证候选：Qwen3-VL-2B-Instruct（Ollama 官方）、MiniCPM-V 2B、InternVL2-2B
- **教训**: 对于模型可用性，必须以实际验证为准，不可轻信第三方推荐

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
| TurboQuant Phase 1 基准 | ✅ 500 queries | 8-bit Recall@10=97.8%, 48x 提速, 混合引擎验证通过 |
| TurboQuant Phase 2 双引擎 | ✅ 完成 | 混合搜索引擎 Overlap 100%, 延迟 0ms vs 26ms |
| Hybrid Search P1 | ✅ 100% | 双引擎混合: Qdrant HNSW 召回 + TQ 精排 |
| TASK-2026-020 融合度优化 | ✅ 100% | 73% → 92%，6/6 子任务完成，FINAL-REPORT 已生成 |
| OpenClaw 原生 Cron | ✅ 已迁移 | 6 个任务替代 Windows Task Scheduler |
| TASK-2026-021 BABEL 主动代理 | ✅ 100% | 15/15 子任务，Phase 1+2 基准完成 |
| TASK-2026-022 多 Agent 优化 | ✅ 100% | 5/5 改进点写入 AGENTS.md，10 分钟完成 |
| TASK-2026-025 模型部署层 | ✅ P0+P3 完成 | Whisper STT + ChatTTS 已上线，P1/P2 网络阻塞 |
| Dreaming 自动记忆 | ✅ 已启用 | memory-core + Dreaming 02:00 每日 |

****已完成**: 001~003, 004~015 (全部 14 个完成), Phase 1+2, markitdown 集成，markitdown+蒸馏集成，YAML 工作流 (100%), 用户画像 (100%), BM25 去重，TASK-2026-025 P0+P1+P3
**已取消**: 002, 017 (Multica)
**
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
