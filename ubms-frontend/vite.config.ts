/// <reference types="vitest" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, URL } from 'node:url';

const currentDir = fileURLToPath(new URL('.', import.meta.url));

// Auto-sync logo assets into public/ and src/assets/
try {
  const publicDir = path.resolve(currentDir, './public');
  const assetsDir = path.resolve(currentDir, './src/assets');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const logoLightCandidates = [
    path.resolve(currentDir, '../docs/assets/logo.png'),
    path.resolve(currentDir, '../logo.png'),
    path.resolve(publicDir, 'logo.png'),
  ];
  const logoDarkCandidates = [
    path.resolve(currentDir, '../docs/assets/logo-dark.png'),
    path.resolve(currentDir, '../logo-dark.png'),
    path.resolve(publicDir, 'logo-dark.png'),
  ];

  const logoLight = logoLightCandidates.find((p) => fs.existsSync(p));
  const logoDark = logoDarkCandidates.find((p) => fs.existsSync(p));

  if (logoLight && logoLight !== path.join(publicDir, 'logo.png')) {
    fs.copyFileSync(logoLight, path.join(publicDir, 'logo.png'));
    fs.copyFileSync(logoLight, path.join(assetsDir, 'logo.png'));
  }
  if (logoDark && logoDark !== path.join(publicDir, 'logo-dark.png')) {
    fs.copyFileSync(logoDark, path.join(publicDir, 'logo-dark.png'));
    fs.copyFileSync(logoDark, path.join(assetsDir, 'logo-dark.png'));
    fs.copyFileSync(logoDark, path.join(publicDir, 'favicon.png'));
    fs.copyFileSync(logoDark, path.join(publicDir, 'favicon.ico'));
  }
} catch (e) {
  // Gracefully fallback if filesystem permissions are constrained
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
