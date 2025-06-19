import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // Configuração de paths (alias "@" para src)
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    
    // Ignorar completamente a pasta de migração
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      exclude: [
        /node_modules/,
        /src\/migracao/,
        /\.next/
      ],
    });

    // 🔧 CONFIGURAÇÕES SIMPLIFICADAS PARA DESENVOLVIMENTO
    // Remover configurações complexas que causam race conditions
    if (dev) {
      console.log('🔧 Aplicando configurações simplificadas para desenvolvimento');
      
      // ✅ CACHE SIMPLIFICADO: Usar apenas memory cache para evitar stale closures
      config.cache = {
        type: 'memory', // Mudança crítica: memory ao invés de filesystem
      };
      
      // ✅ SPLIT CHUNKS MÍNIMO: Apenas essencial para evitar problemas de timing
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'async', // Menos agressivo que 'all'
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // Configurações experimentais otimizadas
  experimental: {
    optimizePackageImports: ['@/components/ui', 'lucide-react'],
  },
  
  // Melhor tratamento de arquivos
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

export default nextConfig; 