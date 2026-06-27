import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  envPrefix: ["VITE_", "API_BASE_URL", "PUBLIC_SHORT_URL_BASE"],
  plugins: [
    react(),
    tailwindcss()
  ],
})
