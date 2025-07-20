import { defineConfig } from 'vite'

// Replace 'YOUR_REPO_NAME' with your actual repository name
export default defineConfig({
  base: '/Eng-Quiz/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 5174
  }
})
