import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, '../../'), // Load .env from monorepo root
  server: {
    port: 3002,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "firebase-core": ["firebase/app", "firebase/auth"],
          "firebase-db": ["firebase/firestore"],
          charts: ["recharts"],
          "ui-vendor": ["lucide-react", "date-fns"],
        },
      },
    },
  },
});
