import { createRouter, createWebHashHistory } from 'vue-router'

// 导入页面组件
const Index = () => import('../pages/index/index.vue')
const Search = () => import('../pages/search/index.vue')
const PoemDetail = () => import('../pages/poem/detail.vue')
const Favorites = () => import('../pages/favorites/index.vue')

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/poem/detail',
    name: 'PoemDetail',
    component: PoemDetail
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: Favorites
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router