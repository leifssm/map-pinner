import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8000/',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  }
})
