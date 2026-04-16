# TOOLS.md - Environment-Specific Notes

Skills define _how_ tools work. This file is for your specifics — what's unique to this setup.

## Platform Formatting

- **Discord/WhatsApp:** No markdown tables! Use bullet lists instead
- **Discord links:** Wrap multiple links in `<>` to suppress embeds
- **WhatsApp:** No headers — use **bold** or CAPS for emphasis

## Skill Management

- **优先使用 skillhub CLI** (国内镜像，速度快)
- 搜索：`skillhub search "关键词"`
- 安装：`skillhub install openclaw/skills/技能名`
- 备用：clawhub CLI

## 系统操作安全决策树

### 操作前检查（必须执行）

1. **识别操作类型**: 文件操作、系统修改等
2. **风险评估**: 是否涉及 C 盘？是否修改 ini 文档？
3. **安全原则确认**: 确保不违反核心原则

### C 盘操作规则

```
涉及 C 盘？
├── 系统区域 (C:\Windows\, C:\Program Files\, 注册表, ini) → 禁止
├── 用户文档区 (Desktop\, Documents\, Downloads)
│   ├── 用户明确授权 → 允许执行
│   └── 无明确授权 → 暂停，请求授权
└── 其他 C 盘 → 暂停，评估风险
```

### 替代方案优先

1. **移动而非删除** — recoverable beats gone
2. **备份而非覆盖** — 创建备份再修改
3. **用户空间优先** — D 盘 > C 盘用户区 > C 盘系统区
4. **沙盒测试** — 先在安全环境测试

### 操作验证

操作前验证目标存在 → 操作中监控执行 → 操作后确认结果 → 错误正确处理

### 优先级规则

心跳检查优先于 C 盘操作请求。安全评估先行。紧急响应：心跳发现安全问题时暂停所有操作。

## GitHub 仓库配置

| 项目 | 值 |
|------|------|
| **仓库** | `FilnForFun/February` |
| **URL** | `https://github.com/FilnForFun/February.git` |
| **用户名** | `FilnForFun` |
| **Token** | 已配置到 `.git-credentials`（禁止明文提交） |
| **分支** | `main`（默认），`master`（旧分支） |
| **创建日期** | 2026-04-01 |
| **上次推送** | 2026-04-16 13:26 |

**安全规则**: Token 仅存本地 `.git-credentials`，绝不提交到仓库。
**配置命令**: `git config credential.helper store` → 输入 token 后自动保存

## 微信自动化触发模式

### 消息发送 (`wechat-auto`)
- "用微信给[用户名]发送[内容]"
- "用微信给[用户名]发[内容]"
- 主程序: `skills/wechat-auto/wechat_auto_message.py`

### 电话拨打 (`wechat-call-python`)
- "用微信给[用户名]打电话"
- "打电话给[用户名]"
- 主程序: `skills/wechat-call-python/wechat_call.py`

### 文件发送 (`wechat-send-file`)
- "把[文件位置]的文件用微信给[用户名]"
- "通过微信把[文件位置]的文件发给[用户名]"
- 主程序: `skills/wechat-send-file/wechat_send_file.py`

依赖共用: pyautogui, pillow, pyperclip
