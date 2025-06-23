---
id: T01_BACKEND_EQUIPE
modulo: Equipe
responsavel: backend
depends_on: []  # Não depende de ninguém - PODE COMEÇAR!
blocks: [T02_FRONTEND_EQUIPE, T03_API_EQUIPE]
status: pending
order: 1
expected_output:
  - CRUD funcional com FastAPI
  - Endpoints testados manualmente e via pytest
  - Código limpo e alinhado com tabela Supabase
coverage_min: 80

# 🚨 ESQUEMA VALIDADO COM RICARDO
tabela_real: cad_equipe  # ATENÇÃO: NÃO é "funcionarios"!
nome_exibicao: Funcionários/Equipe

# MAPEAMENTO OBRIGATÓRIO Frontend → Backend
campos_conversao:
  # Frontend → Backend (snake_case)
  nome: nome
  email: email
  telefone: telefone
  lojaId: loja_id
  setorId: setor_id  # ⚠️ ATENÇÃO: É ID, não nome!
  salario: salario
  dataAdmissao: data_admissao
  nivelAcesso: nivel_acesso
  tipoFuncionario: perfil  # ⚠️ NOME DIFERENTE!
  
# CAMPOS ESPECIAIS DO BANCO
campos_banco_especificos:
  - limite_desconto (decimal)
  - comissao_percentual_vendedor (decimal)
  - comissao_percentual_gerente (decimal)
  - tem_minimo_garantido (boolean)
  - valor_minimo_garantido (decimal)
  - valor_medicao (decimal)
  - override_comissao (decimal)

# RELACIONAMENTOS OBRIGATÓRIOS
foreign_keys:
  - loja_id → c_lojas (✅ existe)
  - setor_id → cad_setores (❌ CRIAR PRIMEIRO!)
---

# 🛠️ Missão Backend: Módulo Equipe

## 🚨 **STATUS DE DEPENDÊNCIAS**

✅ **POSSO COMEÇAR:** Não dependo de ninguém  
⏳ **QUEM DEPENDE DE MIM:** Frontend + API estão aguardando  
❌ **PRÉ-REQUISITO:** Criar tabela `cad_setores` primeiro!

## 🎯 **OBJETIVO**
Criar módulo completo de **equipe/funcionários** no backend FastAPI, usando a tabela real `cad_equipe` (NÃO é "funcionarios"!), seguindo o padrão dos módulos existentes.

## ⚠️ **PROCESSO OBRIGATÓRIO - APRESENTAR PLANO ANTES**

**NÃO COMECE A CODIFICAR!** Primeiro apresente seu plano detalhado em etapas para aprovação do Ricardo.

## 🎯 **PLANO DE EXECUÇÃO EM ETAPAS**

### **ETAPA 0: PRÉ-REQUISITO** 🚨
- [ ] Criar tabela `cad_setores` no Supabase
- [ ] Popular com setores básicos (Vendas, Administrativo, etc.)
- [ ] Confirmar relacionamento funcionando

```sql
-- Script para criar tabela cad_setores
CREATE TABLE IF NOT EXISTS cad_setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular com dados básicos
INSERT INTO cad_setores (nome, descricao) VALUES
    ('Vendas', 'Equipe de vendas'),
    ('Administrativo', 'Equipe administrativa'),
    ('Medição', 'Equipe de medição'),
    ('Gerência', 'Gerência geral');
```

**⏸️ AGUARDAR RICARDO CONFIRMAR TABELA CRIADA**

### **ETAPA 1: ANÁLISE E ESTRUTURA BASE**
- [ ] Analisar estrutura da tabela `cad_equipe` no Supabase
- [ ] Verificar módulos existentes (clientes, empresas) como referência
- [ ] Criar pasta `/backend/modules/equipe/`
- [ ] Criar arquivos base vazios:
  - [ ] `__init__.py`
  - [ ] `schemas.py`
  - [ ] `repository.py`
  - [ ] `services.py`
  - [ ] `controller.py`

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 2: SCHEMAS (TIPOS DE DADOS)**
- [ ] Criar schemas em `schemas.py`:
  - [ ] `FuncionarioBase` - campos comuns
  - [ ] `FuncionarioCreate` - criar novo
  - [ ] `FuncionarioUpdate` - atualizar
  - [ ] `FuncionarioResponse` - retorno da API
- [ ] Mapear TODOS os campos do banco:
  ```python
  # ATENÇÃO aos nomes diferentes!
  perfil: str  # Frontend envia como 'tipoFuncionario'
  loja_id: UUID  # Frontend envia como 'lojaId'
  setor_id: UUID  # Frontend envia ID, não nome!
  ```
