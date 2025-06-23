---
id: T02_FRONTEND_EQUIPE
modulo: Equipe
responsavel: frontend
depends_on: [T01_BACKEND_EQUIPE]  # ⚠️ AGUARDAR BACKEND!
blocks: []
can_parallel: [T03_API_EQUIPE]
status: pending
order: 2
expected_output:
  - Componentes funcionando com API real
  - Zero dados mock no projeto
  - Integração completa com backend
coverage_min: 90

# 🚨 ESQUEMA VALIDADO COM RICARDO
tabela_real: cad_equipe
nome_exibicao: Funcionários/Equipe

# MAPEAMENTO OBRIGATÓRIO Frontend → Backend
campos_conversao:
  # Frontend (camelCase) → Backend (snake_case)
  nome: nome
  email: email
  telefone: telefone
  lojaId: loja_id
  setorId: setor_id  # ⚠️ MUDANÇA: Agora é ID, não nome!
  salario: salario
  dataAdmissao: data_admissao
  nivelAcesso: nivel_acesso
  tipoFuncionario: perfil  # ⚠️ NOME DIFERENTE!
  
# LÓGICA ESPECIAL PARA COMISSÃO
comissao_logica: |
  // Frontend envia campo único 'comissao'
  // Backend espera campos separados:
  if (formData.tipoFuncionario === 'VENDEDOR') {
    payload.comissao_percentual_vendedor = formData.comissao;
  } else if (formData.tipoFuncionario === 'GERENTE') {
    payload.comissao_percentual_gerente = formData.comissao;
  }

# CAMPOS QUE NÃO EXISTEM NO BANCO
campos_remover:
  - performance  # Calcular no frontend se necessário
  - configuracoes  # Converter para campos separados

# AJUSTES UI/UX NECESSÁRIOS
ajustes_componentes:
  - Campo setor deve enviar ID, não nome
  - Remover campo performance da tabela
  - Mapear configurações para campos do banco
---

# 🎨 Missão Frontend: Módulo Equipe

## 🚨 **STATUS DE DEPENDÊNCIAS**

❌ **NÃO POSSO COMEÇAR AINDA**  
⏳ **AGUARDANDO:** Backend estar ✅ no `04_MISSÕES_ATIVAS.md`  
🤝 **POSSO EXECUTAR JUNTO COM:** API (após backend pronto)

## 📋 **ENQUANTO AGUARDO BACKEND:**
- [ ] Revisar componentes existentes do módulo equipe
- [ ] Estudar padrões usados em clientes/empresas
- [ ] Preparar ambiente de desenvolvimento
- [ ] Identificar todos os locais com dados mock

**Ricardo, o Backend já está pronto para eu começar?**

## 🎯 **OBJETIVO**
**ELIMINAR** todos os dados mock do módulo equipe e **INTEGRAR** com a API real do backend, ajustando os componentes para enviar dados no formato correto esperado pela tabela `cad_equipe`.

## 🚨 **PROBLEMA CRÍTICO DETECTADO**
**VIOLAÇÃO GRAVE da Regra #6 do Ricardo:** "DADOS REAIS - ZERO MOCK"

**Dados mock encontrados em:**
- ✅ `/hooks/modulos/sistema/equipe/mock-data.ts` - JÁ DELETADO!
- ✅ `/hooks/modulos/sistema/use-equipe.ts` - JÁ LIMPO!
- ⚠️ Verificar se há outros imports de mock

## ⚠️ **PROCESSO OBRIGATÓRIO - APRESENTAR PLANO ANTES**

**NÃO COMECE A CODIFICAR!** Primeiro apresente seu plano detalhado em etapas para aprovação do Ricardo.

## 🎯 **PLANO DE EXECUÇÃO EM ETAPAS**

### **ETAPA 1: LIMPEZA E ANÁLISE**
- [ ] Verificar se há resquícios de dados mock
- [ ] Analisar o hook `use-equipe.ts` já limpo
- [ ] Mapear todos os componentes que usam equipe:
  - [ ] `funcionario-form.tsx`
  - [ ] `funcionario-table.tsx`
  - [ ] `gestao-equipe.tsx`
- [ ] Identificar incompatibilidades com backend

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 2: AJUSTAR CAMPO SETOR** 🚨
**CRÍTICO: Campo setor deve enviar ID, não nome!**

- [ ] Em `funcionario-form.tsx` (linha ~192-207):
  ```tsx
  // ❌ ERRADO (atual):
  <SelectItem key={setor.id} value={setor.nome}>
  
  // ✅ CORRETO:
  <SelectItem key={setor.id} value={setor.id}>
  ```
- [ ] Ajustar tipo no `FuncionarioFormData`:
  ```tsx
  // Mudar de:
  setor: string  // nome
  // Para:
  setorId: string  // UUID
  ```
