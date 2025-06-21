#!/bin/bash

echo "🚀 Iniciando Backend Fluyt..."
echo "================================"

# Verificar se estamos no diretório correto
if [ ! -f "main.py" ]; then
    echo "❌ Erro: main.py não encontrado!"
    echo "   Execute este script dentro da pasta backend"
    exit 1
fi

# Verificar Python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "❌ Python não encontrado!"
    exit 1
fi

echo "✅ Usando: $PYTHON_CMD"
echo ""

# Instalar dependências se necessário
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo "📦 Criando ambiente virtual..."
    $PYTHON_CMD -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

# Ativar ambiente virtual se existir
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Iniciar o backend
echo "🔧 Iniciando servidor..."
echo "================================"
$PYTHON_CMD main.py