import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In production this is Vercel's own /api routing; locally, `npm run
    // dev:api` runs the same Express app as a plain Node server and this
    // forwards requests to it so `npm run dev` alone can't reach /api.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  preview: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
