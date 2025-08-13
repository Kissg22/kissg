import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // EZ A SOR A LÉNYEG: megadjuk a repository nevét, mint alap útvonal.
  base: '/kissg/', 
})
