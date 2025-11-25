// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 👇 CAMBIO IMPORTANTE
      strategies: "injectManifest", // usamos nuestro propio SW
      srcDir: "src", // carpeta donde estará el SW
      filename: "sw.js", // nombre del SW (src/sw.js)

      registerType: "autoUpdate",
      // para probar PWA en dev, debe estar habilitado en desarrollo, no en prod:
      devOptions: {
        enabled: mode !== "production",
        type: "module", // 👈 IMPORTANTE para poder usar import en el SW en dev
      },

      // Configuración para injectManifest
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024 // 5MB
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      includeAssets: ["favicon.ico"],
      manifest: {
        name: "Cuenta Verificada",
        short_name: "CV",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#f2f8f8",
        background_color: "#0e1a19",
        icons: [
          { src: "/favicon.png", sizes: "192x192", type: "image/png" },
          { src: "/favicon.png", sizes: "512x512", type: "image/png" },
          {
            src: "/favicon.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
  esbuild:
    mode === "production"
      ? { pure: ["console.log", "console.info", "console.debug"] }
      : undefined,
}));
