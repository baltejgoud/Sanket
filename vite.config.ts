import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    // The lazy three.js chunk is ~540 kB raw (~138 kB gzip) by design; it never blocks first paint.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // three.js stays out of these groups: it loads lazily, after first paint.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
          if (/node_modules\/(gsap|lenis)\//.test(id)) return "motion";
        },
      },
    },
  },
});
