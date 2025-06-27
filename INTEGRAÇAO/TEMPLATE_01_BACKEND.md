# 🛠️ MISSÃO BACKEND - MÓDULO [NOME_MODULO]

> **ID:** T01_BACKEND_[MODULO]  
> **Responsável:** IA Backend  
> **Status:** 🔲 Aguardando início  
> **Dependências:** Descoberta aprovada por Ricardo  

## 🎯 OBJETIVO

Implementar a camada backend completa do módulo [NOME], criando uma API REST robusta e seguindo os padrões estabelecidos no projeto Fluyt.

## 📋 PRÉ-REQUISITOS

### Informações da Descoberta
- **Tabela principal:** `cad_[nome]` ou `c_[nome]`
- **Campos obrigatórios:** [listar]
- **Campos opcionais:** [listar]
- **Relacionamentos:** [descrever FKs]
- **Regras de negócio:** [listar principais]

### Módulo de Referência
- **Usar como base:** `/backend/modules/lojas/`
- **Copiar estrutura e padrões**
- **Adaptar para especificidades do módulo**

## 📁 ESTRUTURA DE ARQUIVOS

```bash
backend/modules/[modulo]/
├── __init__.py          # Vazio, marca como pacote Python
├── schemas.py           # Estruturas Pydantic (validação)
├── repository.py        # Acesso ao banco de dados
├── services.py          # Lógica de negócio
└── controller.py        # Endpoints da API
```

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### 1️⃣ SCHEMAS.PY - Estruturas de Dados

```python
"""
Schemas (estruturas de dados) para o módulo de [nome]
Define como os dados devem ser enviados e recebidos pela API
"""
```

- [ ] Importar tipos necessários (Optional, datetime, UUID)
- [ ] Criar classe Base com campos comuns
- [ ] Implementar validadores customizados
- [ ] Criar classes específicas:
  - [ ] `[Modulo]Base` - Campos base
  - [ ] `[Modulo]Create` - Para criação
  - [ ] `[Modulo]Update` - Para atualização (campos opcionais)
  - [ ] `[Modulo]Response` - Resposta com todos os campos
  - [ ] `[Modulo]ListResponse` - Resposta paginada
  - [ ] `Filtros[Modulo]` - Filtros de busca

#### Exemplo de Validação
```python
@field_validator('nome')
def validar_nome(cls, v):
    """Valida se o nome não está vazio"""
    if not v or v.strip() == '':
        raise ValueError('Nome é obrigatório')
    return v.strip()
```

### 2️⃣ REPOSITORY.PY - Acesso ao Banco

```python
"""
Repository - Camada de acesso ao banco de dados para [nome]
Responsável por todas as operações com o Supabase
"""
```

- [ ] Importar Cliente Supabase e exceções
- [ ] Criar classe Repository
- [ ] Implementar métodos:
  - [ ] `listar()` - Com paginação e filtros
  - [ ] `buscar_por_id()` - Busca específica
  - [ ] `buscar_por_nome()` - Evitar duplicados
  - [ ] `criar()` - Inserir novo registro
  - [ ] `atualizar()` - Atualizar parcialmente
  - [ ] `excluir()` - Soft delete (ativo = False)

#### Pontos de Atenção
- [ ] Evitar N+1 queries (usar JOINs quando necessário)
- [ ] Implementar soft delete (nunca DELETE físico)
- [ ] Tratar exceções específicas
- [ ] Adicionar logs em operações críticas
- [ ] Considerar RLS e multi-tenant se aplicável

### 3️⃣ SERVICES.PY - Lógica de Negócio

```python
"""
Services - Lógica de negócio para [nome]
Camada intermediária entre controllers e repository
"""
```

- [ ] Importar dependências necessárias
- [ ] Criar classe Service
- [ ] Implementar validações de negócio:
  - [ ] Verificar permissões por perfil
  - [ ] Validar regras específicas
  - [ ] Preparar dados para repository
  - [ ] Formatar respostas

#### Validações por Perfil
```python
# Exemplo de validação de permissão
if user.perfil not in ['ADMIN', 'SUPER_ADMIN']:
    raise ValidationException("Apenas administradores podem criar")
```

### 4️⃣ CONTROLLER.PY - Endpoints da API

```python
"""
Controller - Endpoints da API para [nome]
Define todas as rotas HTTP para gerenciar [nome]
"""
```

- [ ] Criar router FastAPI
- [ ] Implementar endpoints:
  - [ ] `GET /[modulo]` - Listar com filtros
  - [ ] `GET /[modulo]/{id}` - Buscar por ID
  - [ ] `POST /[modulo]` - Criar novo
  - [ ] `PUT /[modulo]/{id}` - Atualizar
  - [ ] `DELETE /[modulo]/{id}` - Excluir (soft)
  - [ ] `GET /[modulo]/verificar-nome/{nome}` - Validar duplicidade

#### Documentação OpenAPI
```python
@router.get("/", response_model=ListResponse)
async def listar(
    busca: Optional[str] = Query(None, description="Busca por nome"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user)
):
    """
    Lista registros com filtros e paginação
    
    **Filtros disponíveis:**
    - busca: Procura em campos de texto
    - ativo: Mostrar apenas ativos/inativos
    """
```

### 5️⃣ INTEGRAÇÃO NO MAIN.PY

- [ ] Importar router no main.py
- [ ] Registrar router na aplicação
```python
from modules.[modulo].controller import router as [modulo]_router
app.include_router([modulo]_router, prefix="/api/v1")
```

## 🧪 TESTES OBRIGATÓRIOS

### Testar Endpoints Localmente
```bash
# 1. Obter token
TOKEN=$(curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fluyt.com","password":"senha123"}' | jq -r '.access_token')

# 2. Listar registros
curl -X GET "http://localhost:8000/api/v1/[modulo]" \
  -H "Authorization: Bearer $TOKEN" | jq

# 3. Criar novo
curl -X POST "http://localhost:8000/api/v1/[modulo]" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","campo2":"valor"}' | jq
```

### Validações a Testar
- [ ] CRUD completo funcionando
- [ ] Validações de campos obrigatórios
- [ ] Verificação de duplicidade
- [ ] Paginação correta
- [ ] Filtros funcionando
- [ ] Permissões por perfil
- [ ] Soft delete (não remove fisicamente)

## ⚠️ PONTOS CRÍTICOS

1. **Multi-tenant**: Se módulo é por loja, filtrar por loja_id
2. **Performance**: Evitar N+1 queries, usar agregações
3. **Segurança**: Sempre verificar permissões
4. **Dados**: NUNCA usar dados mockados
5. **Logs**: Adicionar em operações importantes

## 📊 CRITÉRIOS DE ACEITAÇÃO

- [ ] Todos os 4 arquivos criados e funcionando
- [ ] Endpoints respondendo corretamente
- [ ] Validações implementadas
- [ ] Testes manuais passando
- [ ] Código comentado em PT-BR
- [ ] Sem erros no console
- [ ] Performance adequada (< 200ms)

## 🚀 ENTREGA

1. **Notificar conclusão** no canal do projeto
2. **Disponibilizar para teste** em http://localhost:8000/docs
3. **Aguardar revisão** do Claude Code
4. **Liberar para Frontend e Integração** após aprovação

---

**LEMBRE-SE:** Use o módulo Lojas como referência, mas adapte para as necessidades específicas deste módulo!