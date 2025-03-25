import { ValidateEnv } from '@julr/vite-plugin-validate-env'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    ValidateEnv(),
    TanStackRouterVite({ target: 'react', autoCodeSplitting: true, generatedRouteTree: './src/shared/routeTree.gen.ts' }),
    tailwindcss(),
    react(),
    tsconfigPaths(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  }
})
