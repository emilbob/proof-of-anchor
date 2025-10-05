import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["@solana/web3.js", "@coral-xyz/anchor"],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
