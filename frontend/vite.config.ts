import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/v1': 'http://localhost:3001',
    },
  },
})
