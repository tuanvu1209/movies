/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'image.tmdb.org',
      'localhost',
      'placehold.co',
      'assets.nflxext.com',
      'images.unsplash.com',
      'picsum.photos',
      'via.placeholder.com',
      'upload.wikimedia.org',
      'bluphim.me',
    ],
    formats: ['image/avif', 'image/webp'],
  },
  compress: true,
  poweredByHeader: false,
  swcMinify: true,
}

module.exports = nextConfig
