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
          modelviewer: ["@google/model-viewer"],
          vendor: ["vue", "vue-router", "lucide-vue-next", "qrcode"],
        },
      },
    },
  },
});