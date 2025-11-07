/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push("ffmpeg-static");
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["ffmpeg-static"],
  },
};

export default nextConfig;
