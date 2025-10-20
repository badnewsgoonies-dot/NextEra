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
    host: true, // Allow network access for iPad/mobile testing
  },
  build: {
    target: 'esnext',
    outDir: 'dist-web',
  },
});

