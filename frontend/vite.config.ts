import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    allowedHosts: [
      'vps-e5e8d3b4.vps.ovh.net',
      // You can also allow all hosts for dev, but less secure:
      // '.'
    ],
    host: true, // allows running dev server on network interfaces
    port: 5173, // optional, set your dev server port
  },
})
