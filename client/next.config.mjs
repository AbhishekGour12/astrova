/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.pixabay.com"], // ✅ Add allowed remote image domains here
  },
  trailingSlash: true
};

export default nextConfig;
