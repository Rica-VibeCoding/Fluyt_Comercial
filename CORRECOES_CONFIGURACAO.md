# 🔧 Correções de Configuração - Execute Manualmente

## ✅ **JÁ CORRIGIDO**
- [x] Arquivo `comunicação` - URL e chaves atualizadas

## 🔄 **CORREÇÕES PENDENTES**

### 1. **Atualizar JWT_SECRET_KEY no Backend**

**Arquivo:** `backend/.env`

Substitua esta linha:
```
JWT_SECRET_KEY=fluyt-super-secret-key-development-2025
```

Por esta:
```
JWT_SECRET_KEY=JTj5Ss1QUerDKTVc9rzphRwQ3xwD8zLIpnjlNUNSBiH0BDyaQWyN4rH1wNDrZ4rXyIVLAyK3CqQMMm2iLeGpCQ==
```

### 2. **Adicionar Configurações Supabase no Frontend**

**Arquivo:** `.env.local` (na raiz do projeto)

Adicione estas linhas após a linha `NEXT_PUBLIC_USE_REAL_API=true`:

```
# ===== SUPABASE CONFIGURATION =====
NEXT_PUBLIC_SUPABASE_URL=https://momwbpxqnvgehotfmvde.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs
```

## 🧪 **TESTE APÓS CORREÇÕES**

Execute este comando para testar:
```bash
cd backend
python test_supabase_connection.py
```

## 📋 **VERIFICAÇÃO FINAL**

Todos os arquivos devem ter a mesma URL:
- ✅ `comunicação` → `https://momwbpxqnvgehotfmvde.supabase.co`
- ✅ `backend/.env` → `https://momwbpxqnvgehotfmvde.supabase.co`
- ⏳ `.env.local` → `https://momwbpxqnvgehotfmvde.supabase.co` 