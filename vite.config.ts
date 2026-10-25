import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazy engine chunk (three.js) is ~625 kB raw (~163 kB gzip) by design; it loads after the page is idle.
    chunkSizeWarningLimit: 660,
    rollupOptions: {
      output: {
        // three.js stays out of these groups: it loads lazily, after first paint.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
        },
      },
    },
  },
});
