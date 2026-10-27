import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Make sure the Prisma query engine ships inside the standalone output (Render deploy)
  outputFileTracingIncludes: {
    "/api/**/*": ["./node_modules/.prisma/client/**", "./node_modules/@prisma/engines/**"],
    "/api/*": ["./node_modules/.prisma/client/**", "./node_modules/@prisma/engines/**"],
  },
};

export default nextConfig;
