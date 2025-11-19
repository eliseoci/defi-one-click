import path from "path";

const asyncStorageStub = path.resolve("./lib/async-storage.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    resolveAlias: {
      pino: "pino/browser",
      "@react-native-async-storage/async-storage": asyncStorageStub,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      pino: "pino/browser",
      "@react-native-async-storage/async-storage": asyncStorageStub,
    };
    return config;
  },
}

export default nextConfig
