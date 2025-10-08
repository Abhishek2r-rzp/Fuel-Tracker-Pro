import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/expense-tracker/",
  plugins: [react()],
  envDir: path.resolve(__dirname, "../../"), // Load .env from monorepo root
  server: {
    port: 3002,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("react-router")) {
              return "router-vendor";
            }
            if (id.includes("firebase/app") || id.includes("firebase/auth")) {
              return "firebase-core";
            }
            if (id.includes("firebase/firestore")) {
              return "firebase-db";
            }
            if (id.includes("firebase/storage")) {
              return "firebase-storage";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "charts";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("date-fns")) {
              return "date-utils";
            }
            if (id.includes("xlsx") || id.includes("exceljs")) {
              return "excel-parser";
            }
            if (id.includes("@radix-ui")) {
              return "ui-components";
            }
            if (id.includes("papaparse")) {
              return "csv-parser";
            }
            if (id.includes("pdfjs-dist") || id.includes("pdf.worker")) {
              return "pdf-worker";
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
