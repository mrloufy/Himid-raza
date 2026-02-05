import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // This defines the environment variables that should be available in the browser.
  // Vite will replace 'process.env.API_KEY' with the actual value during the build.
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});