// vite.config.ts
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173, // 🔁 change to whatever port you want
  },
  test: { // Add this Vitest configuration block
    globals: true, // Makes test functions like 'describe', 'it', 'expect' global
    environment: 'jsdom', // Specify the test environment
    // setupFiles: './src/setupTests.ts', // Optional: for global test setup
  },
})