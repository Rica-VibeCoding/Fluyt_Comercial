# 🟢 MISSÕES - COMO ORGANIZAR O TRABALHO

## 📋 **O QUE SÃO ARQUIVOS DE MISSÃO**

Documentos .md que definem **exatamente** o que cada equipe deve fazer:
- `01_BACKEND_*.md` - Tarefas do backend
- `02_FRONTEND_*.md` - Tarefas do frontend  
- `03_API_*.md` - Validações e testes
- `04_MISSÕES_ATIVAS.md` - Controle central

## 🎯 **ESTRUTURA DE UMA MISSÃO**

```yaml
---
id: T01_BACKEND_EQUIPE
modulo: Equipe
responsavel: backend
depends_on: []           # Não depende de ninguém
blocks: [frontend, api]  # Bloqueia outros
status: pending
---

# 🛠️ Missão Backend: Módulo {{MODULO}}

## 🚨 STATUS DE DEPENDÊNCIAS
✅ POSSO COMEÇAR: Não dependo de ninguém
⏳ QUEM DEPENDE: Frontend e API aguardando

## 🎯 OBJETIVO
[Descrever claramente o que fazer]

## 📋 PLANO EM ETAPAS
### ETAPA 1: [Nome]
- [ ] Tarefa 1
- [ ] Tarefa 2
⏸️ AGUARDAR APROVAÇÃO RICARDO

## ✅ CRITÉRIOS DE ACEITAÇÃO
- [ ] Critério 1
- [ ] Critério 2
```

## 🔄 **ORDEM OBRIGATÓRIA DE EXECUÇÃO**

```mermaid
Backend (1º) → Aprovação → Frontend + API (2º) → Integração (3º)
```

### **Por que essa ordem?**

**❌ SE FRONTEND PRIMEIRO:**
```typescript
// Frontend tenta chamar API
await fetch('/api/funcionarios')
// ERRO 404: Endpoint não existe!
```

**✅ BACKEND PRIMEIRO:**
```python
# Backend cria estrutura
/modules/equipe/controller.py ✅
# Agora frontend tem onde conectar!
```

## 📊 **DEPENDENCIES E BLOQUEIOS**

### **Como definir dependencies:**

```yaml
# Backend não depende de ninguém
depends_on: []

# Frontend depende do backend
depends_on: [T01_BACKEND_EQUIPE]

# API pode rodar junto com frontend
can_parallel: [T02_FRONTEND_EQUIPE]
```

### **Tabela de dependencies típicas:**

| Missão | Depende de | Bloqueia | Paralelo com |
|--------|------------|----------|--------------|
| Backend | Nada | Frontend, API | - |
| Frontend | Backend | Integração | API |
| API | Backend | Integração | Frontend |

## ⚠️ **PROCESSO POR ETAPAS**

### **NUNCA faça tudo de uma vez!**

```markdown
## PLANO EM ETAPAS

### ETAPA 1: Análise
- [ ] Verificar tabela via MCP
- [ ] Mapear campos
⏸️ AGUARDAR RICARDO

### ETAPA 2: Implementação
- [ ] Criar schemas
- [ ] Implementar CRUD
⏸️ AGUARDAR RICARDO

### ETAPA 3: Testes
- [ ] Testar endpoints
- [ ] Validar dados
✅ ENTREGAR
```

## 📝 **TEMPLATE PARA NOVA MISSÃO**

```markdown
---
id: T0X_{{EQUIPE}}_{{MODULO}}
modulo: {{Modulo}}
responsavel: {{backend|frontend|api}}
depends_on: [{{dependencias}}]
status: pending
---

# {{EMOJI}} Missão {{Equipe}}: Módulo {{Modulo}}

## 🚨 STATUS DE DEPENDÊNCIAS
{{✅|❌}} POSSO COMEÇAR: {{explicacao}}

## 🎯 OBJETIVO
{{objetivo_claro}}

## ⚠️ PROBLEMAS CONHECIDOS
- {{problema_1}}
- {{problema_2}}

## 📋 PLANO EM ETAPAS
### ETAPA 1: {{nome}}
- [ ] {{tarefa}}
⏸️ AGUARDAR APROVAÇÃO

## ✅ CRITÉRIOS DE ACEITAÇÃO
- [ ] {{criterio}}

## 🔧 COMANDOS DE TESTE
```bash
{{comandos}}
```
```

## 🎯 **ARQUIVO DE CONTROLE CENTRAL**

### **04_MISSÕES_ATIVAS.md**

```markdown
## 📊 QUADRO DE MISSÕES

| Missão | Status | Progresso | Pode Iniciar? |
|--------|--------|-----------|---------------|
| Backend | ✅ Concluído | 100% | - |
| Frontend | 🔄 Em progresso | 50% | ✅ SIM |
| API | 🔲 Aguardando | 0% | ✅ SIM |

## 🚨 BLOQUEIOS
- Frontend: Aguardando campo setor ser corrigido
```

## ✅ **CHECKLIST PARA CRIAR MISSÃO**

- [ ] Descobri estrutura real via MCP?
- [ ] Defini dependencies corretas?
- [ ] Dividi em etapas com aprovação?
- [ ] Adicionei critérios claros?
- [ ] Incluí comandos de teste?
- [ ] Atualizei 04_MISSÕES_ATIVAS.md?

## 🚀 **PRÓXIMO PASSO**

Agora leia: **[🟢1D- Claude_Code_COMANDOS.md](./🟢1D-%20Claude_Code_COMANDOS.md)**

---

**Tempo de leitura:** ~5 minutos  
**Criticidade:** ESSENCIAL para coordenação de equipes