// 前端Supabase配置
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mfvmmsipvhgzmobhzkht.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdm1tc2lwdmhnem1vYmh6a2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Njg2NzksImV4cCI6MjA3NjA0NDY3OX0.aJa3sECPOt0FiSlIBRLKM7XbW4eVYQl7evTjGqRzSls'

export const supabase = createClient(supabaseUrl, supabaseKey)

// 诗词API - 直接使用Supabase
export const poemApi = {
  // 搜索诗词
  search: async (keyword, page = 1, pageSize = 20) => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .or(`title.ilike.%${keyword}%,author.ilike.%${keyword}%,dynasty.ilike.%${keyword}%,tags.cs.{${keyword}}`)
        .range((page - 1) * pageSize, page * pageSize - 1)
      
      if (error) throw error
      
      return { ok: true, data: data || [] }
    } catch (error) {
      console.error('搜索诗词错误:', error)
      return { ok: false, message: '搜索失败' }
    }
  },
  
  // 获取推荐诗词
  recommend: async (count = 10) => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .limit(count)
      
      if (error) throw error
      
      // 简单随机排序
      const shuffled = (data || []).sort(() => 0.5 - Math.random())
      
      return { ok: true, data: shuffled.slice(0, count) }
    } catch (error) {
      console.error('推荐诗词错误:', error)
      return { ok: false, message: '推荐失败' }
    }
  },
  
  // 获取诗词详情
  getDetail: async (id) => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return { ok: false, message: '诗词不存在' }
        }
        throw error
      }
      
      return { ok: true, data }
    } catch (error) {
      console.error('获取诗词详情错误:', error)
      return { ok: false, message: '获取失败' }
    }
  },
  
  // 按朝代查询
  getByDynasty: async (dynasty, page = 1, pageSize = 20) => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*', { count: 'exact' })
        .eq('dynasty', dynasty)
        .range((page - 1) * pageSize, page * pageSize - 1)
      
      if (error) throw error
      
      return { 
        ok: true, 
        data: { 
          list: data || [], 
          total: data ? data.length : 0, 
          page,
          pageSize,
          totalPages: Math.ceil((data ? data.length : 0) / pageSize)
        } 
      }
    } catch (error) {
      console.error('按朝代查询错误:', error)
      return { ok: false, message: '查询失败' }
    }
  },
  
  // 获取所有古诗
  getPoems: async () => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('*')
      
      if (error) throw error
      
      // 转换数据格式，适配页面需求
      const transformedData = (data || []).map(poem => ({
        ...poem,
        excerpt: poem.content ? (poem.content.substring(0, 30) + (poem.content.length > 30 ? '...' : '')) : '暂无内容',
        annotation: poem.annotation || '暂无注释',
        appreciation: poem.appreciation || '暂无赏析'
      }))
      
      return transformedData
    } catch (error) {
      console.error('获取古诗列表错误:', error)
      return []
    }
  },
  
  // 获取朝代列表
  getDynasties: async () => {
    try {
      const { data, error } = await supabase
        .from('poems')
        .select('dynasty')
        .not('dynasty', 'is', null)
        .distinct()
      
      if (error) throw error
      
      const dynasties = (data || []).map(item => item.dynasty).filter(Boolean)
      
      return { ok: true, data: dynasties }
    } catch (error) {
      console.error('获取朝代列表错误:', error)
      return { ok: false, message: '获取失败' }
    }
  }
}