import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from manga-tracker-cli's /admin path (one Cloud Run service,
  // not its own) — asset URLs need this prefix to resolve correctly.
  base: '/admin/',
  plugins: [react()],
})
