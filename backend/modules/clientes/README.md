# =� M�DULO CLIENTES - DOCUMENTA��O COMPLETA

## <� **VIS�O GERAL**

O m�dulo de clientes � o **cora��o do sistema Fluyt**, respons�vel por gerenciar todo o ciclo de vida dos clientes desde o cadastro inicial at� o fechamento do contrato. � o m�dulo mais maduro e completo do sistema, servindo como **modelo para todos os outros m�dulos**.

---

## <� **ARQUITETURA**

### **Stack Tecnol�gico**
- **Backend:** FastAPI + Python 3.11
- **Banco:** PostgreSQL via Supabase
- **Frontend:** Next.js 14 + React 18 + TypeScript
- **Autentica��o:** JWT + Row Level Security (RLS)
- **Valida��o:** Pydantic + Zod

### **Estrutura de Arquivos**
```
backend/modules/clientes/
   __init__.py
   controller.py       # < Endpoints da API REST
   services.py         # >� L�gica de neg�cio + regras de status
   schemas.py          # =� Valida��o de dados (Pydantic)
   README.md          # =� Esta documenta��o

frontend/src/
   types/cliente.ts                    # <� Interfaces TypeScript
   services/cliente-service.ts         # = Cliente HTTP da API
   hooks/modulos/clientes/            # <� Hooks React
      use-clientes-api.ts
   components/modulos/clientes/       # <� Componentes UI
       cliente-page.tsx               # P�gina principal
       cliente-tabela.tsx             # Tabela com expans�o
       cliente-modal.tsx              # Modal de formul�rio
       cliente-form-essencial.tsx     # Dados b�sicos
       cliente-form-endereco.tsx      # Endere�o completo
       cliente-form-config.tsx        # Vendedor/proced�ncia
       cliente-filtros.tsx            # Filtros avan�ados
       cliente-header.tsx             # Cabe�alho com a��es
```

---

## =� **BANCO DE DADOS**

### **Tabela Principal: `c_clientes`**

| Campo | Tipo | Obrigat�rio | Descri��o |
|-------|------|-------------|-----------|
| `id` | UUID |  | Chave prim�ria (auto-gerada) |
| `nome` | VARCHAR |  | **�NICO CAMPO OBRIGAT�RIO** |
| `cpf_cnpj` | VARCHAR(14) | L | CPF (11) ou CNPJ (14 d�gitos) |
| `rg_ie` | VARCHAR | L | RG ou Inscri��o Estadual |
| `email` | VARCHAR | L | Email v�lido |
| `telefone` | VARCHAR | L | Telefone (10-11 d�gitos) |
| `tipo_venda` | ENUM | L | 'NORMAL' ou 'FUTURA' (padr�o: 'NORMAL') |
| `logradouro` | VARCHAR | L | Rua, avenida, etc. |
| `numero` | VARCHAR | L | N�mero do endere�o |
| `complemento` | VARCHAR | L | Apartamento, bloco, etc. |
| `bairro` | VARCHAR | L | Bairro |
| `cidade` | VARCHAR | L | Cidade |
| `uf` | VARCHAR(2) | L | Estado (validado) |
| `cep` | VARCHAR(8) | L | CEP (8 d�gitos) |
| `procedencia_id` | UUID | L | FK � `c_procedencias.id` |
| `vendedor_id` | UUID | L | FK � `cad_equipe.id` |
| `loja_id` | UUID | L | FK � `c_lojas.id` |
| `status_id` | UUID | L | FK � `c_status_orcamento.id` |
| `observacoes` | TEXT | L | Observa��es gerais |
| `ativo` | BOOLEAN |  | Soft delete (padr�o: true) |
| `created_at` | TIMESTAMP |  | Data de cria��o |
| `updated_at` | TIMESTAMP |  | �ltima atualiza��o |

### **Relacionamentos**
- **= c_clientes.procedencia_id** � c_procedencias.id
- **= c_clientes.vendedor_id** � cad_equipe.id
- **= c_clientes.loja_id** � c_lojas.id
- **= c_clientes.status_id** � c_status_orcamento.id

### **�ndices e Constraints**
- **PK:** `c_clientes_pkey` (id)
- **FK:** `c_clientes_status_id_fkey` (status_id)
- **UNIQUE:** CPF/CNPJ por loja (evita duplica��o)
- **RLS:** Pol�ticas de seguran�a por usu�rio/loja

---

## <� **SISTEMA DE STATUS AUTOM�TICO**

### **=% REGRAS DE NEG�CIO IMPLEMENTADAS**

O sistema possui **5 status evolutivos** que s�o atualizados **automaticamente** conforme as a��es do cliente:

