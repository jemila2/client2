import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: '/client2/',
  plugins: [
    react(),
  ],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },

  server: {
     proxy: {
      '/api': {
        target: 'https://backend-21-2fu1.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    },
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
 
  }
});