- [ ] Adicionar validações (email, telefone, etc.)

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 3: REPOSITORY (ACESSO AO BANCO)**
- [ ] Implementar métodos CRUD em `repository.py`:
  - [ ] `listar_funcionarios()` - com filtros e paginação
  - [ ] `obter_funcionario(id)` - buscar por ID
  - [ ] `criar_funcionario(dados)` - inserir novo
  - [ ] `atualizar_funcionario(id, dados)` - editar
  - [ ] `excluir_funcionario(id)` - soft delete (ativo=false)
- [ ] Incluir JOINs para trazer nomes relacionados:
  ```python
  # Trazer nome da loja e setor junto
  .select('''
      *,
      loja:c_lojas(nome),
      setor:cad_setores(nome)
  ''')
  ```

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 4: SERVICES (LÓGICA DE NEGÓCIO)**
- [ ] Implementar lógica em `services.py`:
  - [ ] Validar se loja existe antes de criar funcionário
  - [ ] Validar se setor existe
  - [ ] Garantir email único para funcionários ativos
  - [ ] Lógica de comissão por tipo:
    ```python
    if dados.perfil == 'VENDEDOR':
        dados.comissao_percentual_vendedor = comissao
    elif dados.perfil == 'GERENTE':
        dados.comissao_percentual_gerente = comissao
    ```
- [ ] Tratamento de erros específicos

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 5: CONTROLLER (ENDPOINTS)**
- [ ] Criar endpoints REST em `controller.py`:
  - [ ] `GET /funcionarios` - listar com paginação
  - [ ] `GET /funcionarios/{id}` - obter específico
  - [ ] `POST /funcionarios` - criar novo
  - [ ] `PUT /funcionarios/{id}` - atualizar
  - [ ] `DELETE /funcionarios/{id}` - soft delete
- [ ] Aplicar autenticação JWT em todos
- [ ] Documentação Swagger automática

**⏸️ AGUARDAR APROVAÇÃO DO RICARDO**

### **ETAPA 6: INTEGRAÇÃO E TESTES**
- [ ] Registrar módulo em `/backend/main.py`:
  ```python
  from modules.equipe.controller import router as equipe_router
  app.include_router(equipe_router, prefix="/funcionarios", tags=["equipe"])
  ```
- [ ] Testar manualmente cada endpoint
- [ ] Criar testes automatizados básicos
- [ ] Verificar se Swagger documenta corretamente

**✅ ENTREGAR PARA VALIDAÇÃO FINAL**

## 📋 **TAREFAS DETALHADAS**

### **TAREFA 1: Criar Estrutura do Módulo**
**Local:** `/backend/modules/equipe/`

```bash
backend/modules/equipe/
├── __init__.py
├── controller.py    # Endpoints REST
├── repository.py    # Acesso ao banco
├── schemas.py       # Tipos Pydantic
└── services.py      # Lógica de negócio
```

### **TAREFA 2: Implementar Schemas (Pydantic)**

**ATENÇÃO ESPECIAL para mapeamento de campos:**

```python
# schemas.py
from typing import Optional, Literal
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, field_validator, EmailStr
import re

class FuncionarioBase(BaseModel):
    """Base com campos obrigatórios"""
    nome: str
    email: EmailStr
    perfil: Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']  # ⚠️ NÃO é tipoFuncionario!
    nivel_acesso: Literal['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN']
    loja_id: UUID
    setor_id: UUID  # ⚠️ É ID, não nome!
    
    # Campos opcionais
    telefone: Optional[str] = None
    salario: Optional[float] = None
    data_admissao: Optional[date] = None
    limite_desconto: Optional[float] = None
    comissao_percentual_vendedor: Optional[float] = None
    comissao_percentual_gerente: Optional[float] = None
    tem_minimo_garantido: Optional[bool] = False
    valor_minimo_garantido: Optional[float] = None
    valor_medicao: Optional[float] = None
    override_comissao: Optional[float] = None
    ativo: bool = True
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,  # CRÍTICO: Converte UUID para string
            date: lambda v: v.isoformat()
        }
    
    @field_validator('telefone')
    def validar_telefone(cls, v):
        if not v:
            return None
        # Remove caracteres não numéricos
        numeros = re.sub(r'[^\d]', '', v)
        if len(numeros) < 10:
            raise ValueError('Telefone deve ter pelo menos 10 dígitos')
        return v

class FuncionarioCreate(FuncionarioBase):
    """Dados para criar funcionário"""
    pass

class FuncionarioUpdate(BaseModel):
    """Dados para atualizar - todos opcionais"""
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    perfil: Optional[Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']] = None
    nivel_acesso: Optional[Literal['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN']] = None
    loja_id: Optional[UUID] = None
    setor_id: Optional[UUID] = None
    salario: Optional[float] = None
    data_admissao: Optional[date] = None
    # ... outros campos ...
    ativo: Optional[bool] = None
    
    class Config:
        json_encoders = {
            UUID: str,
            date: lambda v: v.isoformat()
        }

class FuncionarioResponse(FuncionarioBase):
    """Resposta da API com campos adicionais"""
    id: str
    created_at: datetime
    updated_at: datetime
    
    # Campos relacionados (vindos de JOINs)
    loja_nome: Optional[str] = None
    setor_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat(),
            date: lambda v: v.isoformat()
        }
```

