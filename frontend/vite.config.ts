import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: they change far less often than app code, so they stay cached across deploys
        manualChunks(id) {
          const pkg = id.replaceAll('\\', '/').match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/)?.[1]
          if (!pkg) return undefined
          if (['react', 'react-dom', 'react-router', 'react-router-dom', 'scheduler'].includes(pkg)) return 'vendor-react'
          if (pkg.startsWith('@reduxjs/') || ['react-redux', 'redux', 'immer', 'reselect'].includes(pkg)) return 'vendor-redux'
          if (pkg === 'i18next' || pkg === 'react-i18next') return 'vendor-i18n'
          if (pkg.startsWith('@sentry')) return 'vendor-sentry'
          if (pkg === 'bootstrap' || pkg.startsWith('@popperjs/')) return 'vendor-bootstrap'
          if (pkg === 'firebase' || pkg.startsWith('@firebase/')) return 'vendor-firebase'
          return undefined
        },
      },
    },
  },
  // History API fallback — serve index.html for all routes
  preview: {
    port: 4173,
  },
})
