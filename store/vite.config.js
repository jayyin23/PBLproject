import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// 修复 uni-app 配置
export default defineConfig({
  plugins: [
    uni({
      vueOptions: {
        reactivityTransform: true
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    proxy: {
      '/api/proxy': {
        target: 'https://pblpro.app.n8n.cloud',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url)
            // 从请求头中获取目标URL
            const targetUrl = req.headers['x-target-url']
            console.log('目标URL:', targetUrl)
            
            if (targetUrl) {
              try {
                const url = new URL(targetUrl)
                proxyReq.path = url.pathname
                console.log('设置代理路径:', proxyReq.path)
                proxyReq.removeHeader('X-Target-URL')
              } catch (error) {
                console.error('URL解析错误:', error)
              }
            }
          })
          
          proxy.on('error', (err, req, res) => {
            console.error('代理错误:', err)
            res.writeHead(500, { 'Content-Type': 'text/plain' })
            res.end('代理服务器错误')
          })
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@dcloudio/uni-mp-vue']
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true
      }
    }
  }
})