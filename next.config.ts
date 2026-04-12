import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import os from "os";

// Dynamically get all local IP addresses to allow them in development
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = ["localhost", "127.0.0.1"];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips;
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    // @ts-ignore - Move back to experimental as per docs
    allowedDevOrigins: getLocalIPs(),
  },
};

module.exports = {
  allowedDevOrigins: ['10.85.153.185'],
}

export default withPWA(nextConfig);
