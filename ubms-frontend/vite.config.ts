import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';

// Auto-copy logo.png and logo-dark.png into public/ and src/assets/
try {
  const publicDir = path.resolve(__dirname, './public');
  const assetsDir = path.resolve(__dirname, './src/assets');

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

  const logoLight = path.resolve(__dirname, '../logo.png');
  const logoDark = path.resolve(__dirname, '../logo-dark.png');
  const brainDarkLogo = path.resolve(process.env.USERPROFILE || 'C:/Users/ALFA', '.gemini/antigravity-ide/brain/f0797293-03e5-4ef2-a3a0-0aaa4aa330fa/logo_dark_1786636595898.png');

  if (fs.existsSync(logoLight)) {
    fs.copyFileSync(logoLight, path.join(publicDir, 'logo.png'));
    fs.copyFileSync(logoLight, path.join(assetsDir, 'logo.png'));
  }
  if (fs.existsSync(logoDark)) {
    fs.copyFileSync(logoDark, path.join(publicDir, 'logo-dark.png'));
    fs.copyFileSync(logoDark, path.join(assetsDir, 'logo-dark.png'));
    fs.copyFileSync(logoDark, path.join(publicDir, 'favicon.png'));
    fs.copyFileSync(logoDark, path.join(publicDir, 'favicon.ico'));
  }
  if (fs.existsSync(brainDarkLogo)) {
    fs.copyFileSync(brainDarkLogo, path.join(publicDir, 'logo-dark-full.png'));
    fs.copyFileSync(brainDarkLogo, path.join(assetsDir, 'logo-dark-full.png'));
  }
} catch (e) {
  // ignore
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
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
