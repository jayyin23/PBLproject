<template>
  <view class="page">
    <view class="hero">
      <text class="brand">诗韵集</text>
      <text class="subtitle">古诗词 · 搜索 · 收藏</text>
    </view>

    <view class="actions">
      <button class="btn primary" @click="go('/pages/search/index')">开始搜索</button>
      <button class="btn" @click="go('/pages/poem/homepage')">诗词主页</button>
      <button class="btn" @click="go('/pages/favorites/index')">我的收藏</button>
    </view>

    <view class="tips">
      <text>提示：可通过下方按钮进入相应功能页，或使用底部 Tab 切换。</text>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    go(url) {
      // 若是 tabBar 页面，优先 switchTab；否则使用 navigateTo
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
  background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #FFFBEB 100%);
  box-sizing: border-box;
}

.hero {
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 40rpx;
}

.brand {
  font-size: 48rpx;
  font-weight: 600;
  color: #8B5E00;
}

.subtitle {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #B45309;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn {
  height: 88rpx;
  border-radius: 44rpx;
  background: #fff;
  color: #8B5E00;
  border: 2rpx solid #FDE68A;
  font-size: 28rpx;
  box-shadow: 0 6rpx 18rpx rgba(139, 94, 0, 0.08);
}

.primary {
  background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
  color: #3F1F00;
  border: none;
}

.tips {
  margin-top: 32rpx;
  text-align: center;
  font-size: 24rpx;
  color: #9A6B00;
}
</style>