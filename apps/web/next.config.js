/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
    formats: ['image/webp', 'image/avif'],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'http://localhost:9000/admin',
        permanent: false,
        basePath: false,
      },
      {
        source: '/cms',
        destination: 'http://localhost:1337/admin',
        permanent: false,
        basePath: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/medusa/:path*',
        destination: 'http://localhost:9000/:path*',
      },
      {
        source: '/api/strapi/:path*',
        destination: 'http://localhost:1337/api/:path*',
      },
    ]
  },
  env: {
    MEDUSA_BACKEND_URL: process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000',
    STRAPI_API_URL: process.env.STRAPI_API_URL || 'http://localhost:1337/api',
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  },
}

module.exports = nextConfig