import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:5187',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.VITE_DEV_API_TARGET || 'http://localhost:5187',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    setupFiles: './src/test/setup.js',
    restoreMocks: true,
  },
})
