import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative paths, so the build works under https://<user>.github.io/<repo>/ as well as locally.
  base: './',
  plugins: [react()],
})
