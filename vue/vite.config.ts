import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5176,
    host: true,
    strictPort: true,
    proxy: {
      "/api": { target: "http://localhost:8104", changeOrigin: true },
    },
  },
  preview: {
    port: 4176,
  },
});
