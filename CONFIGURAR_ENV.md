# 🔧 Configuração Necessária - Arquivo .env

## ❌ Problema Identificado
O backend está falhando porque não há arquivo `.env` configurado com as credenciais do Supabase.

## ✅ Solução

Crie um arquivo `.env` no diretório `backend/` com o seguinte conteúdo:

```env
# ===== SUPABASE =====
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_KEY=sua-chave-de-servico

# ===== JWT =====
JWT_SECRET_KEY=uma-chave-secreta-segura

# ===== AMBIENTE =====
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# ===== CORS =====
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# ===== CONFIGURAÇÕES ADICIONAIS =====
MAX_FILE_SIZE_MB=10
DEFAULT_ITEMS_PER_PAGE=20
```

## 🔑 Onde encontrar as credenciais do Supabase:

1. **SUPABASE_URL**: No dashboard do Supabase, aba "Settings" > "API"
2. **SUPABASE_ANON_KEY**: No dashboard do Supabase, aba "Settings" > "API" 
3. **SUPABASE_SERVICE_KEY**: No dashboard do Supabase, aba "Settings" > "API" (⚠️ Manter em segredo!)

## 🚀 Após configurar o .env:

1. Reinicie o backend
2. Teste o login novamente

## ⚠️ Importante:
- Nunca commite o arquivo `.env` no git
- Use chaves reais do seu projeto Supabase
- Gere uma JWT_SECRET_KEY segura para produção 