# n8n工作流完善指南

## 当前问题分析
- n8n返回404错误：webhook路径 `/webhook/poetry-chat` 不存在
- 需要重新配置n8n工作流或使用正确的webhook URL

## 解决方案

### 方案1：使用现有的n8n云服务（推荐）
如果 `pblpro.app.n8n.cloud` 是你的n8n实例：

1. **登录n8n控制台**：访问 https://pblpro.app.n8n.cloud
2. **创建工作流**：
   - 点击"New Workflow"
   - 添加"Webhook"节点
   - 设置路径：`poetry-chat`
   - 方法：POST
   - 保存并激活工作流

3. **配置AI集成**：
   - 添加"HTTP Request"节点调用DeepSeek API
   - 或使用"OpenAI"节点（如果支持）

### 方案2：本地部署n8n（备用）
如果无法访问云服务：

1. **安装n8n**：
```bash
npm install -g n8n
n8n start
```

2. **导入工作流配置**：
使用项目中的 `deepseek_n8n_workflow_fixed.json` 文件

### 方案3：使用模拟AI（当前方案）
当前代理服务已配置模拟AI响应，可以正常使用。

## 详细配置步骤

### Webhook节点配置
```
节点类型：Webhook
路径：poetry-chat
方法：POST
响应模式：Last Node
```

### DeepSeek API集成
```javascript
// 代码节点配置
const inputData = $input.first().json;
const userMessage = inputData.chatInput || inputData.message || '';

const deepseekRequest = {
  model: "deepseek-chat",
  messages: [
    {
      role: "system",
      content: "你是一个专业的诗词AI助手，帮助用户了解诗词、作者、创作背景等信息。请用中文回答，语言亲切自然。"
    },
    {
      role: "user",
      content: userMessage
    }
  ],
  max_tokens: 1000,
  temperature: 0.7
};

return [{ json: deepseekRequest }];
```

### HTTP请求节点配置
```
URL: https://api.deepseek.com/v1/chat/completions
方法: POST
Headers:
  Authorization: Bearer YOUR_DEEPSEEK_API_KEY
  Content-Type: application/json
```

## API密钥获取

### DeepSeek API密钥
1. 访问 https://platform.deepseek.com/
2. 注册账号并获取API密钥
3. 在工作流中配置密钥

### OpenAI API密钥（备选）
1. 访问 https://platform.openai.com/
2. 获取API密钥
3. 使用OpenAI节点

## 测试工作流

### 1. 激活工作流
- 在n8n中激活工作流
- 获取webhook URL：`https://pblpro.app.n8n.cloud/webhook/poetry-chat`

### 2. 测试请求
```bash
curl -X POST https://pblpro.app.n8n.cloud/webhook/poetry-chat \
  -H "Content-Type: application/json" \
  -d '{"chatInput": "你好"}'
```

### 3. 验证响应
期望响应格式：
```json
{
  "reply": "你好！我是诗词AI助手...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 故障排除

### 常见问题
1. **404错误**：webhook路径不存在或工作流未激活
2. **401错误**：API密钥无效
3. **500错误**：工作流配置错误

### 调试步骤
1. 检查n8n工作流日志
2. 验证API密钥有效性
3. 测试webhook URL直接访问

## 当前状态
代理服务已配置完善的错误处理和模拟AI响应，即使n8n不可用也能提供基本功能。

建议优先完善n8n工作流配置以获得完整的AI功能。