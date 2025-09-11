// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
    },
  },
 // En prod, elimina solo estos métodos
    pure: mode === "production" ? ["console.log", "console.info", "console.debug"] : [],
    // (opcional) también puedes dropear debugger:
    drop: mode === "production" ? ["debugger"] : [],
}));
