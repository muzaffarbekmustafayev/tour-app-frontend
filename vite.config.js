import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Backend manzili — lokalda 5000-port. .env dagi VITE_API_URL=/api
  // bo'lganda quyidagi proxy /api, /uploads va /socket.io ni backendga uzatadi
  // (shu sababli CORS muammosi bo'lmaydi va "backend bilan bog'lanish yo'qoldi" xatosi yo'qoladi).
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/socket.io': {
          target: backendTarget,
          changeOrigin: true,
          ws: true,
        },
      },
    },
  };
});
