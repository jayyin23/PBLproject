<template>
  <view class="bar">
    <input class="input" type="text" :placeholder="placeholder" v-model="model" confirm-type="search" @confirm="submit" />
    <button size="mini" @click="submit">搜索</button>
  </view>
</template>

<script>
export default {
  props: {
    value: { type: String, default: '' },
    placeholder: { type: String, default: '搜索' }
  },
  data() {
    return { model: this.value }
  },
  watch: {
    value(v) { this.model = v }
  },
  methods: {
    submit() {
      this.$emit('input', this.model)
      this.$emit('submit', this.model)
    }
  }
}
</script>

<style scoped lang="scss">
.bar { display: flex; gap: 12rpx; align-items: center; }
.input { flex: 1; border: 1px solid #ddd; padding: 12rpx; border-radius: 8rpx; }
</style>