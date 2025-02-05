/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve security with headers
  headers: async () => [{
    source: '/:path*',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ],
  }, {
    source: '/_next/static/(.*)',
    headers: [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
    ],
  }],
  
  // Optimize images
  images: {
    domains: ['your-domain.com'], // Add your image domains
    remotePatterns: [{
      protocol: 'https',
      hostname: '**',
    }],
  },

  // Enable modern optimization features
  poweredByHeader: false, // Remove X-Powered-By header
};

export default nextConfig;
