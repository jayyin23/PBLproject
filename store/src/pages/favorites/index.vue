<template>
  <div class="container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的收藏</h1>
      <span class="favorites-count">共 {{ favorites.length }} 首</span>
    </div>

    <!-- 收藏列表 -->
    <div class="favorites-list" v-if="favorites.length > 0">
      <div 
        class="favorite-item" 
        v-for="(poem, index) in favorites" 
        :key="poem.id"
      >
        <div class="poem-info" @click="viewDetail(poem)">
          <span class="poem-title">{{ poem.title }}</span>
          <span class="poem-meta">{{ poem.author }} · {{ poem.dynasty }}</span>
          <span class="poem-excerpt">{{ getExcerpt(poem) }}</span>
        </div>
        <div class="action-buttons">
          <button class="share-btn" @click="sharePoem(poem)" title="分享">
            📤
          </button>
          <button class="remove-btn" @click="removeFavorite(index)" title="移除">
            ❌
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">📚</div>
      <h3 class="empty-title">暂无收藏</h3>
      <p class="empty-text">去发现一些精彩的诗词吧</p>
      <button class="explore-btn" @click="goToHome">开始探索</button>
    </div>

    <!-- 批量操作 -->
    <div class="batch-actions" v-if="favorites.length > 0">
      <button class="clear-all-btn" @click="clearAllFavorites">清空所有收藏</button>
      <button class="export-btn" @click="exportFavorites">导出收藏</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const favorites = ref([])

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

    const getExcerpt = (poem) => {
      if (poem.excerpt) {
        return poem.excerpt.length > 30 ? poem.excerpt.substring(0, 30) + '...' : poem.excerpt
      }
      if (poem.content) {
        const content = poem.content.replace(/\n/g, ' ')
        return content.length > 30 ? content.substring(0, 30) + '...' : content
      }
      return ''
    }

    const viewDetail = (poem) => {
      router.push(`/poem/detail?id=${poem.id}`)
    }

    const removeFavorite = (index) => {
      if (confirm('确定要移除这首诗词吗？')) {
        favorites.value.splice(index, 1)
        saveFavorites()
      }
    }

    const sharePoem = (poem) => {
      const shareText = `${poem.title}\n${poem.author} · ${poem.dynasty}\n\n${poem.content || poem.excerpt}\n\n—— 来自诗词应用`
      
      if (navigator.share) {
        navigator.share({
          title: `${poem.title} - ${poem.author}`,
          text: shareText,
          url: window.location.href
        })
      } else {
        navigator.clipboard.writeText(shareText)
        alert('诗词内容已复制到剪贴板，可以分享给朋友了！')
      }
    }

    const clearAllFavorites = () => {
      if (confirm('确定要清空所有收藏吗？此操作不可撤销。')) {
        favorites.value = []
        saveFavorites()
      }
    }

    const exportFavorites = () => {
      const exportData = {
        title: '我的诗词收藏',
        count: favorites.value.length,
        poems: favorites.value,
        exportTime: new Date().toLocaleString('zh-CN')
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `诗词收藏_${new Date().getTime()}.json`
      link.click()
      URL.revokeObjectURL(url)
      
      alert('收藏已导出为JSON文件')
    }

    const goToHome = () => {
      router.push('/')
    }

    const saveFavorites = () => {
      try {
        localStorage.setItem('favoritePoems', JSON.stringify(favorites.value))
      } catch (e) {
        console.error('保存收藏失败:', e)
      }
    }

    onMounted(() => {
      loadFavorites()
    })

    return {
      favorites,
      getExcerpt,
      viewDetail,
      removeFavorite,
      sharePoem,
      clearAllFavorites,
      exportFavorites,
      goToHome
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  background-color: #f8f4e9;
  padding: 30rpx;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}

.favorites-count {
  font-size: 24rpx;
  color: #7f8c8d;
  background-color: #ecf0f1;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

/* 收藏列表 */
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.favorite-item {
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.favorite-item:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.poem-info {
  flex: 1;
  cursor: pointer;
}

.poem-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10rpx;
}

.poem-meta {
  display: block;
  font-size: 24rpx;
  color: #e74c3c;
  margin-bottom: 10rpx;
}

.poem-excerpt {
  display: block;
  font-size: 24rpx;
  color: #7f8c8d;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 15rpx;
}

.share-btn, .remove-btn {
  width: 60rpx;
  height: 60rpx;
  border: none;
  border-radius: 50%;
  font-size: 24rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn {
  background-color: #3498db;
  color: white;
}

.remove-btn {
  background-color: #e74c3c;
  color: white;
}

.share-btn:hover, .remove-btn:hover {
  transform: scale(1.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 30rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-title {
  font-size: 32rpx;
  color: #2c3e50;
  margin-bottom: 15rpx;
}

.empty-text {
  font-size: 24rpx;
  color: #7f8c8d;
  margin-bottom: 30rpx;
}

.explore-btn {
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 25rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.explore-btn:hover {
  background-color: #2980b9;
  transform: translateY(-2rpx);
}

/* 批量操作 */
.batch-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
  padding: 20rpx;
  background-color: white;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.clear-all-btn, .export-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 15rpx;
  font-size: 28rpx;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn {
  background-color: #e74c3c;
  color: white;
}

.export-btn {
  background-color: #27ae60;
  color: white;
}

.clear-all-btn:hover, .export-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}
</style>