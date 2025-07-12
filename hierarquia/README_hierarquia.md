# 🔐 README: Sistema de Níveis de Acesso RLS - Fluyt Comercial

## 📋 **VISÃO GERAL**

Este documento define o sistema completo de Row Level Security (RLS) e controle de acesso por perfis para o Sistema Fluyt. O objetivo é garantir isolamento total de dados por loja/empresa e controle granular de permissões por perfil de usuário.

## 🎯 **HIERARQUIA DE ACESSO DEFINIDA**

### **Perfis de Usuário:**
- **VENDEDOR:** Acesso apenas aos próprios dados (clientes/orçamentos criados por ele)
- **GERENTE:** Acesso a todos os dados da sua loja
- **DONO_LOJA:** Acesso a todos os dados da sua empresa (múltiplas lojas)
- **DEVELOPER:** Acesso total ao sistema (debug/suporte)

### **Regras de Visibilidade:**
- **Vendedor:** NÃO vê orçamentos de outros vendedores da mesma loja
- **Dono:** PODE modificar configurações de todas as suas lojas
- **Campos Sensíveis:** Apenas DEVELOPER vê custos reais e margem de lucro

## 🗄️ **ESTRUTURA DE DADOS NECESSÁRIA**

### **Tabela `cad_equipe` - Campos Obrigatórios:**
```sql
-- Campos de controle de acesso
empresa_id uuid REFERENCES cad_empresas(id)  -- Vinculação à empresa
is_owner boolean DEFAULT false               -- Se é dono da empresa
is_developer boolean DEFAULT false           -- Se é developer do sistema

-- Perfis válidos no enum
perfil_usuario: VENDEDOR | GERENTE | DONO_LOJA | DEVELOPER
```

### **Tabelas de Dados - Campos de Rastreamento:**
```sql
-- c_clientes e c_orcamentos DEVEM ter:
vendedor_criador_id uuid REFERENCES cad_equipe(id)  -- Quem criou o registro
loja_id uuid REFERENCES c_lojas(id)                 -- Loja do registro

-- Todas as tabelas principais DEVEM ter:
loja_id uuid REFERENCES c_lojas(id)  -- Para isolamento por loja
```

## 🔒 **SISTEMA RLS (ROW LEVEL SECURITY)**

### **Funções Helper Obrigatórias:**
```sql
-- Estas funções DEVEM existir no banco:
get_user_perfil() RETURNS perfil_usuario          -- Perfil do usuário atual
get_user_loja() RETURNS uuid                      -- Loja do usuário atual
get_user_empresa() RETURNS uuid                   -- Empresa do usuário atual
is_user_owner() RETURNS boolean                   -- Se é dono
is_user_developer() RETURNS boolean               -- Se é developer
can_see_costs() RETURNS boolean                   -- Se pode ver custos
can_approve_unlimited() RETURNS boolean           -- Se pode aprovar sem limite
```

### **Políticas RLS por Tabela:**

#### **c_clientes:**
- **VENDEDOR:** `WHERE vendedor_criador_id = auth.uid()`
- **GERENTE:** `WHERE loja_id = get_user_loja()`
- **DONO_LOJA:** `WHERE loja_id IN (lojas da empresa)`
- **DEVELOPER:** Sem filtro (acesso total)

#### **c_orcamentos:**
- Mesma lógica de `c_clientes`
- Campo `vendedor_criador_id` sempre preenchido no INSERT
- Campos sensíveis (custos/margem) protegidos no backend

#### **Demais Tabelas:**
- **config_loja, c_ambientes:** Filtro por loja/empresa
- **cad_equipe:** Usuário vê a si mesmo + hierarquia conforme perfil
- **Tabelas de relacionamento:** Herdam políticas das tabelas principais

## 🛠️ **IMPLEMENTAÇÃO BACKEND**