### **TAREFA 3: Implementar Repository**

**USAR NESTED SELECT para evitar N+1:**

```python
# repository.py
async def listar_funcionarios(self, loja_id: Optional[str] = None, filtros: Dict[str, Any] = None):
    """Lista funcionários com relacionamentos"""
    try:
        # Nested select para trazer dados relacionados
        query = self.db.table('cad_equipe').select('''
            *,
            loja:c_lojas(id, nome),
            setor:cad_setores(id, nome)
        ''').eq('ativo', True)
        
        # Aplicar filtro por loja se necessário
        if loja_id:
            query = query.eq('loja_id', loja_id)
            
        # Aplicar outros filtros
        if filtros:
            if filtros.get('busca'):
                busca = f"%{filtros['busca']}%"
                query = query.or_(
                    f"nome.ilike.{busca},"
                    f"email.ilike.{busca}"
                )
            if filtros.get('perfil'):
                query = query.eq('perfil', filtros['perfil'])
                
        # Ordenar e executar
        result = query.order('nome').execute()
        
        # Processar dados relacionados
        funcionarios = []
        for item in result.data:
            # Extrair nomes dos relacionamentos
            if item.get('loja'):
                item['loja_nome'] = item['loja'].get('nome')
                item['loja_id'] = item['loja'].get('id')
                del item['loja']
            
            if item.get('setor'):
                item['setor_nome'] = item['setor'].get('nome') 
                item['setor_id'] = item['setor'].get('id')
                del item['setor']
                
            funcionarios.append(item)
            
        return funcionarios
        
    except Exception as e:
        logger.error(f"Erro ao listar funcionários: {str(e)}")
        raise DatabaseException(f"Erro ao listar: {str(e)}")
```

### **TAREFA 4: Implementar Services**

**CONVERSÕES IMPORTANTES aqui:**

```python
# services.py
async def criar_funcionario(self, dados: FuncionarioCreate, usuario_id: str) -> FuncionarioResponse:
    """Cria funcionário com validações"""
    try:
        # Validar se loja existe
        loja = await self.validar_loja(dados.loja_id)
        if not loja:
            raise NotFoundException("Loja não encontrada")
            
        # Validar se setor existe
        setor = await self.validar_setor(dados.setor_id)
        if not setor:
            raise NotFoundException("Setor não encontrado")
            
        # Validar email único
        existe = await self.repository.buscar_por_email(dados.email)
        if existe:
            raise ConflictException("Email já cadastrado")
            
        # Converter dados do frontend para banco
        dados_banco = dados.model_dump()
        
        # IMPORTANTE: Lógica de comissão baseada no perfil
        if 'comissao' in dados_banco:
            comissao = dados_banco.pop('comissao')  # Remove campo genérico
            
            if dados.perfil == 'VENDEDOR':
                dados_banco['comissao_percentual_vendedor'] = comissao
            elif dados.perfil == 'GERENTE':
                dados_banco['comissao_percentual_gerente'] = comissao
                
        # Criar no banco
        funcionario_criado = await self.repository.criar(dados_banco)
        
        # Retornar com dados relacionados
        return FuncionarioResponse(**funcionario_criado)
        
    except Exception as e:
        logger.error(f"Erro ao criar funcionário: {str(e)}")
        raise
```

### **TAREFA 5: Implementar Controller**

