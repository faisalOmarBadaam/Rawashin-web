import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  basePath: process.env.BASEPATH,
  redirects: async () => {
    return [
      {
        source: '/',
        destination: '/ar/home',
        permanent: true,
        locale: false
      },
      {
        source: '/:lang(en|fr|ar)',
        destination: '/:lang/home',
        permanent: true,
        locale: false
      },
      {
  source: '/:path((?!en|fr|ar|front-pages|images|api|favicon.ico|templates).*)*',
  destination: '/ar/:path*',
  permanent: true,
  locale: false
}
    ]
  },
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === 'true') {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? './analyze/server.html' : './analyze/client.html',
          openAnalyzer: false
        })
      )
    }

    return config
  }
}

export default nextConfig
