import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

const getVersion = () => {
  try {
    // Get the last commit date in the requested format: YYYY-MM-DD-HHMMSS
    // %ad respects the author date and timezone of the commit
    return execSync('git log -1 --format="%ad" --date=format:"%Y-%m-%d-%H%M%S"').toString().trim();
  } catch (e) {
    console.warn('Failed to get git version, falling back to current date', e);
    return new Date().toISOString().replace(/T/, '-').replace(/\..+/, '').replace(/:/g, '');
  }
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path to support deployment on both GitHub Pages (subdir) and Cloud Run (root)
  base: './',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ollama/, ''),
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(getVersion()),
  },
});