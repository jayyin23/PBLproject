// API服务配置
const BASE_URL = 'http://localhost:3000'

// 统一的HTTP请求方法
const http = {
  async request(url, options = {}) {
    const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url}`
    
    try {
      const response = await uni.request({
        url: fullUrl,
        method: options.method || 'GET',
        data: options.body,
        header: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 10000
      })
      
      return response[1] // uni.request返回的是数组，第二个元素是响应数据
    } catch (error) {
      console.error('API请求错误:', error)
      throw error
    }
  },
  
  async get(url) {
    return this.request(url)
  },
  
  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: data
    })
  },
  
  async put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: data
    })
  },
  
  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    })
  }
}

// 诗词API
export const poemApi = {
  // 获取所有诗词
  async getList(page = 1, pageSize = 20) {
    return http.get(`/api/poems?page=${page}&pageSize=${pageSize}`)
  },
  
  // 搜索诗词
  async search(keyword) {
    return http.get(`/api/poems/search?keyword=${encodeURIComponent(keyword)}`)
  },
  
  // 获取诗词详情
  async getDetail(id) {
    return http.get(`/api/poems/${id}`)
  },
  
  // 随机推荐
  async recommend(count = 10) {
    return http.get(`/api/poems/recommend?count=${count}`)
  },
  
  // 按朝代查询
  async getByDynasty(dynasty, page = 1, pageSize = 20) {
    return http.get(`/api/poems/dynasty/${encodeURIComponent(dynasty)}?page=${page}&pageSize=${pageSize}`)
  },
  
  // 按体裁查询
  async getByForm(form, page = 1, pageSize = 20) {
    return http.get(`/api/poems/form/${encodeURIComponent(form)}?page=${page}&pageSize=${pageSize}`)
  },
  
  // 按作者查询
  async getByAuthor(author, page = 1, pageSize = 20) {
    return http.get(`/api/poems/author/${encodeURIComponent(author)}?page=${page}&pageSize=${pageSize}`)
  },
  
  // 获取统计信息
  async getStats() {
    return http.get('/api/poems/stats')
  }
}

// 分类API
export const categoryApi = {
  // 获取朝代列表
  async getDynasties() {
    return http.get('/api/dynasties')
  },
  
  // 获取体裁列表
  async getForms() {
    return http.get('/api/forms')
  },
  
  // 获取作者列表
  async getAuthors() {
    return http.get('/api/authors')
  }
}

export default http