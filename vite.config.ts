import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false, // Disable source maps in production for security
    // Note: console.log removal will be handled by logger utility
  },
  server: {
    proxy: {
      "/api": {
        target: "http://srv842241.hstgr.cloud:5000",
        changeOrigin: true,
      },
    },
  },
});
