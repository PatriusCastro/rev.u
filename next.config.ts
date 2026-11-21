import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev badge sat on the navigation and read as part of the app. Build and runtime errors still show.
  devIndicators: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
