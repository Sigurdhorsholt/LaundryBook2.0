import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Proxy API calls to .NET backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5106',
        changeOrigin: true,
      },
    },
  },
  // History API fallback — serve index.html for all routes
  preview: {
    port: 4173,
  },
})
