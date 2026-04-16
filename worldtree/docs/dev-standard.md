# 开发规范

## 1. 目录结构规范
```
worldtree/
├── src/                 # 源代码
│   ├── core/            # 核心逻辑
│   ├── modules/         # 业务模块
│   ├── services/        # 服务层
│   └── utils/           # 工具类
├── docs/                # 文档
├── tests/               # 测试用例
├── dist/                # 编译产物
└── openclaw.plugin.json # 插件清单
```

## 2. 代码规范
- TypeScript 严格模式
- 遵循 ESLint + Prettier 配置
- 函数、变量使用驼峰命名法
- 常量使用全大写下划线分隔
- 每个文件代码不超过500行

## 3. 提交规范
```
<type>(<scope>): <subject>
```
type可选值: feat(新功能)、fix(修复)、docs(文档)、style(格式)、refactor(重构)、test(测试)、chore(构建/工具)

## 4. 测试规范
- 单元测试覆盖率≥80%
- 核心模块必须有集成测试
- 接口必须有接口测试用例
- 提交代码前必须通过所有测试

## 5. 版本规范
- 遵循 SemVer 语义化版本: MAJOR.MINOR.PATCH
- 重大变更升级MAJOR，新功能升级MINOR，bug修复升级PATCH
