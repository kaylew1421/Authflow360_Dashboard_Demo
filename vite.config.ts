import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Force Vite to use port 5174
    strictPort: true, // 👈 Optional: fail if port is in use instead of switching
  },
});
