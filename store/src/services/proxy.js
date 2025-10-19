// 代理服务配置 - 解决CORS问题
export const proxyConfig = {
  // 代理端点
  proxyEndpoint: '/api/proxy',
  
  // 允许的域名列表
  allowedOrigins: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://pblpro.app.n8n.cloud'
  ],
  
  // 超时设置
  timeout: 10000
}

// 代理请求处理函数
export const handleProxyRequest = async (req, res) => {
  try {
    const targetUrl = req.headers['x-target-url']
    
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing target URL' })
    }
    
    // 验证目标URL
    if (!targetUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid target URL' })
    }
    
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Target-URL')
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }
    
    // 转发请求到目标URL
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      },
      body: req.body ? JSON.stringify(req.body) : undefined
    })
    
    const data = await response.text()
    
    // 返回响应
    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    res.send(data)
    
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy server error' })
  }
}

// 检查URL是否可访问
export const checkUrlAccessibility = async (url) => {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors'
    })
    return true
  } catch (error) {
    return false
  }
}