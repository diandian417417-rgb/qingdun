import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// 前端工程配置（Vue 3 + Vite）
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 使用 @ 指向 src 目录，方便引用
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 前后端联调时：取消下面注释，把 /api 转发到后端 FastAPI 服务（端口以实际为准）
    proxy: {
      // '/api': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
