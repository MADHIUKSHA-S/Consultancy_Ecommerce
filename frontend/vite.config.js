import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'public/.redirects', // NOTE: use .redirects, not _redirects
          dest: '.' // copy to dist/
        }
      ]
    })
  ],
  base: '/',
  server: { port: 5173 }
})
