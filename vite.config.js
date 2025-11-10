import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    https: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        preview: 'preview.html',
        previewkelurahan: 'previewkelurahan.html'
      },
    },
  },
});