# 📋 GUIA COMPLETO DE INTEGRAÇÃO DAS TABELAS - FLUYT COMERCIAL

Este documento define **todos os aspectos necessários** para integrar as demais tabelas do sistema, usando a tabela **Clientes** como modelo de referência perfeito.

---

## 🎯 **OBJETIVO**

Criar um **padrão consistente** para integração de todas as tabelas, garantindo:
- **Conectividade completa:** Frontend ↔ Backend ↔ Supabase
- **Hierarquia de dados** respeitada
- **Autenticação e autorização** adequadas
- **Código limpo e manutenível**
- **Escalabilidade** para futuras tabelas

---

## 📊 **MAPEAMENTO COMPLETO DAS TABELAS**

### **🔵 TABELAS PRINCIPAIS (Alta Prioridade)**
1. **`cad_empresas`** - Empresas do sistema
2. **`c_lojas`** - Lojas das empresas
3. **`cad_equipe`** - Funcionários/Equipe
4. **`cad_setores`** - Setores organizacionais
5. **`cad_procedencias`** - Origem dos clientes
6. **`cad_montadores`** - Prestadores de montagem
7. **`cad_transportadoras`** - Empresas de transporte

### **🟡 TABELAS DE CONFIGURAÇÃO (Média Prioridade)**
8. **`config_loja`** - Configurações por loja
9. **`config_status_orcamento`** - Status dos orçamentos
10. **`config_regras_comissao_faixa`** - Regras de comissão

### **🟢 TABELAS OPERACIONAIS (Baixa Prioridade Inicial)**
11. **`c_orcamentos`** - Orçamentos
12. **`c_ambientes`** - Ambientes dos orçamentos
13. **`c_contratos`** - Contratos gerados
14. **`c_aprovacao_historico`** - Histórico de aprovações

---

## 🏗️ **ARQUITETURA PADRÃO DE INTEGRAÇÃO**

### **📁 ESTRUTURA DE ARQUIVOS (Para cada tabela)**

```
Backend:
├── modules/
│   └── [nome_tabela]/
│       ├── __init__.py
│       ├── controller.py      # Endpoints da API
│       ├── services.py        # Lógica de negócio
│       ├── repository.py      # Acesso aos dados
│       └── schemas.py         # Validação de dados

Frontend:
├── src/
│   ├── components/modulos/[nome_tabela]/
│   │   ├── [tabela]-page.tsx        # Página principal
│   │   ├── [tabela]-form.tsx        # Formulário
│   │   ├── [tabela]-table.tsx       # Tabela de listagem
│   │   └── [tabela]-actions.tsx     # Ações (editar, excluir)
│   ├── hooks/modulos/[nome_tabela]/
│   │   ├── use-[tabela]-api.ts      # Hook principal da API
│   │   └── use-[tabela]-form.ts     # Hook do formulário
│   ├── types/
│   │   └── [tabela].ts              # Tipos TypeScript
│   └── services/
│       └── [tabela]-service.ts      # Serviço de API
```

---

## 🔐 **AUTENTICAÇÃO E HIERARQUIA**

### **NÍVEIS DE ACESSO POR PERFIL**

```typescript
SUPER_ADMIN:
  - Acesso total a todas as tabelas
  - Pode ver dados de todas as lojas/empresas
  - loja_id = null (sem filtro)

ADMIN:
  - Acesso a dados da empresa
  - Filtrado por empresa_id
  
GERENTE:
  - Acesso a dados da loja
  - Filtrado por loja_id
  
VENDEDOR:
  - Acesso limitado (só seus dados)
  - Filtrado por loja_id + user_id
```

### **IMPLEMENTAÇÃO NO BACKEND**

```python
# services.py - Padrão para todas as tabelas
async def listar_[tabela](self, user: User, filtros, pagination):
    # Hierarquia de acesso
    if user.perfil == "SUPER_ADMIN":
        filtro_hierarquia = None  # Vê tudo
    elif user.perfil == "ADMIN":
        filtro_hierarquia = {"empresa_id": user.empresa_id}
    elif user.perfil == "GERENTE":
        filtro_hierarquia = {"loja_id": user.loja_id}
    else:
        filtro_hierarquia = {"loja_id": user.loja_id, "user_id": user.id}
    
    return await repository.listar(filtro_hierarquia, filtros, pagination)
```

