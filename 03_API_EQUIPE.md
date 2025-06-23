---
id: T03_API_EQUIPE
modulo: Equipe
responsavel: api
depends_on: [T01_BACKEND_EQUIPE]  # ⚠️ AGUARDAR BACKEND!
blocks: []
can_parallel: [T02_FRONTEND_EQUIPE]
status: pending
order: 3
expected_output:
  - Endpoints REST documentados no Swagger
  - Autenticação JWT configurada
  - Conversões de dados funcionando
  - Testes de integração passando
coverage_min: 85

# 🚨 ESQUEMA VALIDADO COM RICARDO
tabela_real: cad_equipe
endpoints_base: /api/v1/funcionarios

# CONVERSÕES OBRIGATÓRIAS
request_conversions:
  # Frontend → Backend
  lojaId: loja_id
  setorId: setor_id
  tipoFuncionario: perfil
  nivelAcesso: nivel_acesso
  dataAdmissao: data_admissao
  
response_conversions:
  # Backend → Frontend
  loja_id: lojaId
  setor_id: setorId
  perfil: tipoFuncionario
  nivel_acesso: nivelAcesso
  data_admissao: dataAdmissao
  created_at: criadoEm
  updated_at: atualizadoEm

# VALIDAÇÕES JWT
auth_required: true
roles_permitted: [ADMIN_MASTER, ADMIN, GERENTE]
---

# 🔌 Missão API: Módulo Equipe

## 🚨 **STATUS DE DEPENDÊNCIAS**

❌ **NÃO POSSO COMEÇAR AINDA**  
⏳ **AGUARDANDO:** Backend estar ✅ no `04_MISSÕES_ATIVAS.md`  
🤝 **POSSO EXECUTAR JUNTO COM:** Frontend (após backend pronto)

## 📋 **ENQUANTO AGUARDO BACKEND:**
- [ ] Revisar documentação Swagger existente
- [ ] Estudar middleware de autenticação
- [ ] Verificar padrão de conversões em outros módulos
- [ ] Preparar testes de integração

**Ricardo, o Backend já está pronto para eu começar?**

## 🎯 **OBJETIVO**
Garantir que a **API REST** do módulo equipe esteja totalmente documentada no Swagger, com autenticação JWT funcionando, realizando todas as conversões necessárias entre frontend (camelCase) e backend (snake_case).

## ⚠️ **PROCESSO OBRIGATÓRIO - APRESENTAR PLANO ANTES**

**NÃO COMECE A CODIFICAR!** Primeiro apresente seu plano detalhado em etapas para aprovação do Ricardo.

## 🎯 **PLANO DE EXECUÇÃO EM ETAPAS**

### **ETAPA 1: ANÁLISE E VALIDAÇÃO**
- [ ] Verificar se backend criou todos os endpoints
- [ ] Testar endpoints manualmente com cURL
- [ ] Analisar estrutura de request/response
- [ ] Confirmar que Swagger está documentando

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 2: MIDDLEWARE DE CONVERSÃO**
- [ ] Criar middleware para converter nomenclaturas:
  ```python
  # middleware/field_converter.py
  def convert_request_fields(data: dict) -> dict:
      """Converte campos do frontend para backend"""
      conversions = {
          'lojaId': 'loja_id',
          'setorId': 'setor_id',
          'tipoFuncionario': 'perfil',
          'nivelAcesso': 'nivel_acesso',
          'dataAdmissao': 'data_admissao'
      }
      # Aplicar conversões...
  ```
- [ ] Aplicar em todos os endpoints de funcionários
- [ ] Testar conversões funcionando

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 3: AUTENTICAÇÃO E PERMISSÕES**
- [ ] Validar JWT em todos os endpoints
- [ ] Implementar controle por perfil:
  ```python
  # Apenas ADMIN_MASTER, ADMIN e GERENTE podem criar/editar
  @requires_roles(['ADMIN_MASTER', 'ADMIN', 'GERENTE'])
  async def criar_funcionario():
      pass
  ```
