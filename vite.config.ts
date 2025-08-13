import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages projekt repo: /kissg/
export default defineConfig({
  plugins: [react()],
  base: '/kissg/', 
})
