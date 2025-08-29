/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const nextConfig = {
  output: "export", // enable static export
  images: {
    unoptimized: true, // required for GitHub Pages
  },
  basePath: isProd ? "/opencalendar" : "",
};

export default nextConfig;
