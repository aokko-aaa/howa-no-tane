import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// どの版が読み込まれているか画面で分かるように、組み立てた時刻を焼き込む。
// キャッシュで古いままなのか、直っていないのかを、見て切り分けられる。
const BUILT_AT = new Date()
  .toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', dateStyle: 'short', timeStyle: 'short' })
  .replace(/\//g, '-')

export default defineConfig({
  define: { __BUILT_AT__: JSON.stringify(BUILT_AT) },
  // GitHub Pages のサブディレクトリ配信でも、独自ドメインでも動くように相対パスで出す
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
