<template>
  <view class="page">
    <view class="hero">
      <text class="brand">诗词主页</text>
      <text class="subtitle">品读经典，感受汉字的韵律之美</text>
    </view>

    <view class="grid">
      <view class="card" @click="go('/pages/poem/detail')">
        <view class="card-header">
          <text class="card-title">今日鉴赏</text>
          <text class="card-tag">精选</text>
        </view>
        <text class="card-desc">赏析《静夜思》：思乡情深，月色如霜。</text>
      </view>

      <view class="card" @click="go('/pages/search/index')">
        <view class="card-header">
          <text class="card-title">诗词搜索</text>
          <text class="card-tag">发现</text>
        </view>
        <text class="card-desc">按关键词查找诗词、作者与朝代。</text>
      </view>

      <view class="card" @click="go('/pages/favorites/index')">
        <view class="card-header">
          <text class="card-title">我的收藏</text>
          <text class="card-tag">常看</text>
        </view>
        <text class="card-desc">快速查看你喜欢的诗词作品。</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    go(url) {
      if (typeof uni.switchTab === 'function' && ['/pages/index/index', '/pages/search/index', '/pages/favorites/index', '/pages/poem/homepage'].includes(url)) {
        uni.switchTab({ url })
      } else {
        uni.navigateTo({ url })
      }
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx 64rpx;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%);
  box-sizing: border-box;
}

.hero {
  text-align: center;
  margin-bottom: 36rpx;
}

.brand {
  font-size: 44rpx;
  font-weight: 600;
  color: #8B5E00;
}

.subtitle {
  margin-top: 10rpx;
  font-size: 26rpx;
  color: #B45309;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 22rpx rgba(139, 94, 0, 0.08);
  border: 2rpx solid #FDE68A;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.card-title {
  font-size: 30rpx;
  color: #7C4A00;
  font-weight: 600;
}

.card-tag {
  font-size: 22rpx;
  color: #B45309;
  background: #FEF3C7;
  padding: 6rpx 14rpx;
  border-radius: 100rpx;
}

.card-desc {
  font-size: 26rpx;
  color: #9A6B00;
}
</style>