#### **STATUS 1: =� CADASTRADO** 
- **Cor:** Azul (`#007BFF`)
- **Trigger:** Cliente � criado no sistema
- **Arquivo:** `backend/modules/clientes/services.py:250`
- **C�digo:**
```python
# TRIGGER AUTOM�TICO: Define status inicial (Ordem 1 - Cliente Cadastrado)
await self.atualizar_status_cliente(cliente_criado['id'], 1, user)
```

#### **STATUS 2: <� AMBIENTE IMPORTADO**
- **Cor:** Amarelo (`#FFC107`)
- **Trigger:** XML de ambiente � importado ou ambiente criado
- **Arquivo:** `backend/modules/ambientes/service.py:212`
- **C�digo:**
```python
# Atualiza para ordem 2 ap�s importar XML
await cliente_service.atualizar_status_cliente(cliente_id, 2, user)
```

#### **STATUS 3: =� OR�AMENTO**
- **Cor:** Verde (`#28A745`)
- **Trigger:** Or�amento � criado/salvo para o cliente
- **Arquivo:** `backend/modules/orcamentos/services.py:68`
- **C�digo:**
```python
# Atualiza para ordem 3 ap�s criar or�amento
await cliente_service.atualizar_status_cliente(str(dados.cliente_id), 3, user)
```

#### **STATUS 4: > NEGOCIA��O**
- **Cor:** Cinza (`#6C757D`)
- **Trigger:** Or�amento � enviado para o cliente
- **Arquivo:** `backend/modules/orcamentos/services.py:246`
- **C�digo:**
```python
# Atualiza para ordem 4 ap�s enviar or�amento
await cliente_service.atualizar_status_cliente(str(orcamento['cliente_id']), 4, user)
```

#### **STATUS 5:  FECHADO**
- **Cor:** Azul (`#3B82F6`)
- **Trigger:** L **AINDA N�O IMPLEMENTADO** (aguardando m�dulo de contratos)
- **Regra Planejada:** Contrato � assinado/fechado

### **=' M�TODO CENTRALIZADO**

Todas as atualiza��es de status passam pelo m�todo centralizado:

**Arquivo:** `backend/modules/clientes/services.py:457`

```python
async def atualizar_status_cliente(self, cliente_id: str, ordem: int, user: User) -> ClienteResponse:
    """
    Atualiza o status do cliente baseado na ordem
    
    Args:
        cliente_id: ID do cliente
        ordem: Ordem do status (1-5)
        user: Usu�rio logado
        
    Returns:
        Cliente atualizado com novo status
    """
```

### **=� CARACTER�STICAS DE SEGURAN�A**

1. **Busca por ordem, n�o por ID fixo** - flex�vel para mudan�as
2. **Logs detalhados** de cada mudan�a de status
3. **N�o falha a opera��o principal** se status n�o existir
4. **Valida��o de permiss�es** - s� usu�rios autorizados
5. **Transacional** - rollback em caso de erro

---

## < **API ENDPOINTS**

### **Listagem com Filtros**
```http
GET /api/clientes?busca=Jo�o&tipo_venda=NORMAL&vendedor_id=uuid&page=1&limit=20
```

**Filtros Dispon�veis:**
- `busca` - Nome, CPF/CNPJ ou telefone
- `tipo_venda` - NORMAL ou FUTURA
- `vendedor_id` - UUID do vendedor
- `procedencia_id` - UUID da proced�ncia
- `data_inicio` / `data_fim` - Per�odo de cadastro

### **CRUD Completo**
- **GET** `/api/clientes` - Listar com filtros e pagina��o
- **GET** `/api/clientes/{id}` - Buscar por ID
- **POST** `/api/clientes` - Criar novo cliente
- **PUT** `/api/clientes/{id}` - Atualizar cliente
- **DELETE** `/api/clientes/{id}` - Excluir (soft delete)

### **Funcionalidades Especiais**
- **GET** `/api/clientes/verificar-cpf-cnpj/{cpf_cnpj}` - Valida��o em tempo real
- **GET** `/api/clientes/{id}/dados-relacionados` - Conta depend�ncias antes de excluir
- **GET** `/api/clientes/procedencias` - Lista proced�ncias ativas

---

## <� **INTERFACE FRONTEND**

### **<� P�gina Principal (`cliente-page.tsx`)**
- Cabe�alho com bot�o "Novo Cliente"
- Filtros avan�ados expans�veis
- Tabela com pagina��o e busca em tempo real
- Loading states e tratamento de erros

### **=� Tabela Inteligente (`cliente-tabela.tsx`)**
- **Linhas expans�veis** - clique para ver detalhes
- **Dados compactos** na linha principal
- **Grid 3 colunas** na linha expandida
- **A��es contextuais** (editar/excluir)
- **Placeholders sutis** ("--") para campos vazios

