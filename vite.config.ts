import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|react-is|scheduler)\//.test(id))
            return "react";
          if (/node_modules\/(recharts|recharts-scale|d3-[^/]+|lodash|lodash-es|victory-vendor)\//.test(id))
            return "charts";
          if (
            /node_modules\/(framer-motion|motion-dom|motion-utils|gsap|lenis)\//.test(
              id,
            )
          )
            return "motion";
        },
      },
    },
  },
});
