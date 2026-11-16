import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // During development the frontend runs on :5173 and the backend on :8080.
    // The proxy makes /api calls look like they come from the same origin.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
