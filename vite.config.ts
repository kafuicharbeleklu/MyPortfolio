import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const repoBase = '/MyPortfolio/';
  const base = env.VITE_BASE_PATH || (mode === 'production' ? repoBase : '/');
  const usePolling =
    process.platform === 'win32' &&
    process.env.VITE_DISABLE_POLLING !== 'true';
  return {
    base,
    plugins: [react()],
    optimizeDeps: {
      entries: ['./index.html'],
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: usePolling
        ? {
            usePolling: true,
            interval: 300,
          }
        : undefined,
    },
  };
});
