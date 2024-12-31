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
