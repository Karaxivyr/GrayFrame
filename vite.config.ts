import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // No global injections here — we’ll import explicitly in main.ts
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5174,
  },
});
