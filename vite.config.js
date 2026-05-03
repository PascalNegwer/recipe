import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
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
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Rezepte',
        short_name: 'Rezepte',
        description: 'Unsere Rezept-App',
        theme_color: '#4a7fb5',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }), 
    copyIndexTo404()
  ],
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