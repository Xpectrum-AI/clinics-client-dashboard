import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // The trigger handler blocks until the Dify workflow responds (can take
      // several seconds, more while the CALL node retries). Give the proxy a
      // generous timeout so it doesn't return a misleading 502 mid-run.
      "/api": {
        target: "http://localhost:3100",
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
      },
    },
  },
})
