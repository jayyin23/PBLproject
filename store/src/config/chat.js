// 诗词对话助手配置
export const chatConfig = {
  // n8n webhook URL - 使用本地代理服务
  webhookUrl: 'http://localhost:3001/api/n8n-proxy/poetry-chat',
  
  // API配置
  apiConfig: {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  },
  
  // 聊天配置
  chatConfig: {
    maxMessages: 50,
    autoScroll: true,
    showTimestamps: true
  }
}

// 获取配置的Webhook URL
export const getChatUrl = () => {
  return chatConfig.webhookUrl
}

// 更新Webhook URL
export const setChatUrl = (url) => {
  chatConfig.webhookUrl = url
}

// 构建请求数据
export const buildRequestData = (message) => {
  return {
    chatInput: message,
    message: message,  // 尝试message字段
    input: message,     // 尝试input字段
    prompt: message,    // 保留prompt字段
    timestamp: new Date().toISOString(),
    sessionId: generateSessionId()
  }
}

// 发送请求到n8n webhook
export const sendToN8n = async (message) => {
  const requestData = buildRequestData(message);
  
  try {
    console.log('发送请求到代理服务:', getChatUrl());
    console.log('请求数据:', requestData);
    
    const response = await fetch(getChatUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    console.log('响应状态:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('HTTP错误响应:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('完整响应数据:', responseData);
    
    if (responseData.ok === false) {
      throw new Error(`代理服务错误: ${responseData.message}`);
    }
    
    const reply = parseResponse(responseData);
    return {
      reply: reply,
      timestamp: new Date().toISOString(),
      source: responseData.source || 'unknown'
    };
    
  } catch (error) {
    console.error('发送请求失败:', error);
    
    // 提供更详细的错误信息
    let errorMessage = '网络请求失败，请检查连接';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      errorMessage = '无法连接到代理服务。请确保代理服务正在运行：检查代理服务是否启动：http://localhost:3001/api/health，确认端口3001没有被占用，检查防火墙设置';
    } else if (error.message.includes('404')) {
      errorMessage = 'n8n工作流路径不存在(404)。请检查：n8n工作流是否已正确部署，webhook路径是否为/poetry-chat，n8n服务是否正常运行';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'n8n工作流响应超时。请检查：n8n工作流执行时间是否过长，网络连接是否稳定，API服务是否正常';
    }
    
    return {
      reply: errorMessage,
      timestamp: new Date().toISOString(),
      error: true
    };
  }
}

// 生成会话ID
export const generateSessionId = () => {
  return 'session_' + Math.random().toString(36).substr(2, 9)
}

// 解析响应数据
export const parseResponse = (data) => {
  console.log('原始响应数据:', data)
  
  // 处理空对象或空响应
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return '抱歉，AI服务暂时没有生成内容。请检查n8n工作流配置。'
  }
  
  // 根据n8n webhook的响应格式进行调整
  if (data && data.output) {
    return data.output
  } else if (data && data.text) {
    return data.text
  } else if (data && data.reply) {
    return data.reply
  } else if (data && data.message) {
    return data.message
  } else if (data && data.result) {
    return data.result
  } else if (data && data.response) {
    return data.response
  } else if (data && data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
    // 处理OpenAI格式的响应
    return data.choices[0].message?.content || data.choices[0].text
  } else if (data && data.content) {
    return data.content
  } else if (typeof data === 'string') {
    return data
  } else if (typeof data === 'object') {
    // 尝试将对象转换为字符串
    try {
      const jsonStr = JSON.stringify(data, null, 2)
      return `AI返回了以下数据格式，请检查工作流配置：
${jsonStr}`
    } catch {
      return '抱歉，我暂时无法回答这个问题。'
    }
  } else {
    return '抱歉，我暂时无法回答这个问题。'
  }
}