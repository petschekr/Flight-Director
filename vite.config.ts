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
    proxy: {
      "/api": {
        target: "http://localhost:5050/api",
        changeOrigin: true,
      },
      "/open": {
        target: "http://localhost:5050/open",
        changeOrigin: true,
      },
      "/download": {
        target: "http://localhost:5050/download",
        changeOrigin: true,
      },
      "/save": {
        target: "http://localhost:5050/save",
        changeOrigin: true,
      },
    }
  },
  appType: "spa",
  base: "./",
});