- [ ] Verificar se há outros lugares usando setor incorretamente

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 3: INTEGRAR COM API REAL**
- [ ] Verificar se `apiClient` já tem métodos para equipe
- [ ] Se não, adicionar em `/services/api-client.ts`:
  ```typescript
  // Endpoints de funcionários
  async listarFuncionarios(filtros?: any) {
    return this.request<ApiListResponse<Funcionario>>('/funcionarios', {
      method: 'GET',
      params: filtros
    });
  }
  
  async criarFuncionario(dados: FuncionarioFormData) {
    // Conversão de nomenclatura aqui!
    const payload = this.converterParaBackend(dados);
    return this.request<Funcionario>('/funcionarios', {
      method: 'POST',
      data: payload
    });
  }
  ```
- [ ] Implementar conversões de nomenclatura

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 4: AJUSTAR COMPONENTES**
- [ ] **funcionario-form.tsx**:
  - [ ] Campo setor enviar ID
  - [ ] Remover configurações como objeto
  - [ ] Mapear para campos separados do banco
  
- [ ] **funcionario-table.tsx**:
  - [ ] Remover coluna performance (não existe no banco)
  - [ ] Ajustar badges para usar `perfil` ao invés de `tipoFuncionario`
  
- [ ] **gestao-equipe.tsx**:
  - [ ] Garantir que usa hook correto
  - [ ] Verificar se precisa ajustes

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 5: CONVERSÕES E VALIDAÇÕES**
- [ ] Criar função de conversão Frontend → Backend:
  ```typescript
  const converterParaBackend = (dados: FuncionarioFormData) => {
    const payload: any = {
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone,
      loja_id: dados.lojaId,  // camelCase → snake_case
      setor_id: dados.setorId,  // ID, não nome!
      perfil: dados.tipoFuncionario,  // nome diferente!
      nivel_acesso: dados.nivelAcesso,
      salario: dados.salario,
      data_admissao: dados.dataAdmissao,
    };
    
    // Lógica especial para comissão
    if (dados.tipoFuncionario === 'VENDEDOR') {
      payload.comissao_percentual_vendedor = dados.comissao;
    } else if (dados.tipoFuncionario === 'GERENTE') {
      payload.comissao_percentual_gerente = dados.comissao;
    }
    
    // Mapear configurações para campos separados
    if (dados.configuracoes) {
      payload.limite_desconto = dados.configuracoes.limiteDesconto;
      payload.valor_medicao = dados.configuracoes.valorMedicao;
      payload.valor_minimo_garantido = dados.configuracoes.minimoGarantido;
      payload.tem_minimo_garantido = !!dados.configuracoes.minimoGarantido;
    }
    
    return payload;
  };
  ```
- [ ] Aplicar em todas as chamadas da API

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 6: TESTES E VALIDAÇÃO**
- [ ] Testar criar funcionário
- [ ] Testar listar funcionários
- [ ] Testar editar funcionário
- [ ] Testar excluir (soft delete)
- [ ] Verificar se dados aparecem no Supabase
- [ ] Confirmar zero dados mock

**✅ ENTREGAR PARA VALIDAÇÃO FINAL**

## 📋 **TAREFAS DETALHADAS**

### **TAREFA 1: ELIMINAR DADOS MOCK** ✅
**Status:** JÁ CONCLUÍDO!
- ✅ Arquivo `mock-data.ts` deletado
- ✅ Hook `use-equipe.ts` limpo e integrado

### **TAREFA 2: CORRIGIR CAMPO SETOR** 🚨
**Local:** `/components/modulos/sistema/equipe/funcionario-form.tsx`

**Linha ~192-207 - MUDAR:**
```tsx
// ❌ ATUAL (salvando nome):
<Select
  value={formData.setor}
  onValueChange={(value) => handleChange('setor', value)}
>
  <SelectContent>
    {setores.map((setor) => (
      <SelectItem key={setor.id} value={setor.nome}>
        {setor.nome}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// ✅ CORRETO (salvando ID):
<Select
  value={formData.setorId}  // Mudou!
  onValueChange={(value) => handleChange('setorId', value)}  // Mudou!
>
  <SelectContent>
    {setores.map((setor) => (
      <SelectItem key={setor.id} value={setor.id}>  // Mudou!
        {setor.nome}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### **TAREFA 3: AJUSTAR TIPOS**
**Local:** `/types/sistema.ts`

```typescript
// Ajustar FuncionarioFormData:
export interface FuncionarioFormData {
  nome: string;
  email: string;
  telefone: string;
  setorId: string;  // ⚠️ MUDOU de 'setor' para 'setorId'!
  lojaId: string;
  salario: number;
  comissao: number;
  dataAdmissao: string;
  nivelAcesso: NivelAcesso;
  tipoFuncionario: TipoFuncionario;
  configuracoes?: {
    limiteDesconto?: number;
    valorMedicao?: number;
    minimoGarantido?: number;
  };
}
```

### **TAREFA 4: INTEGRAÇÃO COM API**
**Local:** `/services/api-client.ts`

Adicionar métodos se não existirem:
```typescript
// Funcionários/Equipe
async listarFuncionarios(filtros?: {
  busca?: string;
  perfil?: string;
  loja_id?: string;
  page?: number;
  limit?: number;
}) {
  return this.request<ApiListResponse<Funcionario>>('/funcionarios', {
    method: 'GET',
    params: filtros
  });
}