### **=� Formul�rio Modular**
Dividido em 3 abas para melhor UX:

1. **Essencial** (`cliente-form-essencial.tsx`)
   - Nome (obrigat�rio)
   - CPF/CNPJ, RG/IE
   - Email, telefone
   - Tipo de venda

2. **Endere�o** (`cliente-form-endereco.tsx`)
   - Endere�o completo
   - Auto-complete por CEP
   - Valida��o de UF

3. **Configura��es** (`cliente-form-config.tsx`)
   - Vendedor respons�vel
   - Proced�ncia (origem)
   - Observa��es

### **= Filtros Avan�ados (`cliente-filtros.tsx`)**
- Busca textual em tempo real
- Filtros por vendedor e proced�ncia
- Filtros por per�odo de cadastro
- Filtros por tipo de venda
- Reset r�pido de filtros

---

## = **INTEGRA��O COM OUTROS M�DULOS**

### **=� Depend�ncias de Entrada**
O m�dulo clientes **depende** de:

1. **<� Lojas** (`c_lojas`)
   - Define qual loja o cliente pertence
   - Isolamento de dados por loja

2. **=e Equipe** (`cad_equipe`)
   - Vendedores respons�veis pelos clientes
   - Comiss�es e metas de vendas

3. **=� Proced�ncias** (`c_procedencias`)
   - Origem do lead (Facebook, Google, etc.)
   - An�lise de efici�ncia de canais

4. **=� Status de Or�amento** (`c_status_orcamento`)
   - Evolu��o do cliente no funil de vendas
   - Automa��o de mudan�as de status

### **=� Depend�ncias de Sa�da**
Outros m�dulos **dependem** de clientes:

1. **<� Ambientes** (`c_ambientes`)
   - Ambientes pertencem a clientes espec�ficos
   - Trigger: mudan�a para status "Ambiente Importado"

2. **=� Or�amentos** (`c_orcamentos`)
   - Or�amentos vinculados a clientes
   - Trigger: mudan�a para status "Or�amento"

3. **=� Contratos** (`c_contratos`) - *em desenvolvimento*
   - Contratos fechados com clientes
   - Trigger: mudan�a para status "Fechado"

---

## =� **ESTAT�STICAS ATUAIS**

### **=e Dados no Banco (Snapshot)**
- **Total de clientes:** 13 cadastrados
- **Com status definido:** 7 clientes (54%)
- **Sem status:** 6 clientes (46%) - *cadastrados antes da implementa��o*

### **=� Distribui��o por Status**
- **=5 Cadastrado (ordem 1):** 5 clientes
- **= Negocia��o (ordem 4):** 2 clientes
- **� Sem status:** 6 clientes

### **= Qualidade dos Relacionamentos**
- **Vendedores vinculados:** 91.7% (11/12 clientes)
- **Lojas definidas:** 75% (9/12 clientes)
- **Proced�ncias registradas:** 83.3% (10/12 clientes)

---

##  **VALIDA��ES IMPLEMENTADAS**

### **=� Valida��es de Entrada**
1. **Nome:** Obrigat�rio, n�o pode ser vazio
2. **CPF/CNPJ:** 11 ou 14 d�gitos, sem duplica��o na mesma loja
3. **Email:** Formato v�lido (RFC 5322)
4. **Telefone:** 10-11 d�gitos num�ricos
5. **CEP:** 8 d�gitos num�ricos
6. **UF:** C�digo v�lido de estado brasileiro

### **= Valida��es de Neg�cio**
1. **Unicidade:** CPF/CNPJ �nico por loja
2. **Relacionamentos:** FKs devem existir nas tabelas relacionadas
3. **Soft Delete:** Exclus�o l�gica preserva hist�rico
4. **Permiss�es:** Usu�rio s� acessa clientes da sua loja (RLS)

### **< Valida��es Frontend**
1. **Tempo Real:** CPF/CNPJ validado durante digita��o
2. **Auto-complete:** CEP completa endere�o automaticamente
3. **M�scaras:** Formata��o autom�tica de CPF/CNPJ e telefone
4. **Estados:** Loading, erro e sucesso bem definidos

---

## =� **PERFORMANCE E OTIMIZA��ES**

### **� Backend**
- **Pagina��o nativa** - m�ximo 100 itens por p�gina
- **Filtros indexados** - busca r�pida por CPF/CNPJ
- **JOINs otimizados** - dados relacionados em uma query
- **Cache de relacionamentos** - proced�ncias e vendedores

### **<� Frontend**
- **Lazy Loading** - componentes carregados sob demanda
- **Debounce** - busca com delay para evitar requests excessivos
- **State Management** - Zustand para estado global eficiente
- **Memoiza��o** - React.memo em componentes pesados

