import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow network access
    strictPort: true,
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
});

