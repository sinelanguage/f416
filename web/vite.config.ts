import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0, // Don't inline any assets as base64
    // Keep publicDir enabled for dev, but don't deploy public/ folder to production
    // In production, upload public/ contents to your CDN separately
  },
})
