import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteImagemin from 'vite-plugin-imagemin'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    mozjpeg: { quality: 75 },
    webp: { quality: 75 },
  })],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: false // Ensure we're using HTTP
  }
});