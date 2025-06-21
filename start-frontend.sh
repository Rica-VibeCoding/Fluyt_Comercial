#!/bin/bash
echo "🚀 Iniciando Frontend Fluyt..."
echo "================================"

# Limpar cache
echo "🧹 Limpando cache..."
rm -rf .next

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar o servidor
echo "🔧 Iniciando servidor de desenvolvimento..."
echo "================================"
echo "📍 URL: http://localhost:3000"
echo "================================"

npm run dev