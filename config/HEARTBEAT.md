# HEARTBEAT 巡检系统配置
# 巡检周期：60分钟/次（openclaw.json 配置：agents.defaults.heartbeat.every = "60m"）
# 活跃时间：08:00-23:00
# 异常时自动推送飞书告警

## 巡检项配置
checks:
  # 1. Gateway 健康检查
  - name: Gateway服务状态
    type: http
    url: http://localhost:18789/health
    expect: 200
    alert: "❌ Gateway服务异常，请检查！"

  # 2. Agent存在性检查
  - name: 默认Agent配置
    type: config
    file: C:\Users\filnf\.openclaw\openclaw.json
    jq: .agents.list[].id == "default"
    expect: true
    alert: "❌ 默认Agent配置缺失！"

  # 3. 会话目录存在性检查
  - name: 会话存储目录
    type: path
    path: C:\Users\filnf\.openclaw\agents\default\sessions
    expect: exists
    alert: "❌ 会话存储目录缺失！"

  # 4. 磁盘空间检查
  - name: C盘剩余空间
    type: disk
    path: C:\
    threshold: 10GB
    alert: "⚠️ C盘剩余空间不足10GB！"

  - name: D盘剩余空间
    type: disk
    path: D:\
    threshold: 20GB
    alert: "⚠️ D盘剩余空间不足20GB！"

  # 5. 知识蒸馏检查
  - name: 待蒸馏文档检查
    type: directory
    path: C:\Users\filnf\.openclaw\workspace\memory
    pattern: "*.md"
    max_age_hours: 24
    action: distill
    alert: "📝 发现待蒸馏文档"

## L7 自检层：每日三思（吾日三省吾身）
# 世界树第七层：巴别塔全方位自检机制
# 触发方式：HEARTBEAT 时间窗口匹配 + 模型主动分析
# 输出路径：memory/self-improvement/{today}-{morning,noon,night}.md

  # 6. 早思（08:30）- L1数据层 + L6应用层自检
  - name: 早思-执行质量
    type: reflection
    time_window: "08:00-09:00"
    check_file: "memory/self-improvement/{today}-morning.md"
    action: reflect_morning
    layers: [L1, L6]
    alert: "🌅 早思触发：对话压缩质量 + 定时任务 + 系统健康"

  # 7. 午思（13:00）- L6应用层（任务管理）自检
  - name: 午思-任务进度
    type: reflection
    time_window: "12:30-13:30"
    check_file: "memory/self-improvement/{today}-noon.md"
    action: reflect_noon
    layers: [L6]
    alert: "☀️ 午思触发：活跃任务 + 定时异常 + 待办过期"

  # 8. 晚思（21:30）- L3~L5知识层自检
  - name: 晚思-知识提炼
    type: reflection
    time_window: "21:00-22:00"
    check_file: "memory/self-improvement/{today}-night.md"
    action: reflect_night
    layers: [L3, L4, L5]
    alert: "🌙 晚思触发：索引/向量化/图谱/术语/知识提炼"

## 定时任务迁移（原 Windows 定时任务 → HEARTBEAT）
# 3 个 Windows 任务已迁移至此，由 HEARTBEAT 时间窗口统一调度
# 原 Windows 任务已删除，减少外部依赖和通知噪音

  # 9. GitHub 每日研究（原 OpenClaw_GitHub_Research 09:00）
  - name: GitHub研究
    type: scheduled_task
    time_window: "08:30-10:00"
    script: "tasks/daily_github_research.py"
    description: "抓取 GitHub trending 项目，生成研究报告保存到 tasks/reports/"
    exec: "python tasks/daily_github_research.py"
    alert: "🚀 GitHub 研究报告已生成"

  # 10. 交易所公告抓取（原 OpenClaw_Exchange_Notices 09:10）
  - name: 交易所公告
    type: scheduled_task
    time_window: "08:30-10:00"
    script: "tasks/exchange-notices-scheduler.py"
    description: "抓取期货交易所公告，保存到 skills/exchange-notices/"
    exec: "python tasks/exchange-notices-scheduler.py"
    alert: "📋 交易所公告已抓取"

  # 11. 每日工作总结（原 OpenClaw_Daily_Summary 22:00）
  - name: 每日总结
    type: scheduled_task
    time_window: "21:30-23:00"
    script: "tasks/daily_summary.py"
    description: "检查当日 memory、任务状态、系统健康，生成每日总结"
    exec: "python tasks/daily_summary.py"
    alert: "📊 每日工作总结已生成"

## 每日三思执行规则

### 触发条件
当心跳检查命中时间窗口，且对应反思文件不存在时，执行三思流程。

---

### 早思（08:30）- 为人谋而不忠乎：执行质量自检

**检查层级**: L1 数据层 + L6 应用层

