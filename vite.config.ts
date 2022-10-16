import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Static assets that will be copied to the root of ./dist
  // index.html is explicitly supposed to be at the root and not
  // in ./public:
  //  https://vitejs.dev/guide/#index-html-and-project-root
  publicDir: 'public',
  // Mount all resources under the `/app` endpoint
  base: "/app/",
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
