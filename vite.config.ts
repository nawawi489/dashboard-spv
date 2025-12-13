import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    strictPort: true,
    host: true,
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'components'),
      '@features': path.resolve(__dirname, 'features'),
      '@services': path.resolve(__dirname, 'services'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@types': path.resolve(__dirname, 'types'),
      '@constants': path.resolve(__dirname, 'constants'),
    }
  },
  build: {
    outDir: 'dist',
  }
});
