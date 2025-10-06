import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
