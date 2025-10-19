<template>
  <div class="container">
    <!-- 搜索框 -->
    <div class="search-header">
      <div class="search-input-container">
        <span class="search-icon">🔍</span>
        <input
          class="search-input"
          v-model="searchKeyword"
          placeholder="搜索诗词标题、作者或内容"
          @input="handleSearchInput"
          @keyup.enter="performSearch"
        />
        <span v-if="searchKeyword" class="clear-icon" @click="clearSearch">✕</span>
      </div>
      <span class="cancel-btn" @click="goBack">取消</span>
    </div>

    <!-- 搜索历史 -->
    <div class="search-history" v-if="!searchKeyword && searchHistory.length > 0">
      <div class="section-header">
        <span class="section-title">搜索历史</span>
        <span class="clear-history" @click="clearHistory">清空</span>
      </div>
      <div class="history-list">
        <div 
          class="history-item" 
          v-for="(item, index) in searchHistory" 
          :key="index"
          @click="searchFromHistory(item)"
        >
          <span class="history-text">{{ item }}</span>
          <span class="delete-icon" @click.stop="deleteHistoryItem(index)">×</span>
        </div>
      </div>
    </div>

    <!-- 热门搜索 -->
    <div class="hot-search" v-if="!searchKeyword">
      <div class="section-header">
        <span class="section-title">热门搜索</span>
      </div>
      <div class="hot-list">
        <div 
          class="hot-item" 
          v-for="(item, index) in hotSearches" 
          :key="index"
          @click="searchFromHot(item)"
        >
          <span class="hot-rank" :class="{ top3: index < 3 }">{{ index + 1 }}</span>
          <span class="hot-text">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- 实时搜索结果 -->
    <div class="search-results" v-if="searchKeyword">
      <div class="results-header">
        <span class="results-title">搜索结果 ({{ searchResults.length }})</span>
      </div>
      
      <div class="results-list">
        <div 
          class="result-item" 
          v-for="(poem, index) in searchResults" 
          :key="index"
          @click="viewDetail(poem)"
        >
          <div class="result-content">
            <span class="result-title">{{ poem.title }}</span>
            <span class="result-author">{{ poem.author }} · {{ poem.dynasty }}</span>
            <span class="result-excerpt">{{ getHighlightedExcerpt(poem) }}</span>
          </div>
          <div class="result-actions">
            <span 
              class="favorite-btn" 
              :class="{ favorited: isFavorite(poem) }"
              @click.stop="toggleFavorite(poem)"
            >
              {{ isFavorite(poem) ? '❤️' : '🤍' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 无结果提示 -->
      <div class="no-results" v-if="searchResults.length === 0 && searchKeyword">
        <span class="no-results-icon">🔍</span>
        <span class="no-results-text">未找到相关诗词</span>
        <span class="no-results-tip">尝试使用其他关键词搜索</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const searchKeyword = ref('')
    const searchResults = ref([])
    const searchHistory = ref([])
    const allPoems = ref([])
    const favorites = ref([])
    
    const hotSearches = [
      '李白', '杜甫', '苏轼', '静夜思', '水调歌头',
      '春晓', '登鹳雀楼', '相思', '将进酒', '江城子'
    ]

    const loadPoems = async () => {
      // 模拟数据加载
      allPoems.value = [
        {
          id: 1,
          title: '静夜思',
          author: '李白',
          dynasty: '唐',
          excerpt: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
          content: '床前明月光，疑是地上霜。\n举头望明月，低头思故乡。'
        },
        {
          id: 2,
          title: '水调歌头·明月几时有',
          author: '苏轼',
          dynasty: '宋',
          excerpt: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。',
          content: '明月几时有？把酒问青天。\n不知天上宫阙，今夕是何年。'
        },
        {
          id: 3,
          title: '春晓',
          author: '孟浩然',
          dynasty: '唐',
          excerpt: '春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。',
          content: '春眠不觉晓，处处闻啼鸟。\n夜来风雨声，花落知多少。'
        }
      ]
    }
    
    const handleSearchInput = () => {
      if (searchKeyword.value.trim()) {
        performSearch()
      } else {
        searchResults.value = []
      }
    }
    
    const performSearch = () => {
      const keyword = searchKeyword.value.trim().toLowerCase()
      if (!keyword) {
        searchResults.value = []
        return
      }
      
      searchResults.value = allPoems.value.filter(poem => {
        return poem.title.toLowerCase().includes(keyword) ||
               poem.author.toLowerCase().includes(keyword) ||
               poem.content.toLowerCase().includes(keyword) ||
               poem.excerpt.toLowerCase().includes(keyword)
      })
      
      // 保存搜索历史
      saveToSearchHistory(keyword)
    }
    
    const clearSearch = () => {
      searchKeyword.value = ''
      searchResults.value = []
    }
    
    const searchFromHistory = (keyword) => {
      searchKeyword.value = keyword
      performSearch()
    }
    
    const searchFromHot = (keyword) => {
      searchKeyword.value = keyword
      performSearch()
    }
    
    const getHighlightedExcerpt = (poem) => {
      const keyword = searchKeyword.value.toLowerCase()
      const content = poem.excerpt.toLowerCase()
      const index = content.indexOf(keyword)
      
      if (index === -1) return poem.excerpt
      
      const start = Math.max(0, index - 10)
      const end = Math.min(content.length, index + keyword.length + 20)
      let excerpt = poem.excerpt.substring(start, end)
      
      if (start > 0) excerpt = '...' + excerpt
      if (end < content.length) excerpt = excerpt + '...'
      
      return excerpt
    }
    
    const saveToSearchHistory = (keyword) => {
      if (!keyword) return
      
      // 移除重复项
      searchHistory.value = searchHistory.value.filter(item => item !== keyword)
      // 添加到开头
      searchHistory.value.unshift(keyword)
      // 限制历史记录数量
      if (searchHistory.value.length > 10) {
        searchHistory.value = searchHistory.value.slice(0, 10)
      }
      
      saveSearchHistory()
    }
    
    const deleteHistoryItem = (index) => {
      searchHistory.value.splice(index, 1)
      saveSearchHistory()
    }
    
    const clearHistory = () => {
      if (confirm('确定要清空所有搜索历史吗？')) {
        searchHistory.value = []
        saveSearchHistory()
      }
    }
    
    const saveSearchHistory = () => {
      try {
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
      } catch (e) {
        console.error('保存搜索历史失败:', e)
      }
    }
    
    const loadSearchHistory = () => {
      try {
        const saved = localStorage.getItem('searchHistory')
        if (saved) {
          searchHistory.value = JSON.parse(saved)
        }
      } catch (e) {
        console.error('加载搜索历史失败:', e)
      }
    }
    
    const viewDetail = (poem) => {
      router.push(`/poem/detail?id=${poem.id}`)
    }
    
    const toggleFavorite = (poem) => {
      const index = favorites.value.findIndex(fav => fav.id === poem.id)
      if (index > -1) {
        favorites.value.splice(index, 1)
        alert('取消收藏')
      } else {
        favorites.value.push(poem)
        alert('收藏成功')
      }
      saveFavorites()
    }
    
    const isFavorite = (poem) => {
      return favorites.value.some(fav => fav.id === poem.id)
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
    
    const goBack = () => {
      router.back()
    }

    onMounted(async () => {
      await loadPoems()
      loadSearchHistory()
      loadFavorites()
    })

    return {
      searchKeyword,
      searchResults,
      searchHistory,
      hotSearches,
      handleSearchInput,
      performSearch,
      clearSearch,
      searchFromHistory,
      searchFromHot,
      getHighlightedExcerpt,
      deleteHistoryItem,
      clearHistory,
      viewDetail,
      toggleFavorite,
      isFavorite,
      goBack
    }
  }
}
</script>

<style>
.container {
  height: 100vh;
  background-color: #f8f4e9;
  display: flex;
  flex-direction: column;
}

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: white;
  border-bottom: 2rpx solid #e8e1d1;
}

