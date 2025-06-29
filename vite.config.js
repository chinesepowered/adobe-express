import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5241,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})