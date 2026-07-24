import react from '@vitejs/plugin-react'
import autoprefixer from 'autoprefixer'
import fs from 'fs'
import path from 'path'
import tailwindcss from 'tailwindcss'
import { defineConfig } from 'vite'
import sass from 'vite-plugin-sass'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'

const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/app/styles')
    }
  },
  optimizeDeps: {
    exclude: ['@radix-ui/react-radio-group', 'dnd-kit', 'mantine']
  },
  server: {
    port: 3000,
    host: '127.0.0.1',
    allowedHosts: ['deeptasker.test', 'deeptasker.net']
  },
  plugins: [react(), svgr(), tsconfigPaths()],
  define: {
    __IS_DEV__: process.env.NODE_ENV !== 'production',
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __BUILD__: JSON.stringify(process.env.BUILD || 'dev')
  },
  css: {
    modules: {},
    preprocessorOptions: {
      scss: {
        implementation: sass,
        sassOptions: {
          includePaths: ['node_modules']
        },
        api: 'modern-compiler',
        silenceDeprecations: ['color-functions', 'global-builtin', 'import']
      },
      postcss: {
        plugins: [tailwindcss, autoprefixer]
      }
    }
  }
})
