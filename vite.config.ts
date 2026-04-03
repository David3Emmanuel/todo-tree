import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    VitePWA({
      manifest: {
        name: 'TodoTree',
        short_name: 'TodoTree',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#000000',
        background_color: '#ffffff',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
        categories: ['productivity'],
      },
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico,webp,woff,woff2,ttf,eot}',
        ],
        runtimeCaching: [
          {
            urlPattern: /.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'offlineCache',
              expiration: {
                maxEntries: 200,
              },
            },
          },
        ],
      },
      includeAssets: ['favicon.ico', 'robots.txt'],
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
      },
    }),
  ],
})

export default config
