import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production'
    ? process.env.GITHUB_PAGES_BASE || '/recipe/'
    : '/',
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
})