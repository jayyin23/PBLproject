# n8n AI聊天助手配置指南

## 概述
本指南详细说明如何在n8n中配置AI聊天助手，与你的诗词应用集成。

## 第一步：创建n8n工作流

### 1.1 登录n8n
1. 访问你的n8n实例（如：https://pblpro.app.n8n.cloud）
2. 登录到n8n控制台

### 1.2 创建工作流
1. 点击"新建工作流"
2. 命名为"诗词AI聊天助手"

## 第二步：配置工作流节点

### 2.1 Webhook触发器节点
```
节点类型：Webhook
配置：
- HTTP Method: POST
- Path: /poetry-chat
- Response Mode: Response to Webhook
- Authentication: None
```

### 2.2 代码节点（预处理）
```
节点类型：Code
语言：JavaScript
代码：
```javascript
// 处理输入数据
const inputData = $input.first().json;

// 提取用户消息
const userMessage = inputData.chatInput || inputData.message || inputData.input || inputData.prompt || '';

// 构建AI请求
const aiRequest = {
  messages: [
    {
      role: "system",
      content: `你是一个专业的诗词AI助手，具备以下能力：
1. 诗词解析：分析诗词的意境、修辞手法、创作背景
2. 作者介绍：提供诗人的生平、创作风格、代表作品
3. 朝代知识：讲解不同朝代的诗词特点和文化背景
4. 创作指导：帮助用户创作诗词，提供修改建议
5. 文化解读：解释诗词中的典故、文化内涵

请用中文回答，语言亲切自然，富有文化底蕴。`
    },
    {
      role: "user",
      content: userMessage
    }
  ],
  max_tokens: 1000,
  temperature: 0.7
};

return [{ json: aiRequest }];
```

### 2.3 AI服务节点
```
节点类型：选择你的AI服务（如OpenAI、Claude等）

以OpenAI为例：
- Model: gpt-4
- API Key: 你的OpenAI API密钥
- Connect to: 代码节点的输出
```

### 2.4 代码节点（后处理）
```
节点类型：Code
语言：JavaScript
代码：
```javascript
// 处理AI响应
const aiResponse = $input.first().json;

// 提取回复内容
let reply = '';
if (aiResponse.choices && aiResponse.choices.length > 0) {
  reply = aiResponse.choices[0].message.content;
} else if (aiResponse.content) {
  reply = aiResponse.content;
} else {
  reply = '抱歉，我暂时无法回答这个问题。';
}

// 构建响应格式
const response = {
  reply: reply,
  timestamp: new Date().toISOString(),
  sessionId: $input.first().json.sessionId || 'default'
};

return [{ json: response }];
```

### 2.5 HTTP响应节点
```
节点类型：HTTP Response
配置：
- Response Code: 200
- Headers: 
  Content-Type: application/json
```

## 第三步：工作流完整结构

```
Webhook触发器 → 代码节点(预处理) → AI服务节点 → 代码节点(后处理) → HTTP响应
```

## 第四步：激活工作流

1. 点击工作流右上角的"激活"按钮
2. 复制Webhook URL（格式如：`https://pblpro.app.n8n.cloud/webhook/poetry-chat`）

## 第五步：前端配置

### 5.1 更新配置文件
修改 `src/config/chat.js`：

```javascript
export const chatConfig = {
  // 替换为你的n8n Webhook URL
  webhookUrl: 'https://pblpro.app.n8n.cloud/webhook/poetry-chat',
  
  apiConfig: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }
};
```

### 5.2 测试连接
使用以下测试数据验证连接：

```javascript
{
  "chatInput": "请解析李白的《静夜思》",
  "sessionId": "test_session_123"
}
```

## 第六步：高级配置（可选）

### 6.1 添加会话管理
在n8n中添加会话存储：

```javascript
// 在预处理代码节点中添加
const sessionId = inputData.sessionId || generateSessionId();
const sessionData = await getSessionData(sessionId);

// 构建带上下文的对话
const messages = [
  { role: "system", content: "..." },
  ...sessionData.messages,
  { role: "user", content: userMessage }
];
```

### 6.2 添加错误处理
```javascript
// 在后处理代码节点中添加错误处理
try {
  // 正常处理逻辑
} catch (error) {
  const errorResponse = {
    reply: '抱歉，服务暂时不可用，请稍后重试。',
    error: error.message,
    timestamp: new Date().toISOString()
  };
  return [{ json: errorResponse }];
}
```

### 6.3 添加速率限制
使用n8n的"Rate Limit"节点控制API调用频率。

## 第七步：部署和监控

### 7.1 部署检查
- [ ] Webhook URL可访问
- [ ] AI服务API密钥正确
- [ ] 前端配置正确
- [ ] 测试对话正常

### 7.2 监控指标
- 响应时间
- 错误率
- API使用量
- 用户满意度

## 故障排除

### 常见问题1：Webhook无法访问
**解决方案**：检查n8n实例的网络配置和防火墙设置。

### 常见问题2：AI服务无响应
**解决方案**：验证API密钥，检查额度是否充足。

### 常见问题3：响应格式错误
**解决方案**：检查代码节点的数据处理逻辑。

### 常见问题4：跨域问题
**解决方案**：在n8n的HTTP响应节点中添加CORS头：
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## 成本优化建议

1. **使用GPT-3.5-turbo**：如果预算有限，可使用更经济的模型
2. **缓存响应**：对常见问题设置缓存，减少API调用
3. **批量处理**：将多个用户请求合并处理
4. **使用免费额度**：充分利用各AI平台的免费额度

## 安全注意事项

1. **API密钥保护**：不要在代码中硬编码API密钥，使用环境变量
2. **输入验证**：对用户输入进行验证和清理
3. **速率限制**：防止API滥用
4. **敏感信息过滤**：避免AI返回敏感信息

## 扩展功能

### 多语言支持
添加语言检测，支持中英文对话。

### 语音交互
集成语音转文本和文本转语音功能。

### 知识库增强
将你的诗词数据库集成到AI提示词中，提供更准确的回答。

---

按照以上步骤配置，你的n8n AI聊天助手就可以正常工作了！