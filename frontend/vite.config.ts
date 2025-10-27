import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Enable polyfills for specific globals and modules
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add polyfill aliases for Node.js modules
      buffer: "buffer",
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
      crypto: "crypto-browserify",
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  optimizeDeps: {
    include: ["@solana/web3.js", "@coral-xyz/anchor", "buffer", "process"],
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      plugins: [],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
