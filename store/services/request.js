// 请求封装
const BASE_URL = 'http://localhost:3000'

export const get = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      data,
      method: 'GET',
      success: (res) => {
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

export const post = (url, data = {}) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + url,
      data,
      method: 'POST',
      header: {
        'Content-Type': 'application/json'
      },
      success: (res) => {
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 示例API调用
export const poemApi = {
  // 搜索诗词
  search: (keyword, page = 1, pageSize = 20) => {
    return get('/api/poems/search', { keyword, page, pageSize })
  },
  
  // 获取推荐诗词
  recommend: (count = 10) => {
    return get('/api/poems/recommend', { count })
  },
  
  // 获取诗词详情
  getDetail: (id) => {
    return get(`/api/poems/${id}`)
  },
  
  // 获取分类诗词
  getByCategory: (category, page = 1, pageSize = 20) => {
    return get('/api/poems/category', { category, page, pageSize })
  }
}