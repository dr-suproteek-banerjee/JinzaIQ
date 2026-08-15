/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  // Vercel manages its own server output. Standalone output is only needed by
  // the production Docker image and caused Vercel's post-build trace to look
  // for a manifest that had already been relocated.
  output: process.env.NEXT_STANDALONE === "true" ? "standalone" : undefined,
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
