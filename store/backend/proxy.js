const express = require('express');
const https = require('https');
const http = require('http');
const cors = require('cors');

const app = express();
const port = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// 诗词AI聊天路由 - 使用可用的n8n webhook服务
app.post('/api/n8n-proxy/poetry-chat', async (req, res) => {
  try {
    const { chatInput, message, input, prompt } = req.body;
    
    // 构建发送到n8n的请求数据
    const requestData = {
      chatInput: chatInput || message || input || prompt || '',
      message: chatInput || message || input || prompt || '',
      input: chatInput || message || input || prompt || '',
      prompt: chatInput || message || input || prompt || '',
      timestamp: new Date().toISOString(),
      sessionId: 'session-' + Date.now()
    };

    console.log('开始调用n8n工作流，请求数据:', requestData);

    // 使用可用的n8n webhook服务
    let n8nResponse;
    try {
      n8nResponse = await new Promise((resolve, reject) => {
        const postData = JSON.stringify(requestData);
        
        const options = {
          hostname: 'localhost',
          port: 5678,
          path: '/webhook/c17dd796-52cf-4503-864d-8750bebdde12',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'User-Agent': 'Poetry-Chat-Proxy/1.0'
          },
          timeout: 15000 // 15秒超时
        };
        
        console.log('发送请求到n8n:', options);
        
        const req = http.request(options, (response) => {
          console.log('n8n响应状态码:', response.statusCode);
          console.log('n8n响应头:', response.headers);
          
          let data = '';
          
          response.on('data', (chunk) => {
            data += chunk;
          });
          
          response.on('end', () => {
            console.log('n8n响应数据:', data);
            
            if (response.statusCode >= 200 && response.statusCode < 300) {
              resolve({
                statusCode: response.statusCode,
                headers: response.headers,
                data: data
              });
            } else {
              reject(new Error(`n8n响应错误: ${response.statusCode} - ${data}`));
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('n8n请求错误:', error);
          reject(error);
        });
        
        req.on('timeout', () => {
          console.error('n8n请求超时');
          req.destroy();
          reject(new Error('n8n请求超时'));
        });
        
        req.write(postData);
        req.end();
      });
      
      console.log('n8n调用成功，响应:', n8nResponse);
      
    } catch (n8nError) {
      console.log('n8n调用失败，使用模拟AI:', n8nError.message);
      
      // 使用模拟AI响应作为降级方案
      const userMessage = requestData.chatInput || '';
      const mockResponse = generateEnhancedMockAIResponse(userMessage);
      
      // 返回给前端
      res.json({
        ok: true,
        reply: mockResponse.reply,
        timestamp: new Date().toISOString(),
        source: 'mock-ai-fallback',
        status: 'n8n-failed-using-mock'
      });
      return;
    }

    // 处理n8n响应
    let responseData;
    try {
      responseData = n8nResponse.data ? JSON.parse(n8nResponse.data) : {};
      console.log('解析后的n8n响应数据:', responseData);
    } catch (parseError) {
      console.error('解析n8n响应失败:', parseError);
      responseData = { reply: n8nResponse.data };
    }

    // 检查n8n是否只返回了工作流启动信息
    let reply = '';
    if (responseData.message && responseData.message.includes('Workflow was started')) {
      console.log('n8n只返回工作流启动信息，切换到模拟AI模式');
      // 使用模拟AI响应
      const userMessage = requestData.chatInput || '';
      const mockResponse = generateEnhancedMockAIResponse(userMessage);
      reply = mockResponse.reply;
    } else if (responseData.reply) {
      reply = responseData.reply;
    } else if (responseData.message) {
      reply = responseData.message;
    } else if (responseData.choices && responseData.choices.length > 0) {
      reply = responseData.choices[0].message?.content || responseData.choices[0].text;
    } else if (responseData.content) {
      reply = responseData.content;
    } else if (typeof responseData === 'string') {
      reply = responseData;
    } else if (responseData.text) {
      reply = responseData.text;
    } else if (responseData.output) {
      reply = responseData.output;
    } else {
      // 使用模拟AI响应作为默认
      const userMessage = requestData.chatInput || '';
      const mockResponse = generateEnhancedMockAIResponse(userMessage);
      reply = mockResponse.reply;
    }

    // 返回给前端
    res.json({
      ok: true,
      reply: reply,
      timestamp: new Date().toISOString(),
      source: 'n8n-workflow',
      status: 'success'
    });

  } catch (error) {
    console.error('代理请求失败:', error);
    
    // 最终错误处理，使用模拟AI
    const userMessage = req.body.chatInput || req.body.message || '';
    const mockResponse = generateEnhancedMockAIResponse(userMessage);
    
    res.json({
      ok: true,
      reply: mockResponse.reply,
      timestamp: new Date().toISOString(),
      source: 'mock-ai-error-fallback',
      status: 'error-using-mock'
    });
  }
});

// 生成增强版模拟AI响应
function generateEnhancedMockAIResponse(userMessage) {
  // 扩展的响应库
  const responses = {
    // 问候类
    '你好': '你好！我是专业的诗词AI助手，专注于中国古典诗词的解析和介绍。我可以帮你了解诗词意境、作者背景、创作风格等。',
    'hello': 'Hello! I am a professional Chinese poetry AI assistant. I can help you understand classical Chinese poetry, poets, and literary techniques.',
    'hi': 'Hi there! I\'m your poetry assistant. How can I help you with Chinese poetry today?',
    
    // 诗人介绍
    '李白': '李白（701年－762年），字太白，号青莲居士，唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。\
\
**代表作品：**\
• 《静夜思》 - 表达游子思乡之情\
• 《将进酒》 - 豪放洒脱的人生感慨\
• 《蜀道难》 - 描绘蜀道险峻的壮丽诗篇\
\
**创作风格：**豪放飘逸、想象丰富、语言流转自然\
\
**历史地位：**与杜甫并称"李杜"，是中国诗歌史上最伟大的诗人之一',
            
            '杜甫': '杜甫（712年－770年），字子美，自号少陵野老，唐代伟大的现实主义诗人，被尊为"诗圣"。\
\
**代表作品：**\
• 《春望》 - 战乱时期的忧国忧民\
• 《登高》 - 登高望远的深沉感慨\
• 《茅屋为秋风所破歌》 - 关心民生疾苦\
\
**创作风格：**沉郁顿挫、关注现实、语言精炼\
\
**历史地位：**其诗被称为"诗史"，深刻反映了唐代社会现实',
            
            '苏轼': '苏轼（1037年－1101年），字子瞻，号东坡居士，北宋文学家、书画家，唐宋八大家之一。\
\
**代表作品：**\
• 《水调歌头·明月几时有》 - 中秋怀人之作\
• 《念奴娇·赤壁怀古》 - 怀古抒怀的豪放词\
• 《江城子·密州出猎》 - 豪放词风的代表作\
\
**创作风格：**豪放洒脱、意境开阔、情感真挚\
\
**文学成就：**诗、词、文、书、画俱佳的全才',
            
            '李清照': '李清照（1084年－1155年），号易安居士，宋代著名女词人，婉约词派代表。\
\
**代表作品：**\
• 《声声慢·寻寻觅觅》 - 晚年孤寂生活的写照\
• 《如梦令·常记溪亭日暮》 - 少女时代的快乐回忆\
• 《醉花阴·薄雾浓云愁永昼》 - 思念丈夫的深情之作\
\
**创作风格：**婉约细腻、情感真挚、语言清丽\
\
**文学地位：**中国文学史上最杰出的女词人',
            
            // 诗词解析
            '静夜思': '《静夜思》 - 李白\
\
**原文：**\
床前明月光，疑是地上霜。\
举头望明月，低头思故乡。\
\
**解析：**\
• **创作背景：**李白在外游历时所作，表达思乡之情\
• **艺术特色：**语言简练，意境深远，比喻贴切\
• **主题思想：**游子思乡，月夜怀人\
• **修辞手法：**比喻（月光如霜）、对仗工整',
            
            '春晓': '《春晓》 - 孟浩然\
\
**原文：**\
春眠不觉晓，处处闻啼鸟。\
夜来风雨声，花落知多少。\
\
**解析：**\
• **创作背景：**描绘春日早晨的清新景象\
• **艺术特色：**语言清新自然，意境优美\
• **主题思想：**珍惜春光，感叹时光流逝\
• **文学价值：**五言绝句的典范之作',
            
            // 诗词类型
            '唐诗': '**唐诗**是中国古典诗歌的黄金时代，分为四个时期：\
\
**初唐（618-712年）：**\
• 代表诗人：王勃、杨炯、卢照邻、骆宾王（初唐四杰）\
• 特点：承前启后，逐渐摆脱六朝绮靡诗风\
\
**盛唐（713-765年）：**\
• 代表诗人：李白、杜甫、王维、孟浩然\
• 特点：诗歌艺术达到巅峰，风格多样\
\
**中唐（766-835年）：**\
• 代表诗人：白居易、元稹、韩愈、柳宗元\
• 特点：现实主义倾向增强\
\
**晚唐（836-907年）：**\
• 代表诗人：李商隐、杜牧\
• 特点：风格婉约，意境朦胧',
            
            '宋词': '**宋词**是宋代盛行的文学体裁，主要分为两派：\
\
**婉约派：**\
• 代表词人：李清照、柳永、晏殊、秦观\
• 特点：情感细腻，语言婉转，多写个人情感\
\
**豪放派：**\
• 代表词人：苏轼、辛弃疾\
• 特点：意境开阔，气势豪迈，多写壮志豪情\
\
**词牌名常见类型：**\
• 小令（58字以内）\
• 中调（59-90字）\
• 长调（91字以上）',
            
            // 创作指导
            '写诗': '**诗词创作基本要点：**\
\
1. **立意要新：**选择独特的视角和主题\
2. **意境要美：**营造优美的画面和氛围\
3. **语言要精：**追求语言的精炼和准确\
4. **格律要准：**注意平仄、对仗、押韵\
\
**初学者建议：**\
• 从五言绝句开始练习\
• 多读经典，积累词汇\
• 注重观察生活，有感而发',
            
            '押韵': '**诗词押韵规则：**\
\
**近体诗押韵：**\
• 一般押平声韵\
• 一韵到底，不能换韵\
• 偶数句必须押韵，首句可押可不押\
\
**词押韵：**\
• 按词牌规定押韵\
• 有平韵、仄韵、平仄通押等不同要求\
• 韵脚位置固定\
\
**常见韵部：**东、冬、江、支、微等',
            
            // 文学知识
            '修辞': '**常见诗词修辞手法：**\
\
1. **比喻：**"不知细叶谁裁出，二月春风似剪刀"\
2. **拟人：**"感时花溅泪，恨别鸟惊心"\
3. **对仗：**"两个黄鹂鸣翠柳，一行白鹭上青天"\
4. **夸张：**"飞流直下三千尺，疑是银河落九天"\
5. **用典：**引用历史故事或前人诗句',
            
            '意境': '**诗词意境创造：**\
\
1. **情景交融：**情感与景物完美结合\
2. **虚实相生：**现实描写与想象结合\
3. **含蓄蕴藉：**言有尽而意无穷\
4. **时空转换：**通过时空变化营造意境\
\
**优秀意境范例：**\
• "孤帆远影碧空尽，唯见长江天际流" - 开阔\
• "采菊东篱下，悠然见南山" - 闲适\
• "大漠孤烟直，长河落日圆" - 壮美'
  };
  
  // 智能关键词匹配（支持模糊匹配）
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, response] of Object.entries(responses)) {
    const lowerKeyword = keyword.toLowerCase();
    
    // 完全匹配或包含匹配
    if (lowerMessage === lowerKeyword || lowerMessage.includes(lowerKeyword)) {
      return { reply: response };
    }
    
    // 支持同义词匹配
    const synonyms = {
      'hello': ['hi', 'hey', 'hola'],
      '你好': ['您好', '嗨', '哈喽'],
      '唐诗': ['唐代诗歌', '唐朝诗'],
      '宋词': ['宋代词', '宋朝词'],
      '李白': ['李太白', '诗仙'],
      '杜甫': ['杜子美', '诗圣'],
      '写诗': ['作诗', '创作诗歌', '诗歌创作'],
      '押韵': ['韵律', '韵脚']
    };
    
    if (synonyms[keyword]) {
      for (const synonym of synonyms[keyword]) {
        if (lowerMessage.includes(synonym.toLowerCase())) {
          return { reply: response };
        }
      }
    }
  }
  
  // 智能生成响应（对于未匹配的消息）
  if (userMessage.length > 0) {
    return { 
      reply: `感谢您的提问："${userMessage}"

我注意到您的问题超出了当前的知识范围。作为诗词AI助手，我主要专注于：

📚 **诗词解析** - 名篇赏析、意境分析
👨‍🎓 **诗人介绍** - 生平事迹、创作风格
🏛️ **文学知识** - 朝代特点、文学流派
✍️ **创作指导** - 写作技巧、格律规则

您可以尝试询问：
• "李白的创作风格是什么？"
• "《静夜思》表达了什么情感？"
• "唐诗和宋词有什么区别？"
• "如何写一首合格的绝句？"

我会尽力为您提供专业的诗词知识解答！` 
    };
  } else {
    return { 
      reply: '您好！我是专业的诗词AI助手，可以帮您：\
\
🎯 **解析诗词** - 深度解读名篇佳作\
📖 **介绍诗人** - 了解文人生平与成就\
🌍 **文学历史** - 探索不同朝代特点\
💡 **创作指导** - 学习诗词写作技巧\
\
请告诉我您想了解什么？比如："介绍李白" 或 "解析《静夜思》"' 
    };
  }
}

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'n8n-proxy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`n8n代理服务运行在 http://localhost:${port}`);
});