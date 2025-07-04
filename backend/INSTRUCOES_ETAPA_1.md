# 📊 ETAPA 1 - INSTRUÇÕES PARA CRIAR TABELAS

Ricardo, as tabelas foram preparadas mas precisam ser criadas no Supabase Dashboard.

## 🎯 **PASSOS PARA EXECUTAR:**

### **1. Acessar Supabase Dashboard**
- Acesse: https://momwbpxqnvgehotfmvde.supabase.co
- Vá em: **SQL Editor** (menu lateral esquerdo)

### **2. Executar SQL**
- Abra o arquivo: `backend/sql/EXECUTAR_NO_SUPABASE_DASHBOARD.sql`
- **Copie todo o conteúdo**
- **Cole no SQL Editor** 
- Clique em **"Run"**

### **3. Validar Criação**
Execute no terminal:
```bash
cd backend
python3 validar_tabelas_criadas.py
```

## ✅ **RESULTADO ESPERADO:**

```
✅ c_status_orcamento: 6 registros
   1. Rascunho (#FFA500)
   2. Enviado (#007BFF)
   3. Em Análise (#FFC107)
   4. Aprovado (#28A745)
   5. Rejeitado (#DC3545)
   6. Cancelado (#6C757D)

✅ c_formas_pagamento: 0 registros
✅ c_orcamentos: 3 registros
✅ Campo status_id adicionado com sucesso
```

## 📋 **O QUE FOI CRIADO:**

1. **c_status_orcamento** - 6 status padrão para controlar fases
2. **c_formas_pagamento** - Tabela para armazenar formas de pagamento
3. **Campo status_id** - Adicionado em c_orcamentos

**Me confirme quando executar para eu prosseguir para ETAPA 2!**