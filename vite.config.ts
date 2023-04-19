import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile";
import { viteCommonjs } from "@originjs/vite-plugin-commonjs";

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD')
  .toString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), viteSingleFile({ removeViteModuleLoader: true }), viteCommonjs()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  server: {
    host: true,
    proxy: {
      "/config": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/performance": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/open": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/download": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/save": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
      "/sharepoint": {
        target: "http://localhost:5050",
        changeOrigin: true,
      },
    }
  },
  appType: "spa",
  base: "./",
});
