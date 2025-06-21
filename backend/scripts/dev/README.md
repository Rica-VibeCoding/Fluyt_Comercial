# 🛠️ Scripts de Desenvolvimento - Fluyt Comercial

Esta pasta contém scripts utilitários para desenvolvimento e debug do sistema.

## 📋 **Scripts Disponíveis**

### 🔍 **verificar_usuarios.py**
**O que faz:** Verifica todos os usuários existentes no Supabase (tanto na tabela Auth quanto nas tabelas de dados)

**Quando usar:** 
- Quando precisar ver quais usuários existem no sistema
- Para debug de problemas de login
- Para verificar se um usuário foi criado corretamente

**Como usar:**
```bash
cd backend
python scripts/dev/verificar_usuarios.py
```

---

### 🔑 **verificar_campo_user_id.py**
**O que faz:** Verifica qual campo conecta os usuários da tabela Auth com as tabelas de dados

**Quando usar:**
- Quando há problemas de autenticação
- Para entender a estrutura de relacionamento entre tabelas
- Debug de campos de usuário

**Como usar:**
```bash
cd backend
python scripts/dev/verificar_campo_user_id.py
```

---

### 🔐 **reset_senha_direto.py**
**O que faz:** Permite redefinir a senha de um usuário diretamente no Supabase (útil quando email não funciona)

**Quando usar:**
- Quando o sistema de email não está funcionando
- Para resetar senha de usuários específicos
- Em casos de emergência de acesso

**Como usar:**
```bash
cd backend
python scripts/dev/reset_senha_direto.py
```

**⚠️ CUIDADO:** Este script altera dados no banco. Use apenas quando necessário.

---

### 📊 **listar_tabelas.py**
**O que faz:** Lista todas as tabelas disponíveis no banco Supabase com informações básicas

**Quando usar:**
- Para ver a estrutura do banco de dados
- Verificar quais tabelas existem
- Debug de problemas de conexão com banco

**Como usar:**
```bash
cd backend
python scripts/dev/listar_tabelas.py
```

---

## 🚨 **IMPORTANTE**

### **Antes de Executar:**
1. Certifique-se de que o arquivo `.env` está configurado na pasta `backend/`
2. Ative o ambiente virtual: `backend\venv\Scripts\activate`
3. Instale as dependências: `pip install -r requirements.txt`

### **Segurança:**
- ❌ **NUNCA** execute estes scripts em produção
- ❌ **NUNCA** compartilhe as saídas destes scripts (podem conter dados sensíveis)
- ✅ Use apenas em ambiente de desenvolvimento
- ✅ Mantenha o arquivo `.env` seguro

### **Problemas Comuns:**
- **"Módulo não encontrado"**: Execute a partir da pasta `backend/`
- **"Erro de conexão"**: Verifique se o `.env` está correto
- **"Permissão negada"**: Verifique se as chaves do Supabase têm permissões adequadas

---

## 📞 **Suporte**

Se algum script não funcionar:
1. Verifique se está na pasta correta (`backend/`)
2. Confirme se o ambiente virtual está ativo
3. Verifique as configurações do `.env`
4. Consulte os logs de erro para mais detalhes 