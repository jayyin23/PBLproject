const express = require('express');
const cors = require('cors');
require('dotenv').config();
const supabase = require('./supabase');

const app = express();
app.use(cors());
app.use(express.json());

// 环境变量
const PORT = process.env.PORT || 3000;

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: '服务运行正常' });
});

// 搜索接口：按标题/作者/朝代/标签
app.get('/api/poems/search', async (req, res) => {
  try {
    const keyword = (req.query.keyword || '').trim();
    
    if (!keyword) {
      return res.json({ ok: true, data: [] });
    }

    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .or(`title.ilike.%${keyword}%,author.ilike.%${keyword}%,dynasty.ilike.%${keyword}%,tags.cs.{${keyword}}`)
      .limit(50);

    if (error) throw error;

    res.json({ ok: true, data: data || [] });
  } catch (error) {
    console.error('搜索诗词错误:', error);
    res.status(500).json({ ok: false, message: '搜索失败' });
  }
});

// 统计信息路由（必须在参数路由之前）
app.get('/api/poems/stats', async (_req, res) => {
  try {
    // 获取总数
    const { count: total, error: countError } = await supabase
      .from('poems')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // 按朝代统计
    const { data: dynastyStats, error: dynastyError } = await supabase
      .from('poems')
      .select('dynasty')
      .not('dynasty', 'is', null);

    if (dynastyError) throw dynastyError;

    const dynastyCounts = {};
    (dynastyStats || []).forEach(poem => {
      dynastyCounts[poem.dynasty] = (dynastyCounts[poem.dynasty] || 0) + 1;
    });

    // 按体裁统计
    const { data: formStats, error: formError } = await supabase
      .from('poems')
      .select('form')
      .not('form', 'is', null);

    if (formError) throw formError;

    const formCounts = {};
    (formStats || []).forEach(poem => {
      formCounts[poem.form] = (formCounts[poem.form] || 0) + 1;
    });

    // 按作者统计
    const { data: authorStats, error: authorError } = await supabase
      .from('poems')
      .select('author');

    if (authorError) throw authorError;

    const authorCounts = {};
    (authorStats || []).forEach(poem => {
      authorCounts[poem.author] = (authorCounts[poem.author] || 0) + 1;
    });

    const topAuthors = Object.entries(authorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([author, count]) => ({ author, count }));

    res.json({
      ok: true,
      data: {
        total: total || 0,
        dynastyStats: Object.entries(dynastyCounts).map(([dynasty, count]) => ({ dynasty, count })),
        formStats: Object.entries(formCounts).map(([form, count]) => ({ form, count })),
        topAuthors
      }
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({ ok: false, message: '获取统计失败' });
  }
});

// 推荐接口：随机推荐
app.get('/api/poems/recommend', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .limit(count);

    if (error) throw error;

    // 简单随机排序
    const shuffled = (data || []).sort(() => 0.5 - Math.random());
    
    res.json({ ok: true, data: shuffled.slice(0, count) });
  } catch (error) {
    console.error('推荐诗词错误:', error);
    res.status(500).json({ ok: false, message: '推荐失败' });
  }
});

// 获取诗词详情
app.get('/api/poems/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ ok: false, message: '诗词ID不能为空' });
    }

    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ ok: false, message: '诗词不存在' });
      }
      throw error;
    }

    res.json({ ok: true, data });
  } catch (error) {
    console.error('获取诗词详情错误:', error);
    res.status(500).json({ ok: false, message: '获取失败' });
  }
});

