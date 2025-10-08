import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/expense-tracker/" : "/",
  plugins: [react()],
  envDir: path.resolve(__dirname, "../../"), // Load .env from monorepo root
  server: {
    port: 3002,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "firebase-core": ["firebase/app", "firebase/auth"],
          "firebase-db": ["firebase/firestore"],
          "firebase-storage": ["firebase/storage"],
          charts: ["recharts"],
          "excel-parser": ["xlsx"],
          "csv-parser": ["papaparse"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
