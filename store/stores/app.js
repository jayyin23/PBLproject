import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const token = ref('');
  const userName = ref('');
  const loading = ref(false);

  function setToken(t) {
    token.value = t;
    try {
      uni.setStorage({ key: 'app:token', data: t });
    } catch (_) {}
  }

  function loadToken() {
    try {
      const res = uni.getStorageSync('app:token');
      if (typeof res === 'string') token.value = res;
    } catch (_) {}
  }

  function setLoading(v) {
    loading.value = v;
  }

  return {
    token,
    userName,
    loading,
    setToken,
    loadToken,
    setLoading,
  };
});