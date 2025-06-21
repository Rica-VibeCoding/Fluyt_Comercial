import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // Proxy reverso para evitar CORS
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },
  
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
      
      // ✅ DESABILITAR SPLIT CHUNKS EM DEV: Evitar problemas com vendors.js
      config.optimization = {
        ...config.optimization,
        splitChunks: false, // Desabilitar completamente em desenvolvimento
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