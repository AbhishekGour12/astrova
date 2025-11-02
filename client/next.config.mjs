/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.pixabay.com"], // ✅ Add allowed remote image domains here
  },
};

export default nextConfig;