### **=� Monitoramento**
- **Logs estruturados** - todas as opera��es registradas
- **M�tricas de erro** - tracking de falhas e timeouts
- **Performance tracking** - tempo de resposta das APIs

---

## >� **TESTES**

### **=, Testes Backend**
- **Unit�rios:** Valida��es, transforma��es de dados
- **Integra��o:** APIs + banco de dados
- **E2E:** Fluxo completo de cadastro at� fechamento

### **<� Testes Frontend**
- **Componentes:** Renderiza��o e intera��es
- **Hooks:** L�gica de estado e efeitos
- **Integra��o:** Fluxo de usu�rio completo

---

## =' **CONFIGURA��ES**

### **� Vari�veis de Ambiente**
```bash
# Supabase
SUPABASE_URL=https://momwbpxqnvgehotfmvde.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# JWT
JWT_SECRET_KEY=fluyt-super-secret-key-development-2025
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### **<� Configura��es do Sistema**
- **Pagina��o padr�o:** 20 itens
- **M�ximo por p�gina:** 100 itens
- **Timeout de API:** 30 segundos
- **Rate limiting:** 100 requests/minuto

---

## = **TROUBLESHOOTING**

### **L Problemas Comuns**

#### **Erro: "CPF/CNPJ j� cadastrado"**
- **Causa:** Tentativa de cadastrar CPF/CNPJ duplicado na mesma loja
- **Solu��o:** Verificar se cliente j� existe ou usar CPF/CNPJ diferente

#### **Erro: "Sess�o expirada"**
- **Causa:** Token JWT vencido
- **Solu��o:** Fazer logout/login ou renovar token automaticamente

#### **Erro: "Cliente n�o encontrado"**
- **Causa:** Usu�rio tentando acessar cliente de outra loja
- **Solu��o:** Verificar permiss�es RLS e loja do usu�rio

### **=� Checklist de Depura��o**

1.  Backend rodando (http://localhost:8000)
2.  Frontend rodando (http://localhost:3000)
3.  Supabase acess�vel
4.  Token JWT v�lido
5.  Usu�rio com loja associada
6.  Permiss�es RLS configuradas

---

## =� **ROADMAP**

### **<� Pr�ximas Implementa��es**

#### **=� Status 5 - Contrato Fechado**
- [ ] Integra��o com m�dulo de contratos
- [ ] Trigger autom�tico ao assinar contrato
- [ ] Hist�rico de mudan�as de status

#### **=� Analytics Avan�ado**
- [ ] Dashboard de convers�o por status
- [ ] M�tricas de performance por vendedor
- [ ] An�lise de funil de vendas

#### **> Automa��es**
- [ ] Email autom�tico para novos clientes
- [ ] Notifica��es de follow-up
- [ ] Integra��o com WhatsApp

#### **=� Mobile**
- [ ] App React Native
- [ ] Sincroniza��o offline
- [ ] GPS para endere�os

---

## <� **BOAS PR�TICAS APLICADAS**

### **<� Clean Architecture**
- Separa��o clara de responsabilidades
- Services para l�gica de neg�cio
- Controllers apenas para entrada/sa�da
- Schemas para valida��o de dados

### **= Seguran�a**
- Row Level Security (RLS) no Supabase
- Valida��o dupla (frontend + backend)
- Logs de auditoria
- Rate limiting

### **=� Documenta��o**
- C�digo comentado em portugu�s
- README detalhado
- Schemas autodocumentados
- Exemplos pr�ticos

### **>� Qualidade**
- Tratamento de erros robusto
- Logs estruturados
- Valida��es em m�ltiplas camadas
- Testes automatizados

---

## =e **EQUIPE**

### **> Desenvolvimento**
- **Claude AI** - Desenvolvimento e arquitetura
- **Ricardo Borges** - Product Owner e requirements

### **=� Suporte**
- Issues: [GitHub Issues](https://github.com/anthropics/claude-code/issues)
- Documenta��o: Este README
- Logs: Backend logs em `logs/`

---

## =� **REFER�NCIAS**

### **= Links �teis**
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Guide](https://nextjs.org/docs)
- [Pydantic Validation](https://docs.pydantic.dev/)

### **=� Padr�es Seguidos**
- [REST API Design](https://restfulapi.net/)
- [Clean Code Principles](https://clean-code-developer.com/)
- [React Best Practices](https://react.dev/learn)

---

**<� O m�dulo de clientes � a base s�lida do sistema Fluyt, demonstrando excel�ncia em arquitetura, implementa��o e documenta��o. Serve como refer�ncia para todos os demais m�dulos do sistema.**

**=� �ltima atualiza��o:** 12/07/2025
**=h=� Autor:** Claude AI + Ricardo Borges
**<� Vers�o:** v2.0.0 - Est�vel