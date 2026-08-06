import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Multi-page build: a marketing landing page, the member (respondent) app,
// and the orgs (buyer) console — mirroring the three original prototype bundles.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        member: resolve(__dirname, 'member.html'),
        demo: resolve(__dirname, 'demo.html'),
        insights: resolve(__dirname, 'insights.html'),
        orgs: resolve(__dirname, 'orgs.html'),
        vox: resolve(__dirname, 'vox.html'),
      },
    },
  },
});
