import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '../../'), // Load .env from monorepo root
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
});