async obterFuncionario(id: string) {
  return this.request<Funcionario>(`/funcionarios/${id}`);
}

async criarFuncionario(dados: FuncionarioFormData) {
  const payload = converterFuncionarioParaBackend(dados);
  return this.request<Funcionario>('/funcionarios', {
    method: 'POST',
    data: payload
  });
}

async atualizarFuncionario(id: string, dados: FuncionarioFormData) {
  const payload = converterFuncionarioParaBackend(dados);
  return this.request<Funcionario>(`/funcionarios/${id}`, {
    method: 'PUT',
    data: payload
  });
}

async excluirFuncionario(id: string) {
  return this.request<void>(`/funcionarios/${id}`, {
    method: 'DELETE'
  });
}
```

### **TAREFA 5: REMOVER PERFORMANCE**
**Local:** `/components/modulos/sistema/equipe/funcionario-table.tsx`

Remover menções a performance (campo não existe no banco):
- Remover coluna de performance da tabela
- Remover badges/indicadores de performance
- Remover do tipo Funcionario se ainda existir

## 🧪 **CRITÉRIOS DE ACEITAÇÃO**

### ✅ **OBRIGATÓRIOS (CRÍTICOS):**
- [ ] **ZERO arquivos com dados mock** no projeto
- [ ] **ZERO importações** de mock-data
- [ ] Sistema funciona **APENAS** com dados da API real
- [ ] Campo setor envia **ID** não nome
- [ ] Nomenclaturas convertidas corretamente

### ✅ **FUNCIONAIS:**
- [ ] Listar funcionários carrega da API
- [ ] Criar funcionário salva no banco via API
- [ ] Editar funcionário atualiza via API
- [ ] Excluir funcionário faz soft delete via API
- [ ] Busca/filtros funcionam
- [ ] Loading states funcionam

### ✅ **VALIDAÇÕES:**
- [ ] Não permite funcionário sem loja
- [ ] Não permite email duplicado
- [ ] Setor deve existir (validação por ID)
- [ ] Formulário valida antes de enviar

## 🔧 **COMANDOS DE TESTE**

### **Verificar se há mock restante:**
```bash
# Deve retornar VAZIO:
grep -r "mock" Frontend/src/hooks/modulos/sistema/equipe/
grep -r "mockFuncionarios" Frontend/src/
```

### **Testar Frontend:**
```bash
cd Frontend
npm run dev

# Backend deve estar rodando em paralelo:
# cd backend && python main.py
```

### **Checklist de Testes Manuais:**
1. Acessar http://localhost:3000/painel/sistema
2. Clicar em "Equipe"
3. Verificar se lista carrega (pode estar vazia)
4. Criar novo funcionário:
   - Preencher todos os campos
   - **IMPORTANTE**: Setor deve mostrar nomes mas salvar ID
   - Salvar e verificar se aparece na lista
5. Editar funcionário
6. Excluir funcionário
7. Verificar no Supabase se dados foram salvos

## 📂 **ARQUIVOS PARA MODIFICAR**

### **PRINCIPAIS:**
- 🔧 `/components/modulos/sistema/equipe/funcionario-form.tsx` (campo setor)
- 🔧 `/types/sistema.ts` (ajustar tipos)
- 🔧 `/services/api-client.ts` (adicionar métodos se necessário)

### **VERIFICAR:**
- ✅ `/hooks/modulos/sistema/use-equipe.ts` (já limpo!)
- ✅ `/components/modulos/sistema/equipe/funcionario-table.tsx` (remover performance)
- ✅ `/components/modulos/sistema/equipe/gestao-equipe.tsx`

## ⚠️ **REGRAS DO RICARDO**
- **COMENTE TODO código** em português brasileiro
- **EXPLIQUE mudanças** importantes
- **NÃO adicione features** não solicitadas
- **TESTE tudo** antes de marcar ✅
- **ZERO dados mock** - fundamental!
- **APRESENTE PLANO** antes de cada etapa
- **AGUARDE APROVAÇÃO** para prosseguir

## 📊 **STATUS DA MISSÃO**
🔲 **Aguardando** - Backend precisa estar ✅ primeiro!

---

**Última atualização:** 2024-12-23  
**Responsável:** Agente Frontend  
**Coordenador:** IA-Administrador  
**Próxima ação:** Aguardar backend concluído