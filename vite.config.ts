import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const getOrigin = (url: string | undefined, fallback: string) => {
    try {
      return url ? new URL(url).origin : fallback;
    } catch (e) {
      console.warn(`Invalid URL configuration: ${url}. Falling back to ${fallback}`);
      return fallback;
    }
  };

  const apiOrigin = getOrigin(env.VITE_API_BASE_URL, 'http://localhost:5000');
  const ngrokOrigin = getOrigin(env.VITE_NGROK_URL, '');


  return {
  plugins: [
    react(),
    {
      name: 'csp-api-origin',
      transformIndexHtml(html) {
        const origins = [apiOrigin, ngrokOrigin].filter(Boolean).join(' ');
        return html.replace(/__CSP_API_ORIGIN__/g, origins);
      },
    },
  ],
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
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: apiOrigin,
        changeOrigin: true,
        secure: false, // Bypass SSL verification for development
        rewrite: (path) => path.replace(/^\/api/, "/api"), // Keep /api prefix
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
};
});