| # | 检查项 | 数据源 | 判断方式 | 关联技能 |
|---|--------|--------|----------|----------|
| 1 | 昨日对话压缩质量 | memory/昨日.md | 模型回顾当日对话，判断压缩是否遗漏关键信息 | context-compress |
| 2 | memory 记录完整性 | memory/YYYY-MM-DD.md | 检查当日是否有记录，记录是否完整 | 模型判断 |
| 3 | 定时任务执行状态 | scheduled_tasks.json | 检查 last_result != 0 的任务 | 定时任务系统 |
| 4 | 系统服务健康 | Gateway/Qdrant/Neo4j | 服务是否正常运行 | HEARTBEAT 基础巡检 |
| 5 | 日志异常 | logs/*.log | 检查最新日志中的错误 | 模型判断 |

**输出格式**:
```markdown
# 🌅 早思 - YYYY-MM-DD 08:30

## 为人谋而不忠乎（执行质量）
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 对话压缩 | ✅/⚠️/❌ | 具体问题 |
| memory记录 | ✅/⚠️/❌ | 是否完整 |
| 定时任务 | ✅/⚠️/❌ | 异常任务清单 |
| 系统服务 | ✅/⚠️/❌ | 异常服务 |

## 与朋友交而不信乎（未完成）
| 任务 | 状态 | overdue |
|------|------|---------|
| TASK-xxx | 描述 | 是/否 |

## 传不习乎（未提炼）
| 项目 | 缺少什么 |
|------|----------|
| TASK-xxx | 缺少 FINAL-REPORT |

## 今日计划
1. ...
2. ...
```

---

### 午思（13:00）- 与朋友交而不信乎：任务进度自检

**检查层级**: L6 应用层（任务管理）

| # | 检查项 | 数据源 | 判断方式 | 关联技能 |
|---|--------|--------|----------|----------|
| 1 | 活跃任务进度 | task_registry.json | active 任务是否超时/停滞 | 任务注册表 |
| 2 | 定时任务异常 | scheduled_tasks.json | error 状态任务 | 定时任务系统 |
| 3 | 待办事项过期 | todo_tomorrow.md | 最后更新时间 > 24h | 待办系统 |
| 4 | 任务积压比例 | completed vs active | active/completed 比例异常 | 任务统计 |
| 5 | 达尔文进化候选 | task_registry.json | 连续30天零使用的任务/技能 | darwin-evolution |

**输出格式**:
```markdown
# ☀️ 午思 - YYYY-MM-DD 13:00

## 活跃任务进度
| 任务 | 进度 | 状态 | 建议 |
|------|------|------|------|
| TASK-xxx | xx% | 正常/停滞/overdue | 具体建议 |

## 定时任务异常
| 任务 | 最后结果 | 建议 |
|------|----------|------|
| SCHED-xxx | 错误码 | 修复建议 |

## 达尔文进化候选
| 内容 | 类型 | 最后使用 | 建议动作 |
|------|------|----------|----------|
| xxx | 任务/技能 | 日期 | 降级/淘汰/保留 |

## 下午调整建议
1. ...
```

---

### 晚思（21:30）- 传不习乎：知识提炼自检

**检查层级**: L3 索引层 + L4 图谱层 + L5 搜索层

| # | 检查项 | 数据源 | 判断方式 | 关联技能 |
|---|--------|--------|----------|----------|
| 1 | 新增文档未索引 | .index/global_index.json | 对比最后更新时间与文件修改时间 | GNO 索引 |
| 2 | 文档未向量化 | scripts/check_vectorization.py | 向量化覆盖率是否下降 | Qdrant 向量化 |
| 3 | 知识未提取 | knowledge-extractor 触发记录 | 新文档是否触发了知识提取 | 知识提取 |
| 4 | 已完成项目未提炼 | tasks/completed/ | 缺少 FINAL-REPORT 或经验总结 | 知识蒸馏 |
| 5 | 术语库未更新 | .index/terminology_db.json | 最后更新时间是否过期 | 术语同步 |
| 6 | 图谱未同步 | Neo4j 节点数 vs 文档数 | 节点/文档比例异常 | obsidian_sync |
| 7 | 压缩质量趋势 | 近期 compression rate | 压缩率是否下降 | context-compress |

**输出格式**:
```markdown
# 🌙 晚思 - YYYY-MM-DD 21:30

## 为人谋而不忠乎（全天执行质量）
| 检查项 | 状态 | 说明 |
|--------|------|------|
| 全天对话压缩 | ✅/⚠️/❌ | 具体问题 |
| 定时任务 | ✅/⚠️/❌ | 全天执行情况 |
| 系统稳定性 | ✅/⚠️/❌ | 有无异常 |

## 与朋友交而不信乎（未完成）
| 活跃任务 | 进度 | overdue | 风险 |
|----------|------|---------|------|
| TASK-xxx | xx% | 是/否 | 高/中/低 |

## 传不习乎（知识提炼缺口）
| 层级 | 检查项 | 状态 | 待处理 |
|------|--------|------|--------|
| L3 | 索引更新 | ✅/⚠️/❌ | 待索引文件数 |
| L3 | 向量化 | ✅/⚠️/❌ | 当前覆盖率 |
| L4 | 知识提取 | ✅/⚠️/❌ | 未提取文档数 |
| L4 | 图谱同步 | ✅/⚠️/❌ | Neo4j节点数 |
| L5 | 术语库 | ✅/⚠️/❌ | 最后更新时间 |
| L5 | 项目提炼 | ✅/⚠️/❌ | 缺少报告的项目 |

## 达尔文进化联动
| 触发项 | 动作 | 依据 |
|--------|------|------|
| 连续30天未使用 | 标记降级 | 用进废退 |
| 评分低于30分 | 标记淘汰 | 自然选择 |

## 明日待办
1. ...
```

---

## 三思与达尔文进化引擎联动

```
早思发现: 执行质量异常（对话压缩遗漏/任务失败）
    ↓
达尔文处理: 评分下降 → 降级/优化
    ↓
午思确认: 任务进度停滞
    ↓
达尔文处理: 用进废退 → 淘汰低频内容
    ↓
晚思提炼: 知识缺口检测
    ↓
达尔文处理: 术语/索引/向量化自动更新
    ↓
输出: 自检报告 → memory/self-improvement/
```

**联动规则**:
1. 三思发现问题 → 标记到达尔文待处理队列
2. 达尔文执行处理 → 更新处理结果
3. 晚思确认处理效果 → 沉淀到知识层

---

## 告警配置
alert:
  channel: feishu
  receiver: user:ou_32a5336c9330cc3037de4669a83e9a17
  title: "🚨 OpenClaw系统告警"