---

## 🗄️ **CONFIGURAÇÃO SUPABASE**

### **RLS (Row Level Security) - PADRÃO**

```sql
-- Para cada tabela, criar política baseada na hierarquia
CREATE POLICY "policy_[tabela]_select" ON public.[tabela]
FOR SELECT USING (
  CASE 
    WHEN auth.jwt() ->> 'perfil' = 'SUPER_ADMIN' THEN true
    WHEN auth.jwt() ->> 'perfil' = 'ADMIN' THEN 
      empresa_id = (auth.jwt() ->> 'empresa_id')::uuid
    WHEN auth.jwt() ->> 'perfil' = 'GERENTE' THEN 
      loja_id = (auth.jwt() ->> 'loja_id')::uuid
    ELSE 
      loja_id = (auth.jwt() ->> 'loja_id')::uuid 
      AND created_by = (auth.jwt() ->> 'user_id')::uuid
  END
);
```

### **RELACIONAMENTOS OBRIGATÓRIOS**

```sql
-- Toda tabela deve ter:
ALTER TABLE [tabela] ADD COLUMN IF NOT EXISTS loja_id UUID REFERENCES c_lojas(id);
ALTER TABLE [tabela] ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE [tabela] ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE [tabela] ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
```

---

## 🎨 **FRONTEND - PADRÕES DE COMPONENTES**

### **HOOK PRINCIPAL (use-[tabela]-api.ts)**

```typescript
export const use[Tabela]Api = () => {
  const [data, setData] = useState<[Tabela][]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const listar = async (filtros?: Filtros[Tabela]) => {
    setLoading(true);
    try {
      const response = await [tabela]Service.listar(filtros);
      setData(response.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const criar = async (dados: [Tabela]Create) => {
    // Implementação padrão
  };
  
  const atualizar = async (id: string, dados: [Tabela]Update) => {
    // Implementação padrão
  };
  
  const excluir = async (id: string) => {
    // Implementação padrão
  };
  
  return { data, loading, error, listar, criar, atualizar, excluir };
};
```

### **COMPONENTE DE PÁGINA ([tabela]-page.tsx)**

```typescript
export const [Tabela]Page = () => {
  const { data, loading, listar, criar, atualizar, excluir } = use[Tabela]Api();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<[Tabela] | null>(null);
  
  useEffect(() => {
    listar();
  }, []);
  
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="[Nome da Tabela]"
        subtitle="Gerenciamento de [descrição]"
        action={
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo [Item]
          </Button>
        }
      />
      
      {showForm && (
        <[Tabela]Form 
          item={editingItem}
          onSave={(dados) => editingItem ? atualizar(editingItem.id, dados) : criar(dados)}
          onCancel={() => {setShowForm(false); setEditingItem(null);}}
        />
      )}
      
      <[Tabela]Table 
        data={data}
        loading={loading}
        onEdit={(item) => {setEditingItem(item); setShowForm(true);}}
        onDelete={excluir}
      />
    </div>
  );
};
```

---

## 🔄 **FLUXO DE DADOS PADRÃO**

### **1. LISTAGEM**
```
Frontend: use[Tabela]Api.listar()
    ↓
Backend: [Tabela]Controller.listar()
    ↓
Backend: [Tabela]Service.listar() (aplica hierarquia)
    ↓
Backend: [Tabela]Repository.listar() (consulta SQL)
    ↓
Supabase: SELECT com RLS aplicado
    ↓
Frontend: Atualiza estado e renderiza
```

### **2. CRIAÇÃO**
```
Frontend: Formulário → use[Tabela]Api.criar()
    ↓
Backend: [Tabela]Controller.criar() (valida dados)
    ↓
Backend: [Tabela]Service.criar() (aplica regras de negócio)
    ↓
Backend: [Tabela]Repository.criar() (INSERT)
    ↓
Supabase: Insere com user_id e loja_id automáticos
    ↓
Frontend: Atualiza lista e fecha formulário
```

