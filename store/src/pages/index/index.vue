<template>
  <div class="container">
    <!-- 顶部分类导航 -->
    <div class="category-nav">
      <div class="category-scroll">
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'all' }"
          @click="switchCategory('all')"
        >
          全部
        </div>
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'tang' }"
          @click="switchCategory('tang')"
        >
          唐诗
        </div>
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'song' }"
          @click="switchCategory('song')"
        >
          宋词
        </div>
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'yuan' }"
          @click="switchCategory('yuan')"
        >
          元曲
        </div>
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'ming' }"
          @click="switchCategory('ming')"
        >
          明清
        </div>
        <div 
          class="category-item" 
          :class="{ active: activeCategory === 'modern' }"
          @click="switchCategory('modern')"
        >
          现代
        </div>
        <a 
          class="category-item" 
          :class="{ active: activeCategory === 'favorites' }"
          @click="navigateToFavorites"
          style="cursor: pointer; text-decoration: none; color: inherit;"
          href="javascript:void(0)"
        >
          我的收藏
        </a>
      </div>
    </div>

    <!-- 实时搜索框 -->
    <div class="search-section">
      <div class="search-bar" @click="navigateToSearch">
        <span class="search-icon">🔍</span>
        <span class="search-text">搜索诗词、作者</span>
      </div>
    </div>

    <!-- 诗词列表 -->
    <div class="poem-list">
      <div 
        class="poem-card" 
        v-for="(poem, index) in filteredPoems" 
        :key="index"
        @click="viewDetail(poem)"
      >
        <div class="poem-header">
          <h3 class="poem-title">{{ poem.title }}</h3>
          <div class="poem-meta">
            <span class="poem-author">{{ poem.author }}</span>
            <span class="poem-dynasty">{{ poem.dynasty }}</span>
          </div>
        </div>
        <p class="poem-excerpt">{{ poem.excerpt }}</p>
        <div class="poem-footer">
          <div class="poem-tags">
            <span class="tag" v-for="tag in poem.tags" :key="tag">{{ tag }}</span>
          </div>
          <div class="action-buttons">
            <!-- 悬浮收藏按钮 -->
            <button 
              class="favorite-btn" 
              :class="{ favorited: isFavorite(poem) }"
              @click.stop="toggleFavorite(poem)"
            >
              {{ isFavorite(poem) ? '❤️' : '🤍' }}
            </button>
            <button class="share-btn" @click.stop="sharePoem(poem)">📤</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-if="loading">
      <span>诗词加载中...</span>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else-if="filteredPoems.length === 0">
      <span class="empty-icon">📚</span>
      <span class="empty-text">暂无诗词数据</span>
    </div>

    <!-- 诗词对话助手 -->
    <div class="chat-assistant">
      <!-- 聊天按钮 -->
      <button 
        id="chatBtn" 
        class="chat-btn"
        @click="openChatDialog"
      >
        💬 诗词助手
      </button>

      <!-- 聊天对话框 -->
      <div 
        class="chat-dialog"
        :class="{ active: isChatOpen }"
      >
        <div class="dialog-header">
          <h3>诗词对话助手</h3>
          <button class="close-dialog" @click="closeChatDialog">×</button>
        </div>
        
        <div class="dialog-content">
          <!-- 消息显示区域 -->
          <div class="messages-container">
            <div 
              v-for="(message, index) in chatMessages" 
              :key="index"
              :class="['message', message.type]"
            >
              <div class="message-content">{{ message.content }}</div>
              <div class="message-time">{{ message.time }}</div>
            </div>
            <div v-if="chatLoading" class="loading-message">
              <div class="typing-indicator">诗词助手正在思考...</div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-container">
            <textarea 
              v-model="userInput"
              placeholder="请输入您想了解的诗词内容..."
              @keydown.enter.prevent="sendMessage"
              rows="3"
            ></textarea>
            <button 
              class="send-btn"
              @click="sendMessage"
              :disabled="!userInput.trim() || chatLoading"
            >
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { poemApi } from '../../../services/supabase.js'
import { getChatUrl, buildRequestData, parseResponse, sendToN8n } from '../../../src/config/chat.js'