.search-input-container {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f2eb;
  border-radius: 20rpx;
  padding: 15rpx 20rpx;
  margin-right: 20rpx;
}

.search-icon {
  margin-right: 10rpx;
  font-size: 28rpx;
  color: #999;
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
  color: #999;
  cursor: pointer;
}

.cancel-btn {
  font-size: 28rpx;
  color: #666;
  cursor: pointer;
}

/* 搜索历史和热门搜索 */
.search-history, .hot-search {
  padding: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.clear-history {
  font-size: 24rpx;
  color: #999;
  cursor: pointer;
}

/* 历史列表 */
.history-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.history-item {
  display: flex;
  align-items: center;
  background-color: white;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.history-text {
  font-size: 24rpx;
  color: #666;
  margin-right: 10rpx;
}

.delete-icon {
  font-size: 20rpx;
  color: #999;
  cursor: pointer;
}

/* 热门搜索列表 */
.hot-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.hot-rank {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: #999;
  margin-right: 20rpx;
}

.hot-rank.top3 {
  background-color: #ff6b6b;
  color: white;
}

.hot-text {
  font-size: 26rpx;
  color: #333;
}

/* 搜索结果 */
.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.results-header {
  padding: 20rpx 30rpx;
  background-color: white;
  border-bottom: 2rpx solid #e8e1d1;
}

.results-title {
  font-size: 26rpx;
  color: #666;
}

.results-list {
  flex: 1;
}

.result-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx;
  background-color: white;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-content {
  flex: 1;
}

.result-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.result-author {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.result-excerpt {
  font-size: 24rpx;
  color: #888;
  line-height: 1.4;
}

.result-actions {
  margin-left: 20rpx;
}

.favorite-btn {
  font-size: 32rpx;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.favorite-btn:active {
  transform: scale(1.2);
}

.favorite-btn.favorited {
  color: #ff4757;
}

/* 无结果提示 */
.no-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60rpx;
}

.no-results-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  color: #ccc;
}

.no-results-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.no-results-tip {
  font-size: 24rpx;
  color: #999;
}
</style>