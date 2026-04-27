import "@ai20k-demo/env/web";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const appDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(appDir, "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: workspaceRoot,
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: ["shiki"],
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
