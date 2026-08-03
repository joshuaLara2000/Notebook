import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // El service worker se actualiza solo cuando publicas una nueva versión.
      registerType: 'autoUpdate',
      // Assets estáticos que también queremos precacheados para uso offline.
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mi libreta',
        short_name: 'Mi libreta',
        description:
          'Tu escritorio de papelería digital: libreta, post-its y stickers.',
        lang: 'es',
        dir: 'ltr',
        theme_color: '#8368d1',
        background_color: '#f2ecfb',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // SPA: navegaciones sin match caen en index.html
        navigateFallback: '/index.html',
        // nunca sirvas la API de Supabase desde el cache del shell
        navigateFallbackDenylist: [/^\/api/, /supabase/],
      },
      // El SW no corre en `vite dev` (evita cachear en desarrollo).
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
