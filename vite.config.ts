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
  test: {
    // With this set to false, methods like 'it()' and 'describe()' need to be
    // explicitly imported
    globals: false,
    // The headless browser backend to use during testing
    // FIXME: pnpm has issues finding this, that is why we use yarn.
    environment: 'happy-dom',
  }
})
