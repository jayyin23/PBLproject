<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      currentPoem: null
    }
  },
  mounted() {
    console.log('App mounted')
  }
}
</script>

<style>
/* 全局样式 */
body {
  font-family: 'STKaiti', 'KaiTi', 'Microsoft YaHei', sans-serif;
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
}

/* 统一按钮样式 */
button {
  border-radius: 6px;
}

/* 统一卡片阴影 */
.card-shadow {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 统一动画效果 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>