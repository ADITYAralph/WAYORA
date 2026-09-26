/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.CUSTOM_KEY': JSON.stringify(process.env.CUSTOM_KEY),
      })
    )
    
    return config
  },
}

module.exports = nextConfig
