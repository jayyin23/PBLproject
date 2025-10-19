<template>
  <view class="item" @click="$emit('click')">
    <text class="title">{{ poem.title }}</text>
    <text class="meta">{{ poem.author }} · {{ poem.dynasty }}</text>
    <text class="excerpt">{{ poem.excerpt }}</text>
  </view>
</template>

<script>
export default {
  props: {
    poem: {
      type: Object,
      default: () => ({ title: '', author: '', dynasty: '', excerpt: '' })
    }
  }
}
</script>

<style scoped lang="scss">
.item { padding: 20rpx; border: 1px solid #eee; border-radius: 12rpx; }
.title { font-weight: 600; }
.meta { color: #666; margin-top: 8rpx; }
.excerpt { color: #333; margin-top: 12rpx; }
</style>