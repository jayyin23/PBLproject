// 古诗数据类型定义
export interface Poem {
  id: number
  title: string
  author: string
  dynasty?: string
  form?: string
  preview: string
  tags: string[]
  content: string[]
  analysis: {
    background: string
    theme: string
    features: string
    comments: string[]
  }
}

// API 响应类型
export interface ApiResponse<T> {
  ok: boolean
  data: T
  message?: string
}

// 搜索响应类型
export interface SearchResponse {
  list: Poem[]
  total?: number
}