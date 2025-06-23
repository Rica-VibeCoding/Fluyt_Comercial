# 🟢 ESSENCIAL - CONTEXTO DO PROJETO FLUYT

## 🎯 **O QUE É O PROJETO FLUYT**

**Sistema comercial completo para lojas de móveis planejados**
- Gestão de clientes, orçamentos e contratos
- Multi-loja com hierarquia (matriz/filiais)
- Cálculos complexos de comissões e financiamento

## 👨‍💼 **QUEM É RICARDO**

- **Empresário** do ramo de móveis planejados
- **NÃO é desenvolvedor** - precisa de código simples e comentado
- **Objetivo:** Sistema profissional que funcione de verdade
- **Pet peeve:** Dados mock/falsos em produção

## 🛠️ **STACK TECNOLÓGICA**

```
├── Frontend: Next.js 14 + TypeScript + Tailwind + Shadcn
├── Backend: FastAPI + Python + Pydantic
├── Banco: Supabase (PostgreSQL) + Row Level Security
├── Auth: JWT + Supabase Auth
└── MCP: Ferramenta para acessar Supabase direto
```

## 📊 **TABELAS PRINCIPAIS NO SUPABASE**

| Tabela | Descrição | ⚠️ Atenção |
|--------|-----------|------------|
| `cad_empresas` | Empresas matriz | ID numérico |
| `c_lojas` | Lojas/filiais | UUID |
| `c_clientes` | Clientes | UUID |
| `cad_equipe` | Funcionários | NÃO é "funcionarios"! |
| `cad_procedencias` | Origem dos clientes | UUID |
| `c_orcamentos` | Orçamentos | UUID |
| `c_ambientes` | Ambientes dos orçamentos | UUID |

**🚨 CRÍTICO:** Nomes NÃO seguem padrão único! (`cad_` vs `c_`)

## 🎯 **REGRAS FUNDAMENTAIS DO RICARDO**

### **1. LINGUAGEM SIMPLES** 🗣️
```python
# ✅ BOM: Verifica se usuário pode acessar loja
# ❌ RUIM: Permission validator for store access control
```

### **2. COMENTÁRIOS OBRIGATÓRIOS EM PT-BR** 📝
```python
# TODO código deve ter comentários explicando o que faz
def calcular_comissao(venda):
    # Vendedor ganha 3.5% sobre vendas
    return venda * 0.035
```

### **3. TRANSPARÊNCIA TOTAL** 🔍
- Explique quando não souber algo
- Mostre o que está fazendo
- Avise sobre possíveis problemas

### **4. SEM COMPLEXIDADE DESNECESSÁRIA** 🚫
```python
# ❌ RUIM: Lambda complexa
calc = lambda x: reduce(operator.add, map(lambda y: y*0.035, x))

# ✅ BOM: Função clara
def calcular_total_comissoes(vendas):
    return sum(venda * 0.035 for venda in vendas)
```

### **5. SEMPRE VERIFICAR ESTRUTURAS** 🔍
```python
# ❌ NUNCA ASSUMA:
tabela = "funcionarios"  # Pode não existir!

# ✅ SEMPRE VERIFIQUE:
# Use MCP para descobrir nome real da tabela
```

### **6. ZERO DADOS MOCK/FALSOS** 🚨
```typescript
// ❌ PROIBIDO EM PRODUÇÃO:
const mockUsers = [{id: 1, name: "Teste"}]

// ✅ APENAS DADOS REAIS:
const users = await apiClient.getUsers()
```

### **7. ALINHAMENTO FRONTEND ↔ BACKEND** 🔄
- Frontend usa camelCase: `lojaId`
- Backend usa snake_case: `loja_id`
- API deve converter entre os dois

## 🚨 **PROBLEMA MAIS COMUM**

**Assumir nomes de tabelas/campos sem verificar:**

```typescript
// ❌ DESENVOLVEDOR ASSUME:
interface Funcionario {
  setor: string;  // Assumiu que é string
}

// ✅ REALIDADE NO BANCO:
{
  setor_id: "uuid-123"  // É UUID, não string!
}
```

**SOLUÇÃO:** Sempre use MCP para descobrir estrutura real primeiro!

## 📁 **ESTRUTURA DE ARQUIVOS DO PROJETO**

```
/Fluyt_Comercial/
├── 🟢0- Claude_Code_INDICE.md        (este guia)
├── 🟢1A- Claude_Code_ESSENCIAL.md    (você está aqui)
├── 🟢1B- Claude_Code_DESCOBERTA_MCP.md
├── 🟢1C- Claude_Code_MISSOES.md
├── 🟢1D- Claude_Code_COMANDOS.md
├── 04_MISSÕES_ATIVAS.md              (controle de tarefas)
├── Frontend/                          (Next.js)
└── backend/                           (FastAPI)
```

## ✅ **PRÓXIMO PASSO**

Agora leia: **[🟢1B- Claude_Code_DESCOBERTA_MCP.md](./🟢1B-%20Claude_Code_DESCOBERTA_MCP.md)**

---

**Tempo de leitura:** ~5 minutos  
**Criticidade:** OBRIGATÓRIA para todos os Claudes