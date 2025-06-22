import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuração para desenvolvimento
  reactStrictMode: true,
  
  // 🔧 SOLUÇÃO TRAILING SLASH - Baseado na pesquisa web
  // FastAPI espera trailing slash, Next.js remove por padrão
  trailingSlash: false, // Manter false para Next.js
  
  // 🔧 PROXY REVERSO CORRIGIDO - Adicionar trailing slash na destination
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:8000/api/v1/:path*', // SEM trailing slash extra
      },
    ];
  },

  // 🔧 HEADERS CORS PARA DESENVOLVIMENTO
  async headers() {
    return [
      {
        source: '/api/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // 🔧 CONFIGURAÇÃO DE REDIRECT PARA DEBUGGING
  async redirects() {
    return [];
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
    if (dev) {
      console.log('🔧 Aplicando configurações simplificadas para desenvolvimento');
      console.log('🔧 Proxy configurado: /api/v1/* -> http://localhost:8000/api/v1/*');
      console.log('🔧 Trailing slash: false (Next.js padrão)');
      
      // ✅ CACHE SIMPLIFICADO
      config.cache = {
        type: 'memory',
      };
      
      // ✅ DESABILITAR SPLIT CHUNKS EM DEV
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
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

  // 🔧 CONFIGURAÇÕES DE DESENVOLVIMENTO PARA DEBUG
  ...(process.env.NODE_ENV === 'development' && {
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
  }),
}

export default nextConfig; 