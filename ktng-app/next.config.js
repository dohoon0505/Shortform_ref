/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',          // Static HTML export (matches KT&G's _next/static/chunks pattern)
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: '/ktng-preview',  // Mounted under web_design_system/ktng-preview/
  assetPrefix: '/ktng-preview',
};
module.exports = nextConfig;
