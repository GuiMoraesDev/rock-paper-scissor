import { type BuildOptions, build } from "esbuild";

const config: BuildOptions = {
  entryPoints: ["src/index.ts"],
  outdir: "dist",
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  sourcemap: true,
  splitting: false, // important for Node
  packages: "external",
  outExtension: { ".js": ".js" },
  logLevel: "info",
};

await build(config);
