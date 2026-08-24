import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages 專案頁面網址為 https://<user>.github.io/stock-journal/，
// 若日後 repo 改名，這裡的 base 也要跟著改（連帶下面 manifest 的 scope / start_url）。
const BASE_PATH = '/stock-journal/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '存股日記 - 股票存股目標與買入紀錄追蹤工具',
        short_name: '存股日記',
        description:
          '免費且注重隱私的線上存股記錄工具。支援 ETF、台股存股目標設定與買入進度追蹤，資料完全儲存於本機瀏覽器。',
        lang: 'zh-TW',
        theme_color: '#0088b0',
        background_color: '#f3f2f2',
        display: 'standalone',
        scope: BASE_PATH,
        start_url: BASE_PATH,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  base: BASE_PATH,
})