### **Middleware de Autenticação:**
```python
# Classe UserContext DEVE conter:
class UserContext:
    id: str                    # ID do usuário
    perfil: str               # VENDEDOR|GERENTE|DONO_LOJA|DEVELOPER
    loja_id: str              # Loja do usuário
    empresa_id: str           # Empresa do usuário
    is_owner: bool            # Se é dono
    is_developer: bool        # Se é developer
    
    # Propriedades calculadas:
    can_see_costs: bool       # Apenas DEVELOPER
    can_approve_unlimited: bool # DONO_LOJA e DEVELOPER
    access_scope: str         # PROPRIO|LOJA|EMPRESA|GLOBAL
```

### **Dependency Injection:**
```python
# Função obrigatória para controllers:
async def get_user_context(request: Request) -> UserContext
    # Busca dados completos do usuário autenticado
    # Valida token JWT no Supabase
    # Retorna UserContext populado
```

### **Proteção de Campos Sensíveis:**
```python
# Campos que DEVEM ser protegidos:
sensitive_fields = [
    "custo_fabrica",
    "comissao_vendedor", 
    "comissao_gerente",
    "custo_medidor",
    "custo_montador",
    "custo_frete",
    "margem_lucro"
]

# Lógica obrigatória nos controllers:
if user.can_see_costs:
    # Incluir campos sensíveis na query
else:
    # Excluir campos sensíveis da resposta
```

### **Decorators de Permissão:**
```python
# Decorators obrigatórios:
@require_permission("see_costs")     # Apenas para quem pode ver custos
@require_permission("approve_unlimited")  # Apenas para aprovação master

# Uso nos endpoints:
@router.get("/relatorios/margem")
@require_permission("see_costs")
async def relatorio_margem(user: UserContext = Depends(get_user_context))
```

## 🎨 **IMPLEMENTAÇÃO FRONTEND**

### **Context de Usuário:**
```typescript
// Interface obrigatória:
interface UserContext {
  id: string
  perfil: 'VENDEDOR' | 'GERENTE' | 'DONO_LOJA' | 'DEVELOPER'
  loja_id: string
  empresa_id: string
  can_see_costs: boolean
  can_approve_unlimited: boolean
  access_scope: 'PROPRIO' | 'LOJA' | 'EMPRESA' | 'GLOBAL'
}

// Provider obrigatório:
const UserProvider = ({ children }) => {
  // Busca dados do usuário na API
  // Calcula permissões baseado no perfil
  // Disponibiliza context para toda aplicação
}
```

### **Componentes Condicionais:**
```typescript
// Lógica obrigatória em componentes:
const { user } = useUser()

// Mostrar campos sensíveis apenas se autorizado:
{user.can_see_costs && (
  <div>Margem: {orcamento.margem_lucro}</div>
)}

// Botões de ação baseados em permissão:
{user.can_approve_unlimited && (
  <button>Aprovar Sem Limite</button>
)}
```

### **Proteção de Rotas:**
```typescript
// Middleware obrigatório:
const ProtectedRoute = ({ children, requiredPermission }) => {
  const { user } = useUser()
  
  if (!user.permissions[requiredPermission]) {
    return <UnauthorizedPage />
  }
  
  return children
}
```

## 🔍 **REGRAS DE NEGÓCIO CRÍTICAS**

### **Criação de Registros:**
- **c_clientes:** `vendedor_criador_id` SEMPRE = usuário logado
- **c_orcamentos:** `vendedor_criador_id` SEMPRE = usuário logado
- **loja_id:** SEMPRE = loja do usuário (exceto DEVELOPER)

### **Aprovações:**
- **Baseado em limite individual:** Não hierarquia automática
- **Fluxo:** Vendedor → Gerente → Dono (conforme limite de desconto)
- **Admin Master:** Pode aprovar qualquer valor sem limite

### **Relatórios:**
- **Vendedor:** Dashboard básico sem custos
- **Gerente:** Métricas da loja + suas comissões
- **Dono:** Relatórios completos da empresa
- **Developer:** Acesso total incluindo custos reais

### **Configurações:**
- **Vendedor:** Apenas visualização das próprias
- **Gerente:** Pode ajustar configurações da loja
- **Dono:** Pode configurar todas as suas lojas
- **Developer:** Acesso total a todas configurações