// 按朝代分类查询
app.get('/api/poems/dynasty/:dynasty', async (req, res) => {
  try {
    const { dynasty } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact' })
      .eq('dynasty', dynasty)
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    res.json({ 
      ok: true, 
      data: { 
        list: data || [], 
        total: data ? data.length : 0, 
        page,
        pageSize,
        totalPages: Math.ceil((data ? data.length : 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('按朝代查询错误:', error);
    res.status(500).json({ ok: false, message: '查询失败' });
  }
});

// 按体裁分类查询
app.get('/api/poems/form/:form', async (req, res) => {
  try {
    const { form } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact' })
      .eq('form', form)
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    res.json({ 
      ok: true, 
      data: { 
        list: data || [], 
        total: data ? data.length : 0, 
        page,
        pageSize,
        totalPages: Math.ceil((data ? data.length : 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('按体裁查询错误:', error);
    res.status(500).json({ ok: false, message: '查询失败' });
  }
});

// 按作者查询
app.get('/api/poems/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact' })
      .eq('author', author)
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    res.json({ 
      ok: true, 
      data: { 
        list: data || [], 
        total: data ? data.length : 0, 
        page,
        pageSize,
        totalPages: Math.ceil((data ? data.length : 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('按作者查询错误:', error);
    res.status(500).json({ ok: false, message: '查询失败' });
  }
});



// 获取所有朝代列表
app.get('/api/dynasties', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('dynasty');

    if (error) throw error;

    // 手动去重和过滤
    const dynasties = [...new Set((data || [])
      .map(item => item.dynasty)
      .filter(Boolean))];
    
    res.json({ ok: true, data: dynasties });
  } catch (error) {
    console.error('获取朝代列表错误:', error);
    res.status(500).json({ ok: false, message: '获取失败' });
  }
});

// 获取所有体裁列表
app.get('/api/forms', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('form');

    if (error) throw error;

    // 手动去重和过滤
    const forms = [...new Set((data || [])
      .map(item => item.form)
      .filter(Boolean))];
    
    res.json({ ok: true, data: forms });
  } catch (error) {
    console.error('获取体裁列表错误:', error);
    res.status(500).json({ ok: false, message: '获取失败' });
  }
});

// 获取所有诗词列表
app.get('/api/poems', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const offset = (page - 1) * pageSize;

    const { data, error } = await supabase
      .from('poems')
      .select('*', { count: 'exact' })
      .range(offset, offset + pageSize - 1)
      .order('id', { ascending: true });

    if (error) throw error;

    res.json({ 
      ok: true, 
      data: { 
        list: data || [], 
        total: data ? data.length : 0, 
        page,
        pageSize,
        totalPages: Math.ceil((data ? data.length : 0) / pageSize)
      } 
    });
  } catch (error) {
    console.error('获取诗词列表错误:', error);
    res.status(500).json({ ok: false, message: '获取失败' });
  }
});

// 插入诗词数据
app.post('/api/poems', async (req, res) => {
  try {
    const { title, author, dynasty, form, content, tags } = req.body;
    
    if (!title || !author || !dynasty || !form || !content) {
      return res.status(400).json({ ok: false, message: '缺少必要字段' });
    }

    const { data, error } = await supabase
      .from('poems')
      .insert([{
        title,
        author,
        dynasty,
        form,
        content,
        tags: tags || []
      }])
      .select();

    if (error) throw error;

    res.json({ ok: true, data: data[0], message: '诗词添加成功' });
  } catch (error) {
    console.error('插入诗词错误:', error);
    res.status(500).json({ ok: false, message: '插入失败' });
  }
});

// 获取所有作者列表
app.get('/api/authors', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('author');

    if (error) throw error;

    // 手动去重和过滤
    const authors = [...new Set((data || [])
      .map(item => item.author)
      .filter(Boolean))];
    
    res.json({ ok: true, data: authors });
  } catch (error) {
    console.error('获取作者列表错误:', error);
    res.status(500).json({ ok: false, message: '获取失败' });
  }
});

app.listen(PORT, () => {
  console.log(`诗词API服务运行在: http://localhost:${PORT}`);
  console.log('可用接口:');
  console.log('  GET /api/health - 健康检查');
  console.log('  GET /api/poems/search?keyword=李白 - 搜索诗词');
  console.log('  GET /api/poems/1 - 获取诗词详情');
  console.log('  GET /api/poems/dynasty/唐 - 按朝代查询');
  console.log('  GET /api/poems/form/五言绝句 - 按体裁查询');
  console.log('  GET /api/poems/author/李白 - 按作者查询');
  console.log('  GET /api/poems/recommend?count=10 - 随机推荐');
  console.log('  GET /api/poems/stats - 统计信息');
  console.log('  GET /api/dynasties - 朝代列表');
  console.log('  GET /api/forms - 体裁列表');
  console.log('  GET /api/authors - 作者列表');
});