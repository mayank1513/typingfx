import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["vitest.setup.ts"],
    coverage: {
      include: ["src/**"],
      exclude: ["src/**/index.ts", "src/**/*.test.*", "src/**/declaration.d.ts"],
      reporter: ["text", "json", "clover", "html"],
    },
  },
});
