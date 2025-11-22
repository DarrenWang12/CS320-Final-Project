/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // You can add API rewrites here if needed
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:8000/api/:path*',
  //     },
  //   ];
  // },
};

module.exports = nextConfig;

