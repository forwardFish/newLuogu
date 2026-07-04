import type { NextConfig } from "next";

const traceExcludes = ["./docs/**/*", "./temp/**/*"];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  outputFileTracingExcludes: {
    "next-server": traceExcludes,
    "**/*": traceExcludes,
  },
};

export default nextConfig;
