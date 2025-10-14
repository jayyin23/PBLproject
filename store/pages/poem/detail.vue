<template>
  <view class="page">
    <!-- 标题区域 -->
    <view class="header">
      <text class="title">古诗词赏析</text>
      <view class="divider" />
    </view>

    <!-- 诗词展示区域 -->
    <view class="card poem-card">
      <view class="poem">
        <text class="poem-title font-cursive">静夜思</text>
        <text class="poem-line font-cursive">床前明月光</text>
        <text class="poem-line font-cursive">疑是地上霜</text>
        <text class="poem-line font-cursive">举头望明月</text>
        <text class="poem-line font-cursive">低头思故乡</text>
      </view>
    </view>

    <!-- 配图展示区域 -->
    <view class="card image-card">
      <image
        class="illustration"
        src="https://ai-public.mastergo.com/ai/img_res/73f191facabb5d5421e0aa483edfb434.jpg"
        mode="aspectFill"
      />
    </view>

    <!-- 注释与赏析区域 -->
    <view class="card">
      <view class="analysis">
        <view class="analysis-item">
          <text class="bullet">•</text>
          <text class="analysis-text">
            这首诗描写了秋日夜晚诗人望月思乡的情景。“疑是地上霜”的错觉描写，表现深夜的清冷与孤独。
          </text>
        </view>
        <view class="analysis-item">
          <text class="bullet">•</text>
          <text class="analysis-text">
            “举头望明月，低头思故乡”通过动作对比，深刻表达游子思乡之情，成为千古传诵的名句。
          </text>
        </view>
      </view>
    </view>

    <!-- 作者信息区域 -->
    <view class="card author-card">
      <view class="author">
        <view class="avatar">
          <text class="feather">✦</text>
        </view>
        <view class="author-info">
          <text class="author-name">李白</text>
          <text class="author-meta">唐代 · 701年-762年</text>
          <text class="author-desc">字太白，号青莲居士，唐代浪漫主义诗人，被誉为“诗仙”。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  // 静态展示页，无需逻辑
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap');

.page {
  min-height: 100vh;
  padding: 48rpx 32rpx 64rpx;
  background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #FFFBEB 100%);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.header {
  text-align: center;
}

.title {
  font-size: 44rpx;
  font-weight: 600;
  color: #8B5E00;
}

.divider {
  width: 120rpx;
  height: 6rpx;
  border-radius: 100rpx;
  background: linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%);
  margin: 16rpx auto 0;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 8rpx 22rpx rgba(139, 94, 0, 0.08);
  border: 2rpx solid #FDE68A;
}

.poem {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.font-cursive {
  font-family: 'Ma Shan Zheng', cursive;
}

.poem-title {
  font-size: 36rpx;
  color: #7C4A00;
  margin-bottom: 8rpx;
}

.poem-line {
  font-size: 30rpx;
  color: #9A6B00;
}

.image-card {
  padding: 16rpx;
}

.illustration {
  width: 100%;
  height: 360rpx;
  border-radius: 16rpx;
}

.analysis {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.bullet {
  color: #B45309;
  font-size: 32rpx;
  line-height: 1.2;
}

.analysis-text {
  color: #8B5E00;
  font-size: 26rpx;
  line-height: 1.6;
}

.author {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 100rpx;
  background: #FEF3C7;
  border: 2rpx solid #FDE68A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feather {
  color: #B45309;
  font-size: 36rpx;
}

.author-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.author-name {
  font-size: 32rpx;
  color: #7C4A00;
  font-weight: 600;
}

.author-meta {
  font-size: 22rpx;
  color: #B45309;
}

.author-desc {
  font-size: 22rpx;
  color: #9A6B00;
}
</style>