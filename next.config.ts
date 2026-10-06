// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Enable Cache Components (required for "use cache" directive)
  cacheComponents: true,

  experimental: {
    // ✅ Increase Server Action body size limit (default is 1 MB)
    // Allows uploading images up to 10 MB through Server Actions.
    serverActions: {
      bodySizeLimit: "10mb",
    },

    // ✅ Tree-shake large packages — only bundle the icons/components
    // actually imported. Big JS savings on Lucide, Clerk, Radix, etc.
    optimizePackageImports: [
      "lucide-react",
      "@clerk/nextjs",
      "radix-ui",
      "react-hook-form",
      "zod",
      "sonner",
      "@editorjs/editorjs",
    ],

    // ✅ Inline critical CSS into the HTML, defer the rest.
    // Removes the render-blocking CSS warning from PageSpeed.
    // Requires: `npm install critters`
    optimizeCss: true,
  },

  // ✅ Allow ALL remote image hostnames
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allows any hostname over HTTPS
      },
      {
        protocol: "http",
        hostname: "**", // allows any hostname over HTTP
      },
    ],
  },
};

export default nextConfig;