import { defineConfig } from 'vite';
import svelte from '@sveltejs/vite-plugin-svelte';
import base from './base.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server: {
    port: 5001,
  },
  base: `/${base}/`,
});
