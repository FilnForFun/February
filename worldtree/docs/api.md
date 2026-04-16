# WorldTree API 文档
## 基础信息
- 基础路径：`/api/v1/worldtree`
- 认证方式：携带OpenClaw session token在请求头`Authorization: Bearer {token}`
## 接口列表
### GET /architecture
获取当前项目架构树
> 响应示例：
> ```json
> {"code":0,"data":{"layers":[],"nodes":[],"edges":[]},"msg":"success"}
> ```
### POST /node
创建架构节点
> 请求参数：`name`(节点名), `layer`(所属层级), `metadata`(元数据)
### PUT /node/{id}
更新节点信息
### DELETE /node/{id}
删除指定节点
### POST /visualize
生成架构图，返回图片URL
## 错误码
| 错误码 | 说明 |
|--------|------|
| 40001 | 参数错误 |
| 40101 | 认证失败 |
| 50001 | 服务内部错误 |