```python
# controller.py
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from core.dependencies import get_current_user, get_funcionario_service

router = APIRouter()

@router.get("/", response_model=List[FuncionarioResponse])
async def listar_funcionarios(
    busca: Optional[str] = Query(None, description="Buscar por nome ou email"),
    perfil: Optional[str] = Query(None, description="Filtrar por perfil"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    usuario = Depends(get_current_user),
    service = Depends(get_funcionario_service)
):
    """Lista funcionários com filtros e paginação"""
    try:
        # Determinar loja baseado no perfil do usuário
        loja_id = None
        if usuario.perfil not in ['ADMIN_MASTER', 'ADMIN']:
            loja_id = usuario.loja_id
            
        filtros = {
            'busca': busca,
            'perfil': perfil,
            'page': page,
            'limit': limit
        }
        
        return await service.listar(loja_id=loja_id, filtros=filtros)
        
    except Exception as e:
        logger.error(f"Erro ao listar funcionários: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=FuncionarioResponse, status_code=201)
async def criar_funcionario(
    dados: FuncionarioCreate,
    usuario = Depends(get_current_user),
    service = Depends(get_funcionario_service)
):
    """Cria novo funcionário"""
    try:
        # Validar permissões
        if usuario.perfil not in ['ADMIN_MASTER', 'ADMIN', 'GERENTE']:
            raise HTTPException(403, "Sem permissão para criar funcionários")
            
        return await service.criar_funcionario(dados, usuario.id)
        
    except ConflictException as e:
        raise HTTPException(409, str(e))
    except NotFoundException as e:
        raise HTTPException(404, str(e))
    except Exception as e:
        logger.error(f"Erro ao criar funcionário: {str(e)}")
        raise HTTPException(500, "Erro ao criar funcionário")
```

### **TAREFA 6: Integrar no Main.py**

```python
# main.py
from modules.equipe.controller import router as equipe_router

# Adicionar após os outros routers
app.include_router(
    equipe_router, 
    prefix="/api/v1/funcionarios",  # ⚠️ Frontend espera este endpoint
    tags=["equipe"]
)
```

## 🧪 **CRITÉRIOS DE ACEITAÇÃO**

### ✅ **OBRIGATÓRIOS:**
- [ ] Módulo segue padrão dos existentes (clientes, empresas)
- [ ] Tabela `cad_equipe` sendo usada (NÃO "funcionarios")
- [ ] Tabela `cad_setores` criada e funcionando
- [ ] Todos endpoints retornam JSON válido
- [ ] Autenticação JWT em todos endpoints
- [ ] Soft delete funcionando (ativo=false)
- [ ] Conversões de nomenclatura funcionando
- [ ] JOINs trazendo nomes de loja e setor

### ✅ **VALIDAÇÕES ESPECÍFICAS:**
- [ ] Email único para funcionários ativos
- [ ] Loja deve existir antes de criar funcionário
- [ ] Setor deve existir antes de criar funcionário
- [ ] Comissão salva no campo correto baseado no perfil
- [ ] Telefone aceita formatos: (11) 98765-4321 ou 11987654321

## 🔧 **COMANDOS DE TESTE**

### **Criar tabela de setores primeiro:**
```sql
-- No Supabase SQL Editor
CREATE TABLE IF NOT EXISTS cad_setores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Testar Backend:**
```bash
cd backend
python main.py  # Deve iniciar sem erros
```

### **Testar Endpoints via cURL:**
```bash
# 1. Login para obter token
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"seu_email","password":"sua_senha"}'

# 2. Listar funcionários
curl -X GET "http://localhost:8000/api/v1/funcionarios" \
  -H "Authorization: Bearer SEU_TOKEN"

# 3. Criar funcionário
curl -X POST "http://localhost:8000/api/v1/funcionarios" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@teste.com",
    "telefone": "(11) 98765-4321",
    "perfil": "VENDEDOR",
    "nivel_acesso": "USUARIO",
    "loja_id": "UUID_DA_LOJA",
    "setor_id": "UUID_DO_SETOR",
    "salario": 3500,
    "data_admissao": "2024-01-15"
  }'
```

## 📂 **ARQUIVOS DE REFERÊNCIA**
- **Estrutura base:** `/backend/modules/clientes/` (copiar padrão)
- **Tabela Supabase:** `cad_equipe` (verificar campos)
- **JWT Auth:** `/backend/core/auth.py`
- **Tipos:** Seguir schemas acima com conversões

## ⚠️ **REGRAS DO RICARDO**
- **COMENTE TODO código** em português brasileiro
- **EXPLIQUE o que cada função faz** em linguagem simples
- **NÃO use dados mock** - apenas dados reais do Supabase
- **SIGA padrão** dos módulos existentes
- **APRESENTE PLANO** antes de executar cada etapa
- **AGUARDE APROVAÇÃO** antes de prosseguir

## 📊 **STATUS DA MISSÃO**
🔲 **Pendente** - Aguardando agente backend apresentar plano

---

**Última atualização:** 2024-12-23  
**Responsável:** Agente Backend  
**Coordenador:** IA-Administrador  
**Próxima ação:** Apresentar plano detalhado para Ricardo