---

## 📋 **CHECKLIST DE INTEGRAÇÃO**

### **🗄️ SUPABASE**
- [ ] Tabela criada com campos obrigatórios
- [ ] RLS habilitado e políticas configuradas
- [ ] Relacionamentos (FKs) criados
- [ ] Índices de performance adicionados
- [ ] Triggers de auditoria (se necessário)

### **🔧 BACKEND**
- [ ] Módulo criado com estrutura padrão
- [ ] Schemas com validações adequadas
- [ ] Repository com queries otimizadas
- [ ] Services com lógica de negócio e hierarquia
- [ ] Controller com endpoints RESTful
- [ ] Testes unitários básicos

### **🎨 FRONTEND**
- [ ] Tipos TypeScript definidos
- [ ] Hook de API implementado
- [ ] Serviço de API criado
- [ ] Componentes de página, form e tabela
- [ ] Integração com sistema de navegação
- [ ] Validações de formulário
- [ ] Estados de loading e erro

### **🔐 SEGURANÇA**
- [ ] Autenticação obrigatória
- [ ] Autorização por perfil implementada
- [ ] Validação de dados no backend
- [ ] Logs de auditoria (se necessário)
- [ ] Rate limiting (se necessário)

---

## 🚀 **ORDEM DE IMPLEMENTAÇÃO RECOMENDADA**

### **FASE 1: ESTRUTURA BASE**
1. **`cad_empresas`** - Base da hierarquia
2. **`c_lojas`** - Dependente de empresas
3. **`cad_setores`** - Independente, simples

### **FASE 2: RECURSOS HUMANOS**
4. **`cad_equipe`** - Funcionários
5. **`cad_procedencias`** - Origem dos clientes

### **FASE 3: PRESTADORES**
6. **`cad_montadores`** - Prestadores de montagem
7. **`cad_transportadoras`** - Empresas de transporte

### **FASE 4: CONFIGURAÇÕES**
8. **`config_loja`** - Configurações por loja
9. **`config_status_orcamento`** - Status dos orçamentos
10. **`config_regras_comissao_faixa`** - Regras de comissão

---

## 📝 **OBSERVAÇÕES IMPORTANTES**

### **PADRÕES DE NOMENCLATURA**
- **Tabelas:** `snake_case` (ex: `cad_empresas`)
- **Componentes:** `PascalCase` (ex: `EmpresaPage`)
- **Hooks:** `camelCase` com prefixo `use` (ex: `useEmpresasApi`)
- **Arquivos:** `kebab-case` (ex: `empresa-page.tsx`)

### **VALIDAÇÕES**
- **Backend:** Sempre validar dados recebidos
- **Frontend:** Validar antes de enviar
- **Supabase:** Constraints de banco como última barreira

### **PERFORMANCE**
- **Paginação:** Implementar em todas as listagens
- **Filtros:** Indexar campos filtráveis
- **Cache:** Considerar cache para dados estáticos

### **MANUTENIBILIDADE**
- **Código simples:** Priorizar legibilidade
- **Reutilização:** Componentes genéricos quando possível
- **Documentação:** Comentar lógicas complexas
- **Testes:** Cobrir cenários principais

---

## 🎯 **RESULTADO ESPERADO**

Ao seguir este guia, cada tabela integrada terá:

✅ **Conectividade total** Frontend ↔ Backend ↔ Supabase
✅ **Hierarquia respeitada** conforme perfil do usuário
✅ **Interface consistente** e intuitiva
✅ **Código limpo** e manutenível
✅ **Segurança adequada** com autenticação/autorização
✅ **Performance otimizada** com paginação e filtros
✅ **Escalabilidade** para futuras funcionalidades

**A tabela Clientes serve como modelo perfeito** - todas as demais devem seguir exatamente os mesmos padrões e estruturas implementados nela.
