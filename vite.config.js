import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'baliq-savdosi-uz.vercel.app',
      'localhost',
    ]
  },
  preview: {
    port: 4173,
  },
})
