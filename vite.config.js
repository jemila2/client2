// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import tailwindcss from '@tailwindcss/postcss';
// import autoprefixer from 'autoprefixer';

// export default defineConfig({
//   base: '/client2/',
//   plugins: [
//     react(),
//   ],
//   css: {
//     postcss: {
//       plugins: [
//         tailwindcss(),
//         autoprefixer(),
//       ],
//     },
//   },

//   server: {
//      proxy: {
//       '/api': {
//         target: 'https://backend-21-2fu1.onrender.com',
//         changeOrigin: true,
//         secure: false,
//       }
//     },
//     host: '0.0.0.0',
//     port: 5173,
//   },
//   build: {
//     outDir: 'dist',
//     assetsDir: 'assets',
//     emptyOutDir: true,
//     sourcemap: false,
 
//   }
// });


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
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
    define: {
      // Expose API_BASE_URL to your client code
      'import.meta.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || 'https://backend-21-2fu1.onrender.com'),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.API_BASE_URL || 'https://backend-21-2fu1.onrender.com'),
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
  };
});