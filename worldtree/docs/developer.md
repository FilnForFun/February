# WorldTree 开发者文档
## 1. 项目结构
```
worldtree/
├── docs/          # 文档目录
├── src/           # 源代码
│   ├── core/      # 核心逻辑
│   ├── api/       # API实现
│   └── ui/        # 前端组件
├── tests/         # 测试用例
└── manifest.json  # 插件配置
```
## 2. 本地开发
1. 克隆仓库到`plugins/worldtree`目录
2. 执行`npm install`安装依赖
3. 执行`npm run dev`启动开发服务
4. OpenClaw中执行`/plugins reload`加载开发版本
## 3. 贡献指南
- 提交PR前需通过所有单元测试
- 代码遵循OpenClaw TypeScript编码规范
- 新功能需配套编写对应文档
## 4. 发布流程
1. 更新`manifest.json`版本号
2. 更新`CHANGELOG.md`发布说明
3. 执行`npm run build`打包生产版本
4. 提交到SkillHub仓库审核