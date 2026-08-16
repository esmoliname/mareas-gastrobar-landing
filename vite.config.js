import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
  },
  build: {
    target: "es2018",
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          // @google/model-viewer (~1 MB) se descarga solo al abrir el modal 3D/AR
          "model-viewer": ["@google/model-viewer"],
          "vue-vendor": ["vue", "vue-router", "pinia"],
          "ui-icons": ["lucide-vue-next"],
          qrcode: ["qrcode"],
        },
      },
    },
  },
});