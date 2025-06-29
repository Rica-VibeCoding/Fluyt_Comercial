#!/bin/bash
# Script para iniciar o backend

echo "🚀 Iniciando backend Fluyt..."
echo "📍 Diretório: $(pwd)"

# Verificar se está no diretório correto
if [ ! -f "main.py" ]; then
    echo "❌ Erro: main.py não encontrado!"
    echo "📂 Execute este script no diretório backend/"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Aviso: arquivo .env não encontrado"
    echo "📝 Criando .env com configurações padrão..."
    
    cat > .env << 'EOF'
# ===== SUPABASE CONFIGURATION =====
SUPABASE_URL=https://momwbpxqnvgehotfmvde.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA

# ===== JWT AUTHENTICATION =====
JWT_SECRET_KEY=fluyt-super-secret-key-development-2025
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# ===== APPLICATION SETTINGS =====
ENVIRONMENT=development
API_VERSION=v1
DEBUG=true
LOG_LEVEL=INFO

# ===== CORS CONFIGURATION =====
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ===== FILE UPLOAD LIMITS =====
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_EXTENSIONS=.xml
EOF
fi

# Executar backend
echo "✅ Iniciando servidor na porta 8000..."
python3 main.py