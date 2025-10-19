<template>
  <div class="container">
    <!-- 顶部导航栏 -->
    <div class="navbar">
      <div class="nav-left">
        <text class="back-btn" @click="goBack">← 返回</text>
      </div>
      <div class="nav-center">
        <text class="category-btn" @click="showCategoryMenu = !showCategoryMenu">
          📚 分类
        </text>
      </div>
      <div class="nav-right">
        <text class="favorite-btn" @click="toggleFavoritesView">
          {{ showFavorites ? '📖 列表' : '⭐ 收藏' }}
        </text>
      </div>
    </div>

    <!-- 分类菜单 -->
    <div class="category-menu" v-if="showCategoryMenu">
      <div class="category-item" @click="showPoemCategory">
        <text class="category-icon">📖</text>
        <text class="category-text">古诗分类</text>
      </div>
      <div class="category-item" @click="showPoetCategory">
        <text class="category-icon">👤</text>
        <text class="category-text">诗人分类</text>
      </div>
    </div>

    <!-- 固定搜索框 -->
    <div class="search-bar">
      <div class="search-input-container">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索古诗标题、作者或内容"
          placeholder-class="search-placeholder"
          @input="handleSearchInput"
        />
        <text v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</text>
      </div>
    </div>

    <!-- 加载状态 -->
    <div class="loading" v-if="loading">
      <span>加载中...</span>
    </div>

    <!-- 收藏视图 -->
    <div class="favorites-view" v-else-if="showFavorites">
      <div class="favorites-header">
        <text class="favorites-title">我的收藏</text>
        <text class="favorites-count">已收藏 {{ favorites.length }} 首</text>
      </div>
      <div class="poem-list" v-if="favorites.length > 0">
        <div
          class="poem-card"
          v-for="(poem, index) in favorites"
          :key="'favorite-' + index"
          @click="viewDetail(poem)"
        >
          <div class="poem-header">
            <text class="poem-title">{{ poem.title }}</text>
            <div class="poem-meta">
              <text class="poem-author">{{ poem.author }}</text>
              <text class="poem-dynasty">{{ poem.dynasty }}</text>
            </div>
          </div>
          <text class="poem-excerpt">{{ poem.excerpt }}</text>
          <div class="poem-footer">
            <text class="favorite-btn" @click.stop="toggleFavorite(poem)">
              ⭐ 取消收藏
            </text>
            <text class="detail-btn" @click.stop="viewDetail(poem)">📖 详情</text>
          </div>
        </div>
      </div>
      <div class="no-favorites" v-else>
        <text class="no-favorites-text">暂无收藏的古诗</text>
      </div>
    </div>

    <!-- 诗词详情视图 -->
    <div class="poem-detail" v-else-if="showDetail">
      <!-- 诗词标题和作者 -->
      <div class="poem-header">
        <h1 class="poem-title">{{ selectedPoem.title }}</h1>
        <div class="poem-meta">
          <span class="poem-author">{{ selectedPoem.author }}</span>
          <span class="poem-dynasty">· {{ selectedPoem.dynasty }}</span>
        </div>
      </div>

      <!-- 诗词内容 -->
      <div class="poem-content">
        <pre class="poem-text">{{ selectedPoem.content }}</pre>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="favorite-btn" :class="{ favorited: isFavorite(selectedPoem) }" @click="toggleFavorite(selectedPoem)">
          {{ isFavorite(selectedPoem) ? '❤️ 已收藏' : '🤍 收藏' }}
        </button>
        <button class="share-btn" @click="sharePoem">📤 分享</button>
      </div>

      <!-- 注释 -->
      <div class="annotations" v-if="selectedPoem.annotation">
        <h3 class="section-title">注释</h3>
        <p class="annotation-text">{{ selectedPoem.annotation }}</p>
      </div>

      <!-- 诗词赏析 -->
      <div class="appreciation" v-if="selectedPoem.appreciation">
        <h3 class="section-title">赏析</h3>
        <p class="appreciation-text">{{ selectedPoem.appreciation }}</p>
      </div>

      <!-- 相关推荐 -->
      <div class="recommendations" v-if="recommendations.length > 0">
        <h3 class="section-title">相关推荐</h3>
        <div class="recommendation-list">
          <div 
            class="recommendation-item" 
            v-for="(item, index) in recommendations" 
            :key="index"
            @click="viewRecommendation(item)"
          >
            <span class="rec-title">{{ item.title }}</span>
            <span class="rec-author">{{ item.author }} · {{ item.dynasty }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 古诗列表视图 -->
    <div class="poem-list-view" v-else>
      <div class="poem-list">
        <div
          class="poem-card"
          v-for="(poem, index) in filteredPoems"
          :key="index"
          @click="viewDetail(poem)"
        >
          <div class="poem-header">
            <text class="poem-title">{{ poem.title }}</text>
            <div class="poem-meta">
              <text class="poem-author">{{ poem.author }}</text>
              <text class="poem-dynasty">{{ poem.dynasty }}</text>
            </div>
          </div>
          <text class="poem-excerpt">{{ poem.excerpt }}</text>
          <div class="poem-footer">
            <text class="favorite-btn" @click.stop="toggleFavorite(poem)">
              {{ isFavorite(poem) ? '⭐ 已收藏' : '☆ 收藏' }}
            </text>
            <text class="detail-btn" @click.stop="viewDetail(poem)">📖 详情</text>
          </div>
        </div>
      </div>

      <!-- 搜索结果提示 -->
      <div class="search-result" v-if="searchKeyword && filteredPoems.length === 0">
        <text class="no-result-text">未找到相关古诗</text>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { poemApi } from '../../../services/supabase.js'

export default {
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // 响应式数据
    const poems = ref([])
    const filteredPoems = ref([])
    const loading = ref(true)
    const showDetail = ref(false)
    const selectedPoem = ref({})
    const searchKeyword = ref('')
    const showFavorites = ref(false)
    const favorites = ref([])
    const showCategoryMenu = ref(false)
    const recommendations = ref([])

    // 从路由参数获取诗词ID
    const poemId = ref(parseInt(route.query.id))

    const loadPoems = async () => {
      loading.value = true
      try {
        // 从Supabase获取所有诗词
        const data = await poemApi.getPoems()
        poems.value = data
        filteredPoems.value = [...data]
        
        // 如果有诗词ID，显示详情
        if (poemId.value) {
          await loadPoemDetail()
        }
      } catch (error) {
        console.error('获取诗词数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const loadPoemDetail = async () => {
      try {
        if (!poemId.value) return

        const result = await poemApi.getDetail(poemId.value)
        if (result.ok) {
          selectedPoem.value = result.data
          showDetail.value = true
          // 加载相关推荐
          await loadRecommendations()
        }
      } catch (error) {
        console.error('加载诗词详情错误:', error)
      }
    }

    const loadRecommendations = async () => {
      try {
        if (selectedPoem.value && selectedPoem.value.author) {
          const result = await poemApi.search(selectedPoem.value.author, 1, 5)
          if (result.ok) {
            recommendations.value = result.data
              .filter(item => item.id !== selectedPoem.value.id)
              .slice(0, 3)
          }
        }
      } catch (error) {
        console.error('加载推荐诗词错误:', error)
      }
    }

    const viewDetail = (poem) => {
      selectedPoem.value = poem
      showDetail.value = true
      // 更新URL但不刷新页面
      window.history.pushState({}, '', `/poem/detail?id=${poem.id}`)
    }

    const goBack = () => {
      if (showDetail.value) {
        showDetail.value = false
        selectedPoem.value = {}
        recommendations.value = []
        // 更新URL返回列表
        window.history.pushState({}, '', '/poem/detail')
      } else if (showFavorites.value) {
        showFavorites.value = false
      } else {
        router.back()
      }
    }

    const handleSearchInput = () => {
      if (!searchKeyword.value.trim()) {
        filteredPoems.value = [...poems.value]
        return
      }
      
      const keyword = searchKeyword.value.toLowerCase().trim()
      filteredPoems.value = poems.value.filter(poem => {
        return poem.title.toLowerCase().includes(keyword) ||
               poem.author.toLowerCase().includes(keyword) ||
               poem.content.toLowerCase().includes(keyword) ||
               poem.excerpt.toLowerCase().includes(keyword)
      })
    }

    const clearSearch = () => {
      searchKeyword.value = ''
      filteredPoems.value = [...poems.value]
    }

    const toggleFavoritesView = () => {
      showFavorites.value = !showFavorites.value
      showDetail.value = false
    }

    const toggleFavorite = (poem) => {
      const poemId = getPoemId(poem)
      const index = favorites.value.findIndex(fav => getPoemId(fav) === poemId)
      
      if (index > -1) {
        // 取消收藏
        favorites.value.splice(index, 1)
        alert('已取消收藏')
      } else {
        // 添加收藏
        favorites.value.push({...poem})
        alert('收藏成功')
      }
      saveFavorites()
    }

    const isFavorite = (poem) => {
      const poemId = getPoemId(poem)
      return favorites.value.some(fav => getPoemId(fav) === poemId)
    }

    const getPoemId = (poem) => {
      return `${poem.title}-${poem.author}`
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

    const sharePoem = () => {
      if (!selectedPoem.value) return

      if (navigator.share) {
        navigator.share({
          title: `${selectedPoem.value.title} - ${selectedPoem.value.author}`,
          text: selectedPoem.value.content,
          url: window.location.href
        })
      } else {
        const shareText = `${selectedPoem.value.title}\n${selectedPoem.value.author} · ${selectedPoem.value.dynasty}\n\n${selectedPoem.value.content}\n\n—— 来自诗词应用`
        navigator.clipboard.writeText(shareText)
        alert('诗词内容已复制到剪贴板，可以分享给朋友了！')
      }
    }

    const viewRecommendation = (item) => {
      viewDetail(item)
    }

    const showPoemCategory = () => {
      showCategoryMenu.value = false
      alert('切换到古诗分类')
    }

    const showPoetCategory = () => {
      showCategoryMenu.value = false
      alert('切换到诗人分类')
    }

    onMounted(() => {
      loadPoems()
      loadFavorites()
    })

    return {
      poems,
      filteredPoems,
      loading,
      showDetail,
      selectedPoem,
      searchKeyword,
      showFavorites,
      favorites,
      showCategoryMenu,
      recommendations,
      viewDetail,
      goBack,
      handleSearchInput,
      clearSearch,
      toggleFavoritesView,
      toggleFavorite,
      isFavorite,
      sharePoem,
      viewRecommendation,
      showPoemCategory,
      showPoetCategory
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f4e9;
  display: flex;
  flex-direction: column;
  font-family: 'STKaiti', 'KaiTi', serif;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #f0e6d2;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-right {
  justify-content: flex-end;
}

.back-btn {
  font-size: 28rpx;
  color: #333;
  background-color: #e0d6c0;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-weight: bold;
  cursor: pointer;
}

.favorite-btn {
  font-size: 28rpx;
  color: #333;
  background-color: #ffd700;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-weight: bold;
  cursor: pointer;
}

/* 搜索栏样式 */
.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #f8f4e9;
  border-bottom: 2rpx solid #e0d6c0;
  flex-shrink: 0;
}

.search-input-container {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 15rpx 20rpx;
  border: 2rpx solid #e0d6c0;
}

.search-icon {
  margin-right: 10rpx;
  font-size: 28rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background-color: transparent;
  border: none;
  outline: none;
}

.search-placeholder {
  color: #999;
  font-size: 28rpx;
}

.clear-icon {
  margin-left: 10rpx;
  font-size: 28rpx;
  cursor: pointer;
}

/* 加载状态 */
.loading {
  padding: 60rpx;
  text-align: center;
  color: #999;
  font-size: 28rpx;
}

/* 收藏视图样式 */
.favorites-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.favorites-header {
  padding: 20rpx 30rpx;
  background-color: #f0e6d2;
  border-bottom: 2rpx solid #e0d6c0;
}

.favorites-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.favorites-count {
  font-size: 24rpx;
  color: #666;
}

.no-favorites {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 30rpx;
}

.no-favorites-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

/* 诗词详情样式 */
.poem-detail {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

/* 诗词头部 */
.poem-header {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 30rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.poem-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20rpx;
  line-height: 1.3;
}

.poem-meta {
  font-size: 28rpx;
  color: #7f8c8d;
}

.poem-author {
  font-weight: bold;
  color: #e74c3c;
}

.poem-dynasty {
  color: #95a5a6;
}

/* 诗词内容 */
.poem-content {
  background-color: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  text-align: center;
}

.poem-text {
  font-size: 32rpx;
  line-height: 1.8;
  color: #34495e;
  white-space: pre-wrap;
  font-family: '楷体', 'STKaiti', serif;
  margin: 0;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.favorite-btn, .share-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn {
  background-color: #ecf0f1;
  color: #7f8c8d;
}

.favorite-btn.favorited {
  background-color: #ff6b6b;
  color: white;
}

.share-btn {
  background-color: #3498db;
  color: white;
}

.favorite-btn:hover, .share-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* 章节样式 */
.annotations, .appreciation, .recommendations {
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20rpx;
  border-left: 8rpx solid #e74c3c;
  padding-left: 20rpx;
}

.annotation-text, .appreciation-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #5d6d7e;
  text-align: justify;
}

/* 推荐列表 */
.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.recommendation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 15rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recommendation-item:hover {
  background-color: #e9ecef;
  transform: translateX(10rpx);
}

.rec-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
}

.rec-author {
  font-size: 24rpx;
  color: #7f8c8d;
}

/* 古诗列表视图 */
.poem-list-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.poem-list {
  flex: 1;
  padding: 20rpx;
  overflow-y: auto;
}

.poem-card {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.poem-card:hover {
  transform: scale(0.98);
}

.poem-header {
  margin-bottom: 20rpx;
}

.poem-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.poem-meta {
  display: flex;
  align-items: center;
}

.poem-author {
  font-size: 24rpx;
  color: #666;
  margin-right: 20rpx;
}

.poem-dynasty {
  font-size: 24rpx;
  color: #888;
  background-color: #f0f0f0;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.poem-excerpt {
  font-size: 26rpx;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20rpx;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.poem-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.favorite-btn {
  font-size: 24rpx;
  color: #ff6b35;
  background-color: #fff3e0;
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  border: 1rpx solid #ffd8b8;
  cursor: pointer;
}

.detail-btn {
  font-size: 24rpx;
  color: #666;
  background-color: #f5f5f5;
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
  border: 1rpx solid #ddd;
  cursor: pointer;
}

/* 搜索结果提示样式 */
.search-result {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 30rpx;
}

.no-result-text {
  font-size: 28rpx;
  color: #999;
  text-align: center;
}

/* 分类按钮样式 */
.category-btn {
  font-size: 28rpx;
  color: #333;
  background-color: #8b7355;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-weight: bold;
  cursor: pointer;
  color: white;
}

.category-btn:hover {
  background-color: #6b5535;
}

/* 分类菜单样式 */
.category-menu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: white;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 10rpx;
  min-width: 200rpx;
}

.category-item {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  cursor: pointer;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.category-item:last-child {
  border-bottom: none;
}

.category-item:hover {
  background-color: #f8f4e9;
}

.category-icon {
  font-size: 24rpx;
  margin-right: 15rpx;
}

.category-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}
</style>