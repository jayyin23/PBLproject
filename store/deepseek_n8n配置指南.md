# DeepSeek AI + n8n 聊天助手配置指南

## 简单版配置步骤（使用DeepSeek AI）

### 第一步：获取DeepSeek API密钥
1. 访问 https://platform.deepseek.com
2. 注册/登录账号
3. 在控制台获取API密钥
4. 记下你的API密钥（类似：sk-xxxxxxxxxxxx）

### 第二步：在n8n中配置工作流

#### 方法一：使用HTTP请求节点调用DeepSeek

**工作流结构：**
```
Webhook → 代码节点 → HTTP请求 → 代码节点 → HTTP响应
```

**HTTP请求节点配置：**
- URL: `https://api.deepseek.com/v1/chat/completions`
- Method: POST
- Headers:
  - `Authorization: Bearer 你的DeepSeek-API密钥`
  - `Content-Type: application/json`
- Body:
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "你是一个专业的诗词AI助手，帮助用户了解诗词、作者、创作背景等信息。请用中文回答。"
    },
    {
      "role": "user",
      "content": "{{用户输入}}"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.7
}
```

#### 方法二：使用自定义AI节点（如果n8n支持DeepSeek）

如果n8n有DeepSeek的官方节点，直接选择DeepSeek节点并配置API密钥。

### 第三步：代码节点配置

**预处理代码（第一个代码节点）：**
```javascript
const inputData = $input.first().json;
const userMessage = inputData.chatInput || inputData.message || '';

// 构建DeepSeek请求
const deepseekRequest = {
  model: "deepseek-chat",
  messages: [
    {
      role: "system",
      content: "你是一个专业的诗词AI助手，具备以下能力：\\n1. 诗词解析：分析诗词的意境、修辞手法、创作背景\\n2. 作者介绍：提供诗人的生平、创作风格、代表作品\\n3. 朝代知识：讲解不同朝代的诗词特点和文化背景\\n4. 创作指导：帮助用户创作诗词，提供修改建议\\n5. 文化解读：解释诗词中的典故、文化内涵\\n\\n请用中文回答，语言亲切自然，富有文化底蕴。"
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

**后处理代码（第二个代码节点）：**
```javascript
const aiResponse = $input.first().json;

// 提取DeepSeek的回复
let reply = '';
if (aiResponse.choices && aiResponse.choices.length > 0) {
  reply = aiResponse.choices[0].message.content;
} else {
  reply = '抱歉，我暂时无法回答这个问题。';
}

const response = {
  reply: reply,
  timestamp: new Date().toISOString()
};

return [{ json: response }];
```

### 第四步：激活工作流并获取Webhook URL

1. 在n8n中激活工作流
2. 复制Webhook URL（格式：`https://你的n8n地址/webhook/poetry-chat`）

### 第五步：修改前端配置

修改 `src/config/chat.js`：
```javascript
export const chatConfig = {
  webhookUrl: '你复制的n8n Webhook URL',
  // 其他配置保持不变
};
```

## DeepSeek API的优势

1. **免费额度**：新用户有免费使用额度
2. **中文优化**：对中文支持很好
3. **响应速度快**：国内访问延迟低
4. **无需翻墙**：直接访问

## 测试数据

发送以下JSON测试工作流：
```json
{
  "chatInput": "请解析李白的《静夜思》",
  "sessionId": "test_123"
}
```

预期响应：
```json
{
  "reply": "《静夜思》是唐代诗人李白的代表作之一...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 故障排除

### 常见问题1：API密钥错误
**症状**：HTTP请求返回401错误
**解决**：检查API密钥是否正确，确保有足够的额度

### 常见问题2：响应格式错误
**症状**：前端无法解析回复
**解决**：检查后处理代码是否正确提取了DeepSeek的回复

### 常见问题3：网络连接问题
**症状**：请求超时
**解决**：检查网络连接，确保能访问DeepSeek API

## 成本控制

1. **监控使用量**：在DeepSeek平台查看API使用情况
2. **设置限制**：在代码中设置max_tokens限制
3. **缓存常见问题**：对常见问题设置缓存减少API调用

按照这个配置，你就可以用DeepSeek AI来搭建诗词聊天助手了！