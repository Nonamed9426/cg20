import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'next/link': path.resolve(__dirname, './src/compat/next-link.tsx'),
      'next/navigation': path.resolve(__dirname, './src/compat/next-navigation.ts'),
      'next/image': path.resolve(__dirname, './src/compat/next-image.tsx'),
    },
  },
});
