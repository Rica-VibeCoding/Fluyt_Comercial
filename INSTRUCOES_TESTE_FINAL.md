# 🚀 INSTRUÇÕES PARA TESTAR O SISTEMA DE LOGIN

## ⚡ **PASSO 1: DEFINIR SENHA NO SUPABASE AUTH**

1. **Acesse**: https://momwbpxqnvgehotfmvde.supabase.co/project/default/auth/users
2. **Procure o usuário**: ricardo.nilton@hotmail.com
3. **Se NÃO existir**:
   - Clique em "Invite user"
   - Email: `ricardo.nilton@hotmail.com`
   - Senha: `123456`
   - Confirme criação
4. **Se JÁ existir**:
   - Clique no usuário
   - Vá em "Reset password"
   - Digite: `123456`
   - Confirme

## ⚡ **PASSO 2: INICIAR BACKEND**

```bash
cd backend
python start.py
```

**Aguarde aparecer**:
```
🚀 Iniciando Backend Fluyt Comercial...
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## ⚡ **PASSO 3: TESTAR LOGIN**

### **Opção A: Via Frontend**
```bash
# Em outro terminal
cd frontend  # ou raiz do projeto
npm run dev
```
- Acesse: http://localhost:3000/login
- Email: `ricardo.nilton@hotmail.com`  
- Senha: `123456`

### **Opção B: Via API Direto**
```bash
cd backend
python test_login_direto.py
```

### **Opção C: Via cURL**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"ricardo.nilton@hotmail.com\",\"password\":\"123456\"}"
```

## 🎯 **RESULTADO ESPERADO**

**✅ Login com Sucesso:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "03de5532-db40-4f78-aa66-63d30060ea4e",
    "email": "ricardo.nilton@hotmail.com",
    "nome": "Ricardo Nilton",
    "perfil": "SUPER_ADMIN"
  }
}
```

## 🔧 **SE DEU ERRO AINDA**

### **Erro: "Invalid credentials"**
- ✅ Verifique se a senha foi definida corretamente no Supabase Auth
- ✅ Confirme que o email é exatamente: `ricardo.nilton@hotmail.com`

### **Erro: "User not found"**  
- ✅ Execute: `cd backend && python test_auth_completo.py`
- ✅ Verifique se o user_id no banco coincide com o UUID do Supabase Auth

### **Erro: "Connection refused"**
- ✅ Verifique se o backend está rodando na porta 8000
- ✅ Execute: `netstat -an | findstr "8000"`

## 📊 **ARQUIVOS IMPORTANTES CRIADOS**

- `SOLUCAO_COMPLETA_AUTH.md` → Solução detalhada
- `test_auth_completo.py` → Teste de integridade
- `test_login_direto.py` → Teste de login
- `modules/auth/services_ORIGINAL.py` → Backup do código original

## 🎉 **APÓS FUNCIONAR**

1. **✅ Login funcionando**
2. **✅ Tabela de clientes acessível** 
3. **✅ Sistema estável**
4. **📈 Próximo passo**: Integrar com módulo de funcionários (`cad_equipe`)

---

**⏱️ Tempo estimado para teste:** 10-15 minutos 