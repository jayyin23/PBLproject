<template>
  <view class="page">
    <view class="header">
      <text class="title">诗词搜索</text>
      <text class="sub">输入关键词，探索古诗词的世界</text>
    </view>

    <view class="search">
      <search-bar v-model="keyword" @submit="onSearch" placeholder="搜索诗词 / 作者 / 朝代" />
    </view>

    <view v-if="list.length === 0" class="empty">
      <view class="empty-card">
        <text class="empty-title">还没有结果</text>
        <text class="empty-desc">试试“李白”“明月”等关键词吧</text>
      </view>
    </view>

    <view v-else class="list">
      <view class="list-card">
        <poem-item v-for="item in list" :key="item.id" :poem="item" @click="goDetail(item.id)" />
      </view>
    </view>
  </view>
</template>

<script>
import { get } from '../../services/request'
import PoemItem from '../../components/PoemItem.vue'
import SearchBar from '../../components/SearchBar.vue'

export default {
  components: { PoemItem, SearchBar },
  data() {
    return {
      keyword: '',
      list: []
    }
  },
  methods: {
    async onSearch(val) {
      this.keyword = val || this.keyword
      if (!this.keyword) return
      const res = await get('/api/poems/search', { keyword: this.keyword, page: 1, pageSize: 20 })
      if (res.ok) {
        this.list = (res.data && res.data.list) ? res.data.list : []
      }
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/poem/detail?id=${id}` })
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
  padding: 32rpx 24rpx 48rpx;
  background: linear-gradient(135deg, #FFF7ED 0%, #FFFBEB 100%);
  box-sizing: border-box;
}

.header {
  margin-bottom: 20rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #7C4A00;
}

.sub {
  margin-top: 8rpx;
  font-size: 24rpx;
  color: #B45309;
}

.search {
  background: #fff;
  border-radius: 20rpx;
  padding: 16rpx;
  border: 2rpx solid #FDE68A;
  box-shadow: 0 6rpx 18rpx rgba(139, 94, 0, 0.08);
  margin-bottom: 24rpx;
}

.list {
  display: flex;
  flex-direction: column;
}

.list-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 16rpx;
  border: 2rpx solid #FDE68A;
  box-shadow: 0 8rpx 22rpx rgba(139, 94, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.empty {
  padding: 24rpx 0;
  color: #9A6B00;
  text-align: center;
}

.empty-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  border: 2rpx solid #FDE68A;
  box-shadow: 0 6rpx 18rpx rgba(139, 94, 0, 0.08);
}

.empty-title {
  font-size: 30rpx;
  color: #7C4A00;
  font-weight: 600;
}

.empty-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #B45309;
}
</style>