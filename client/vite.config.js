// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',           // SW se actualiza solo
      devOptions: { enabled: true },        // permite probar en dev
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      includeAssets: ['favicon.png'],       // opcional
      manifest: {
        name: 'Cuenta Verificada',
        short_name: 'CV',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#f2f8f8',
        background_color: '#0e1a19',
        icons: [
          { src: '/favicon.png', sizes: '192x192', type: 'image/png' },
          { src: '/favicon.png', sizes: '512x512', type: 'image/png' },
          { src: '/favicon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
  esbuild: mode === 'production' || mode === 'test'
    ? { pure: ['console.log', 'console.info', 'console.debug'] }
    : undefined,
}));