## 🚨 **VALIDAÇÕES OBRIGATÓRIAS**

### **Testes de Isolamento:**
1. **Vendedor A** não pode ver clientes do **Vendedor B** (mesma loja)
2. **Gerente Loja A** não pode ver dados da **Loja B**
3. **Dono Empresa A** não pode ver dados da **Empresa B**
4. **Developer** pode ver todos os dados do sistema

### **Testes de Permissão:**
1. **Vendedor** não consegue acessar endpoints de custos
2. **Gerente** não consegue aprovar acima do seu limite
3. **Campos sensíveis** não aparecem na resposta para perfis não autorizados
4. **Tentativa de acesso** gera log de auditoria

### **Testes de Integridade:**
1. **INSERT** sempre preenche `vendedor_criador_id` corretamente
2. **RLS** funciona mesmo com queries diretas no banco
3. **Funções helper** retornam dados corretos para cada usuário
4. **Token expirado** é rejeitado corretamente

## 📊 **LOGS E AUDITORIA**

### **Eventos que DEVEM ser logados:**
- Tentativas de acesso negado
- Aprovações de orçamentos
- Mudanças de configuração
- Acesso a relatórios sensíveis
- Login/logout de usuários

### **Estrutura de Log:**
```json
{
  "timestamp": "ISO_DATE",
  "user_id": "UUID",
  "user_perfil": "PERFIL",
  "action": "ACAO_REALIZADA", 
  "resource": "RECURSO_ACESSADO",
  "result": "SUCCESS|DENIED|ERROR",
  "ip_address": "IP",
  "user_agent": "BROWSER_INFO"
}
```

## ⚡ **PERFORMANCE E OTIMIZAÇÃO**

### **Índices Obrigatórios:**
```sql
-- Para performance das consultas RLS:
CREATE INDEX idx_clientes_vendedor_criador ON c_clientes(vendedor_criador_id);
CREATE INDEX idx_clientes_loja ON c_clientes(loja_id);
CREATE INDEX idx_orcamentos_vendedor_criador ON c_orcamentos(vendedor_criador_id);
CREATE INDEX idx_orcamentos_loja ON c_orcamentos(loja_id);
CREATE INDEX idx_equipe_empresa ON cad_equipe(empresa_id);
```

### **Otimizações:**
- **Funções STABLE:** Todas as helper functions marcadas como STABLE
- **Cache de contexto:** UserContext cacheado por request
- **Queries otimizadas:** SELECT apenas campos necessários
- **Connection pooling:** Configurado no Supabase

## 🔄 **EVOLUÇÃO FUTURA**

### **Funcionalidades Planejadas:**
- **Masking de usuário:** Developer assumir identidade temporariamente
- **Perfis granulares:** Sub-gerentes, coordenadores
- **Auditoria avançada:** Timeline completo de ações
- **Relatórios de acesso:** Quem acessou o quê e quando

### **Preparação da Arquitetura:**
- **Estrutura extensível:** Novos perfis sem quebrar RLS existente
- **Configuração flexível:** Permissões por feature/módulo
- **API versionada:** Mudanças não quebram integrações

## ✅ **CRITÉRIOS DE ACEITE**

### **Para considerar implementação completa:**
1. **RLS ativo** em todas as tabelas principais
2. **Funções helper** funcionando corretamente
3. **Middleware backend** aplicando permissões
4. **Frontend** respeitando níveis de acesso
5. **Testes de isolamento** passando 100%
6. **Logs de auditoria** funcionando
7. **Performance** adequada (< 100ms queries RLS)
8. **Documentação** de API atualizada

### **Validação Final:**
- Criar usuários de cada perfil
- Testar cenários de acesso/negação
- Verificar logs de auditoria
- Validar performance em produção
- Confirmar isolamento entre empresas/lojas

---

**Este documento serve como especificação completa para implementação do sistema de níveis de acesso. Toda funcionalidade deve seguir estas diretrizes para garantir segurança e consistência.**