export default {
  name: 'IndexPage',
  setup() {
    const router = useRouter()
    const activeCategory = ref('all')
    const poems = ref([])
    const filteredPoems = ref([])
    const loading = ref(false)
    const favorites = ref([])
    const isChatOpen = ref(false)
    const chatUrl = ref(getChatUrl())
    const chatError = ref(false)
    const chatLoading = ref(false)
    const userInput = ref('')
    const chatMessages = ref([])

    const loadPoems = async () => {
      loading.value = true
      try {
        // 从Supabase获取真实数据
        const data = await poemApi.getPoems()
        poems.value = data.map(poem => ({
          ...poem,
          category: getCategoryByDynasty(poem.dynasty),
          tags: poem.tags || []
        }))
        filteredPoems.value = [...poems.value]
      } catch (error) {
        console.error('加载诗词数据失败:', error)
        showToast('加载失败')
      } finally {
        loading.value = false
      }
    }

    const getCategoryByDynasty = (dynasty) => {
      const dynastyMap = {
        '唐': 'tang',
        '宋': 'song', 
        '元': 'yuan',
        '明': 'ming',
        '清': 'ming',
        '现代': 'modern'
      }
      return dynastyMap[dynasty] || 'all'
    }

    const switchCategory = (category) => {
      activeCategory.value = category
      if (category === 'all') {
        filteredPoems.value = [...poems.value]
      } else {
        filteredPoems.value = poems.value.filter(poem => poem.category === category)
      }
    }

    const navigateToSearch = () => {
      router.push('/search')
    }

    const navigateToFavorites = () => {
      console.log('点击了我的收藏链接 - 函数被调用')
      console.log('router对象:', router)
      console.log('当前路由:', router.currentRoute.value)
      router.push('/favorites').then(() => {
        console.log('路由跳转成功')
      }).catch(err => {
        console.error('路由跳转失败:', err)
      })
    }

    const viewDetail = (poem) => {
      router.push(`/poem/detail?id=${poem.id}`)
    }

    const toggleFavorite = (poem) => {
      const index = favorites.value.findIndex(fav => fav.id === poem.id)
      if (index > -1) {
        favorites.value.splice(index, 1)
        showToast('取消收藏')
      } else {
        favorites.value.push(poem)
        showToast('收藏成功', 'success')
      }
      saveFavorites()
    }

    const isFavorite = (poem) => {
      return favorites.value.some(fav => fav.id === poem.id)
    }

    const sharePoem = (poem) => {
      const actions = ['分享给好友', '复制链接', '生成图片']
      const selected = prompt(`请选择操作:\n${actions.map((a, i) => `${i + 1}. ${a}`).join('\n')}`)
      if (selected) {
        const index = parseInt(selected) - 1
        if (index >= 0 && index < actions.length) {
          const methods = ['shareToFriend', 'copyLink', 'generateImage']
          if (methods[index]) {
            methods[index](poem)
          }
        }
      }
    }

    const shareToFriend = (poem) => {
      showToast('分享功能开发中')
    }

    const copyLink = (poem) => {
      navigator.clipboard.writeText(`https://poem.app/detail/${poem.id}`)
        .then(() => {
          showToast('链接已复制', 'success')
        })
        .catch(() => {
          showToast('复制失败')
        })
    }

    const generateImage = (poem) => {
      showToast('图片生成开发中')
    }

    const showToast = (message, type = 'info') => {
      alert(message)
    }

    const openChatDialog = () => {
      isChatOpen.value = true
      chatError.value = false
      
      // 如果消息太多，清理一下
      if (chatMessages.value.length > 30) {
        chatMessages.value = chatMessages.value.slice(-20); // 保留最后20条
      }
      
      // 添加欢迎消息（只在第一次打开或消息为空时）
      if (chatMessages.value.length === 0) {
        addMessage('欢迎使用诗词助手！我可以帮您了解诗词、作者、创作背景等信息。', 'assistant')
      }
    }

    const closeChatDialog = () => {
      isChatOpen.value = false
    }

    const sendMessage = async () => {
      if (!userInput.value.trim() || chatLoading.value) return
      
      const userMessage = userInput.value.trim()
      userInput.value = ''
      
      // 添加用户消息
      addMessage(userMessage, 'user')
      
      // 设置加载状态
      chatLoading.value = true
      
      try {
        console.log('开始调用工作流API:', getChatUrl())
        
        // 使用新的sendToN8n函数发送请求
        const result = await sendToN8n(userMessage)
        console.log('响应结果:', result)
        
        // 添加助手回复
        addMessage(result.reply, 'assistant')
        
      } catch (error) {
        console.error('调用工作流失败:', error)
        
        // 提供更友好的错误信息
        let errorMessage = '抱歉，服务暂时不可用。'
        if (error.message.includes('CORS')) {
          errorMessage = '跨域访问问题，正在尝试解决...'
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          errorMessage = '网络连接失败，请检查网络连接后重试。'
        }
        
        addMessage(errorMessage, 'assistant')
        chatError.value = true
      } finally {
        chatLoading.value = false
      }
    }

    const addMessage = (content, type) => {
      // 限制消息数量，最多保留50条消息
      if (chatMessages.value.length >= 50) {
        chatMessages.value = chatMessages.value.slice(-49); // 保留最后49条
      }
      
      chatMessages.value.push({
        content,
        type,
        time: new Date().toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      })
      
      // 滚动到底部
      setTimeout(() => {
        const container = document.querySelector('.messages-container')
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 100)
    }

    const handleChatLoad = () => {
      chatLoading.value = false
      chatError.value = false
    }

    const handleChatError = () => {
      chatLoading.value = false
      chatError.value = true
    }

    const retryChat = () => {
      chatError.value = false
      chatLoading.value = true
    }

    const saveFavorites = () => {
      try {
        localStorage.setItem('favoritePoems', JSON.stringify(favorites.value))
      } catch (e) {
        console.error('保存收藏失败:', e)
      }
    }

    const loadFavorites = () => {
      try {
        const saved = localStorage.getItem('favoritePoems')
        if (saved) {
          favorites.value = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载收藏失败:', e)
      }
    }

    onMounted(async () => {
      await loadPoems()
      loadFavorites()
    })

    return {
      activeCategory,
      poems,
      filteredPoems,
      loading,
      favorites,
      isChatOpen,
      chatUrl,
      chatError,
      chatLoading,
      userInput,
      chatMessages,
      switchCategory,
      navigateToSearch,
      navigateToFavorites,
      viewDetail,
      toggleFavorite,
      isFavorite,
      sharePoem,
      openChatDialog,
      closeChatDialog,
      sendMessage,
      handleChatLoad,
      handleChatError,
      retryChat
    }
  }
}
</script>

<style scoped>
.container {
  height: 100vh;
  background: linear-gradient(135deg, #f8f4e9 0%, #f0e6d2 100%);
  display: flex;
  flex-direction: column;
}

/* 分类导航 */
.category-nav {
  padding: 20px 30px;
  background-color: #fff;
  border-bottom: 2px solid #e8e1d1;
}

.category-scroll {
  white-space: nowrap;
  overflow-x: auto;
}

.category-item {
  display: inline-block;
  padding: 16px 32px;
  margin-right: 20px;
  background-color: #f5f2eb;
  border-radius: 30px;
  font-size: 28px;
  color: #666;
  transition: all 0.3s ease;
  cursor: pointer !important;
  pointer-events: auto !important;
}

.category-item.active {
  background-color: #8b7355;
  color: white;
  font-weight: bold;
}

.category-item:last-child {
  margin-right: 0;
}

/* 搜索区域 */
.search-section {
  padding: 30px;
}

.search-bar {
  background-color: white;
  border-radius: 20px;
  padding: 20px 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  cursor: pointer;
}

.search-icon {
  margin-right: 15px;
  font-size: 32px;
}

.search-text {
  font-size: 28px;
  color: #999;
}

/* 诗词列表 */
.poem-list {
  flex: 1;
  padding: 0 30px 30px;
  overflow-y: auto;
}

.poem-card {
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.poem-card:hover {
  transform: scale(0.98);
}

.poem-header {
  margin-bottom: 20px;
}

.poem-title {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.poem-meta {
  display: flex;
  align-items: center;
}

.poem-author {
  font-size: 24px;
  color: #666;
  margin-right: 20px;
}

.poem-dynasty {
  font-size: 22px;
  color: #888;
  background-color: #f0f0f0;
  padding: 4px 12px;
  border-radius: 8px;
}

.poem-excerpt {
  font-size: 26px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.poem-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poem-tags {
  flex: 1;
}

.tag {
  display: inline-block;
  background-color: #e8f4fd;
  color: #1890ff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 20px;
  margin-right: 10px;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.favorite-btn, .share-btn {
  font-size: 32px;
  cursor: pointer;
  border: none;
  background: none;
  transition: transform 0.2s ease;
}

.favorite-btn:hover, .share-btn:hover {
  transform: scale(1.2);
}

.favorite-btn.favorited {
  color: #ff4757;
}

/* 加载状态 */
.loading {
  padding: 60px;
  text-align: center;
  color: #999;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 28px;
  color: #999;
}

/* 诗词对话助手样式 */
.chat-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chat-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 25px;
  background: #8b7355;
  color: white;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 16px;
  font-weight: bold;
  transition: all 0.3s ease;
  z-index: 1001;
}

.chat-btn:hover {
  background: #6b5a45;
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* 聊天对话框样式 */
.chat-dialog {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 400px;
  height: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.chat-dialog.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dialog-header {
  padding: 20px;
  background: #8b7355;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-dialog {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-dialog:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f4e9;
  max-height: 400px;
  min-height: 400px;
}

.message {
  margin-bottom: 15px;
  max-width: 80%;
}

.message.user {
  margin-left: auto;
}

.message.assistant {
  margin-right: auto;
}

.message-content {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
}

.message.user .message-content {
  background: #8b7355;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: white;
  color: #333;
  border: 1px solid #e8e1d1;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #999;
  margin-top: 4px;
  text-align: right;
}

.message.user .message-time {
  text-align: right;
}

.message.assistant .message-time {
  text-align: left;
}

.loading-message {
  text-align: center;
  padding: 10px;
}

.typing-indicator {
  display: inline-block;
  background: white;
  padding: 8px 16px;
  border-radius: 18px;
  border: 1px solid #e8e1d1;
  font-size: 12px;
  color: #666;
}

.input-container {
  padding: 20px;
  border-top: 1px solid #e8e1d1;
  background: white;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.input-container textarea {
  flex: 1;
  border: 1px solid #e8e1d1;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  resize: none;
  outline: none;
  transition: border 0.3s ease;
}

.input-container textarea:focus {
  border-color: #8b7355;
}

.send-btn {
  background: #8b7355;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: background 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #6b5a45;
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 聊天错误状态样式 */
.chat-error {
  padding: 40px 20px;
  text-align: center;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b6b;
  margin-bottom: 10px;
}

.error-message {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
}

.error-solution {
  text-align: left;
  max-width: 300px;
}

.error-solution p {
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.error-solution ul {
  margin: 0 0 20px 0;
  padding-left: 20px;
  color: #666;
}

.error-solution li {
  margin-bottom: 5px;
  font-size: 14px;
}

.retry-btn {
  background: #8b7355;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #6b5a45;
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .chat-box {
    width: calc(100vw - 40px);
    height: 70vh;
    right: 20px;
    left: 20px;
    bottom: 80px;
  }
  
  .chat-btn {
    padding: 12px 20px;
    font-size: 14px;
  }
}
</style>