- [ ] Filtrar dados por loja quando necessário

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 4: DOCUMENTAÇÃO SWAGGER**
- [ ] Adicionar descrições detalhadas em português
- [ ] Documentar todos os status codes
- [ ] Adicionar exemplos de request/response
- [ ] Validar se documentação está clara

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 5: TESTES DE INTEGRAÇÃO**
- [ ] Criar suite de testes completa
- [ ] Testar fluxo completo: criar → listar → editar → excluir
- [ ] Validar conversões em ambas direções
- [ ] Testar permissões por perfil
- [ ] Verificar tratamento de erros

**✅ ENTREGAR PARA VALIDAÇÃO FINAL**

## 🧪 **CRITÉRIOS DE ACEITAÇÃO**

### ✅ **OBRIGATÓRIOS:**
- [ ] Todos endpoints documentados no Swagger
- [ ] Autenticação JWT em todos endpoints
- [ ] Conversões camelCase ↔ snake_case funcionando
- [ ] Lógica de comissão implementada corretamente
- [ ] Permissões por perfil validadas
- [ ] Testes de integração cobrindo 85%+

### ✅ **DOCUMENTAÇÃO SWAGGER:**
- [ ] Descrições claras em português
- [ ] Exemplos de request/response
- [ ] Todos os status codes documentados
- [ ] Parâmetros de query explicados
- [ ] Schemas com validações visíveis

### ✅ **SEGURANÇA:**
- [ ] JWT obrigatório em todas rotas
- [ ] Validação de perfis (roles)
- [ ] Filtro por loja quando aplicável
- [ ] Tratamento de erros sem expor detalhes

## 🔧 **COMANDOS DE TESTE**

### **Verificar Swagger:**
```bash
# Abrir no navegador
open http://localhost:8000/docs

# Verificar se aparece:
# - /api/v1/funcionarios (GET, POST)
# - /api/v1/funcionarios/{id} (GET, PUT, DELETE)
```

### **Testar Conversões:**
```bash
# Criar com nomenclatura frontend
curl -X POST "http://localhost:8000/api/v1/funcionarios" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "email": "maria@fluyt.com",
    "tipoFuncionario": "GERENTE",
    "lojaId": "550e8400-e29b-41d4-a716-446655440000",
    "setorId": "660e8400-e29b-41d4-a716-446655440000",
    "nivelAcesso": "GERENTE",
    "comissao": 5.0
  }'

# Response deve vir com mesma nomenclatura!
{
  "id": "...",
  "nome": "Maria Santos",
  "tipoFuncionario": "GERENTE",  // NÃO "perfil"
  "lojaId": "...",               // NÃO "loja_id"
  "comissao": 5.0                // NÃO "comissao_percentual_gerente"
}
```

## 📂 **ARQUIVOS DE REFERÊNCIA**
- **Swagger atual:** http://localhost:8000/docs
- **Middleware auth:** `/backend/core/auth.py`
- **Conversões exemplo:** `/backend/modules/clientes/` (ver padrão)
- **Testes modelo:** `/backend/tests/test_clientes.py`

## ⚠️ **REGRAS DO RICARDO**
- **DOCUMENTE tudo** no Swagger em português
- **MANTENHA nomenclatura** frontend (camelCase)
- **TESTE todas conversões** antes de entregar
- **VALIDE permissões** por perfil
- **APRESENTE PLANO** antes de executar
- **AGUARDE APROVAÇÃO** para cada etapa

## 📊 **STATUS DA MISSÃO**
🔲 **Aguardando** - Backend precisa estar ✅ primeiro!

---

**Última atualização:** 2024-12-23  
**Responsável:** Agente API  
**Coordenador:** IA-Administrador  
**Próxima ação:** Aguardar backend concluído