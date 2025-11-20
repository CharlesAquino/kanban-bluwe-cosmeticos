/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Gera pasta .next/standalone para deploy em Docker
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Configuração para desenvolvimento (sem export estático)
  excludeDefaultMomentLocales: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
