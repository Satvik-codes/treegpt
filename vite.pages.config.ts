import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Static (Mode A) Cloudflare Pages build.
// This intentionally avoids TanStack Start's SSR build pipeline.
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    outDir: 'dist/client',
    emptyOutDir: true,
  },
})
