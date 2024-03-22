import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 4400,
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#007AFF',
          'screen-xxxl': '1900px',
          'line-height-base': '1.4',
          'height-base': '36px',
          'border-radius-base': '4px',
        },
        javascriptEnabled: true,
      },
    },
  },
})
