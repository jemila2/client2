import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // ✅ CHANGE THIS TO YOUR RAILWAY BACKEND
  const apiBaseUrl = env.API_BASE_URL || 'https://laundrypro-backend-production.up.railway.app';
  const isProduction = mode === 'production';
  
  return {
    base: isProduction ? '/client2/' : '/',
    
    plugins: [react()],
    
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(apiBaseUrl),
      'import.meta.env.MODE': JSON.stringify(mode),
    },
    
    css: {
      postcss: {
        plugins: [tailwindcss, autoprefixer],
      },
    },
    
    server: {
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          secure: false,
        }
      },
      host: '0.0.0.0',
      port: 5173,
    },
    
    build: {
      outDir: 'dist',
      copyPublicDir: true,
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});