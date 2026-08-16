import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base 走相對路徑，GitHub Pages 與 Vercel 都不必改設定（← CLAUDE.md 技術棧：部署 M1 決定）
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    // 快照 JSON 由 import.meta.glob 在建置期併入，不需 publicDir 搬檔
    assetsInlineLimit: 0,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
