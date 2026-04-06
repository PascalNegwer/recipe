import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { promises as fs } from 'fs'
import { resolve } from 'path'

function copyIndexTo404() {
  return {
    name: 'copy-index-to-404',
    closeBundle: async () => {
      const outDir = resolve(process.cwd(), 'dist')
      await fs.copyFile(
        resolve(outDir, 'index.html'),
        resolve(outDir, '404.html')
      )
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), copyIndexTo404()],
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
  }
})