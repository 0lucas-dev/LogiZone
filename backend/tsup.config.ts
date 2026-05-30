import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  outDir: "dist",
  format: ["esm"],
  target: "esnext",
  platform: "node",
  splitting: false,
  sourcemap: true,
  clean: true,
  onSuccess: "node dist/server.js",
});
