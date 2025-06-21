# 🔧 SOLUÇÃO COMPLETA - Sistema de Autenticação

## 🚨 **PROBLEMA RAIZ IDENTIFICADO**

**O usuário `ricardo.nilton@hotmail.com` existe na tabela `usuarios` do banco, mas NÃO existe no Supabase Auth!**

Por isso o login retorna erro "NOT_FOUND" - o sistema tenta autenticar no Supabase Auth e falha.

---

## ⚡ **SOLUÇÕES PRIORITÁRIAS (FAZER AGORA)**

### **1. CRIAR USUÁRIO NO SUPABASE AUTH**

Acesse o painel do Supabase e faça:

1. **Vá para Authentication → Users**
2. **Clique em "Invite user"**
3. **Email:** `ricardo.nilton@hotmail.com`
4. **Senha:** `123456` (temporária)
5. **Confirme a criação**

### **2. CORRIGIR POLÍTICAS RLS**

Execute no SQL Editor do Supabase:

```sql
-- Remover políticas problemáticas da tabela usuarios
DROP POLICY IF EXISTS "usuarios_policy" ON usuarios;

-- Criar política RLS simples e funcional
CREATE POLICY "Enable access for authenticated users only" ON usuarios
    FOR ALL USING (auth.uid() = user_id);

-- Verificar se a política não tem recursão
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
```

### **3. VINCULAR USUÁRIO EXISTENTE**

Após criar no Auth, execute:

```sql
-- Atualizar user_id na tabela usuarios
UPDATE usuarios 
SET user_id = '[NOVO_UUID_DO_SUPABASE_AUTH]'
WHERE email = 'ricardo.nilton@hotmail.com';
```

---

## 🔄 **REFATORAÇÃO DO CÓDIGO**

### **1. Simplificar Sistema de Auth**

**Arquivo:** `backend/modules/auth/services.py`

Substituir o método `_get_user_data` por:

```python
async def _get_user_data(self, user_id: str) -> Dict[str, Any]:
    """Busca dados do usuário - VERSÃO SIMPLIFICADA"""
    try:
        # Buscar APENAS na tabela usuarios
        result = self.supabase_admin.table('usuarios').select('*').eq('user_id', user_id).single().execute()
        
        if result.data:
            user_data = result.data
            return {
                'nome': user_data.get('nome'),
                'email': user_data.get('email'),
                'perfil': user_data.get('perfil', 'USER'),
                'ativo': user_data.get('ativo', True),
                'funcao': 'Usuário',
                'loja_id': None,  # Por enquanto
                'loja_nome': None,
                'empresa_id': None,
                'empresa_nome': None,
            }
        else:
            raise NotFoundException(f"Usuário não encontrado: {user_id}")
    
    except Exception as e:
        logger.error(f"Erro ao buscar usuário {user_id}: {str(e)}")
        raise NotFoundException(f"Usuário não encontrado: {user_id}")
```

### **2. Corrigir core/auth.py**

**Arquivo:** `backend/core/auth.py`

Substituir a função `get_current_user` por:

```python
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Dependency que extrai usuário do token JWT - VERSÃO SIMPLIFICADA"""
    token = credentials.credentials
    token_data = verify_token(token)
    
    # Busca dados do usuário na tabela usuarios
    supabase = get_supabase()
    
    try:
        result = supabase.admin.table('usuarios').select('*').eq('user_id', token_data.sub).single().execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        
        user_data = result.data
        
        user = User(
            id=token_data.sub,
            email=user_data.get('email', ''),
            perfil=user_data.get('perfil', 'USER'),
            loja_id=None,  # Simplificado por enquanto
            empresa_id=None,
            nome=user_data.get('nome'),
            ativo=user_data.get('ativo', True),
            metadata={}
        )
        
        if not user.ativo:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuário inativo"
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao buscar usuário: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar dados do usuário"
        )
```

---

## 🧪 **TESTAR O SISTEMA**

Após aplicar as correções:

1. **Testar login:**
   ```bash
   cd frontend
   npm run dev
   # Acessar http://localhost:3000/login
   # Tentar login com ricardo.nilton@hotmail.com
   ```

2. **Verificar backend:**
   ```bash
   cd backend
   python main.py
   # Acessar http://localhost:8000/docs
   ```

---

## 📋 **PRÓXIMOS PASSOS (DEPOIS DE FUNCIONAR)**

1. **Integrar com cad_equipe**: Vincular funcionários aos usuários do Auth
2. **Implementar lojas**: Adicionar sistema de lojas
3. **Melhorar RLS**: Políticas mais sofisticadas
4. **Sistema de permissões**: Baseado em perfis

---

## 🎯 **RESULTADO ESPERADO**

Após essas correções:
- ✅ Login funcionando
- ✅ Usuário autenticado
- ✅ Tabela de clientes acessível
- ✅ Sistema estável

**Tempo estimado:** 30-45 minutos para aplicar todas as correções. 