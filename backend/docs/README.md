# 🚀 Fluyt Comercial API - Backend

API REST completa para gestão comercial de móveis planejados, construída com FastAPI, Supabase e arquitetura modular.

## 📋 Visão Geral

🛠️ STACK DEFINIDA
Backend (o que vamos implementar agora):

FastAPI + Python 3.11+
Supabase (PostgreSQL) - já configurado
Pydantic para validação de dados
Pandas para cálculos complexos
Authentication via Supabase Auth + JWT


## Database:

✅ JÁ EXISTE: Supabase com todas as tabelas criadas
✅ JÁ EXISTE: Row Level Security (RLS) configurado
✅ JÁ EXISTE: Dados de exemplo nas tabelas


## Infraestrutura:

Deploy: Railway ou Render
CORS: Configurado para frontend Next.js
Logs: Estruturados para debugging




🔥 ENDPOINTS PRIORITÁRIOS



##1. Autenticação (PRIMEIRO)

pythonPOST /auth/login          # Login com Supabase Auth
POST /auth/refresh        # Refresh token
GET  /auth/me            # Dados do usuário logado


##2. Clientes


pythonGET    /clientes                    # Lista com RLS
POST   /clientes                    # Criar novo
PUT    /clientes/{id}               # Editar
GET    /clientes/{id}               # Detalhes



##2.1. Tabelas

ambientes
aprovacoes
auditoria
auth
clientes
configuracoes
contratos
equipe
montadores
orca mentos
Setores
status orcamento
transportadoras



##3. Ambientes + XML (CORE)


pythonPOST /ambientes/upload-xml          # Upload XML Promob
GET  /ambientes                     # Lista ambientes
GET  /ambientes/{cliente_id}        # Por cliente


##4. Orçamentos (MAIS COMPLEXO)


pythonPOST /orcamentos                    # Criar orçamento
GET  /orcamentos                    # Lista com filtros
GET  /orcamentos/{id}               # Detalhes completos
PUT  /orcamentos/{id}               # Editar
POST /orcamentos/{id}/aprovar       # Aprovar/rejeitar
GET  /orcamentos/{id}/calcular      # Recalcular custos


##5. Configurações (ADMIN)


pythonGET  /config                        # Configurações da loja
PUT  /config/comissoes              # Regras de comissão
PUT  /config/custos                 # Deflator, frete, etc




### Arquitetura
```
ja montada
```

### Padrão de Módulo
Cada módulo segue a estrutura:
```
module_name/
├── controller.py           # 🛣️ Routes FastAPI
├── services.py            # 🔨 Lógica de negócio
├── repository.py          # 💾 Queries database
├── schemas.py             # 📝 Modelos Pydantic
└── tests/                 # 🧪 Testes unitários
```

## ⚡ Quick Start

### 1. Pré-requisitos
```bash
# Python 3.10+
python --version

# Virtual environment
python -m venv venv

venv\Scripts\activate     # Windows
```

### 2. Instalação
```bash
# Instalar dependências
pip install -r requirements.txt

# Copiar arquivo de ambiente
cp env.example .env
```

### 3. Configuração (.env)
```env
# ===== SUPABASE =====
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# ===== JWT =====
JWT_SECRET_KEY=your-super-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# ===== APLICAÇÃO =====
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO

# ===== CORS =====
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Executar
```bash
# Desenvolvimento (com reload)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Ou diretamente
python main.py
```

### 5. Acessar
- **API Docs:** http://localhost:8000/api/v1/docs
- **Health Check:** http://localhost:8000/health
- **Root Info:** http://localhost:8000/

## 🔐 Autenticação e Segurança

### Sistema de Autenticação
- **JWT Bearer Token** obrigatório para todas as rotas protegidas
- **RLS (Row Level Security)** automático por `loja_id`
- **Middleware personalizado** para contexto de usuário

### Perfis de Usuário
```python
class PerfilUsuario(str, Enum):
    USUARIO = "USUARIO"          # Personalizada pelo ADmin
    ADMIN = "ADMIN"              # Todas as lojas + configurações
    ADMIN_MASTER = "ADMIN_MASTER" # Dev # Todas as lojas + configurações + controle dev
```

### Dependências de Autorização
```python
# Exemplos de uso nos controllers
@router.get("/", dependencies=[Depends(get_current_user)])
@router.post("/", dependencies=[Depends(require_vendedor_ou_superior())])
@router.get("/admin", dependencies=[Depends(require_admin())])
```

## 🗃️ Banco de Dados

### Supabase + PostgreSQL
- **RLS habilitado** para isolamento por loja
- **Triggers automáticos** para numeração e auditoria
- **Schema versionado** conforme `docs/schema.md`

### Principais Tabelas
- `c_orcamentos` - Núcleo dos orçamentos
- `c_clientes` - Cadastro de clientes
- `c_ambientes` - Ambientes importados do XML
- `c_contrato` - Contrato para assinatura 
- `config_loja` - Configurações por estabelecimento

### Operações com Database
```python
# Dependency injection automático
async def criar_orcamento(
    db: Client = Depends(get_database)  # RLS aplicado automaticamente
):
    # Operações isoladas por loja do usuário autenticado
    result = db.table('c_orcamentos').insert(data).execute()
```

## 📊 Funcionalidades Principais

### 💰 Sistema de Orçamentos
- Criação automática com todos os ambientes
- Cálculo de custos baseado em configurações
- Plano de pagamento flexível
- Sistema de aprovação hierárquica

### 🏠 Processamento XML
- Importação de XMLs do Promob
- Suporte a múltiplas coleções
- Extração automática de dados
- Validação e logs de processamento

### ✅ Aprovações
- Limites configuráveis por perfil
- Fluxo hierárquico (Vendedor → Gerente → Admin)
- Histórico completo de aprovações
- Notificações automáticas


### 📈 Hierarquia

- **Admin Master:** 
- **Admin:** 
- **Usuário:** 


## 🔧 Configurações

### Variáveis de Ambiente
Todas as configurações são type-safe via Pydantic Settings:

```python
from core.config import settings

# Acesso às configurações
settings.supabase_url
settings.is_development
settings.cors_origins
settings.max_file_size_bytes
```

### Configurações por Loja
Cada loja pode ter:
- Limites de desconto personalizados
- Regras de comissão por faixa
- Custos operacionais específicos
- Numeração de orçamentos customizada

## 🚀 Deploy

### Desenvolvimento
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Produção
```bash
# Com Gunicorn + Uvicorn workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Ou Railway/Render deployment
# (configurações no Procfile/railway.toml)
```

### Variáveis de Produção
```env
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING
# JWT_SECRET_KEY deve ser criptograficamente segura
# CORS_ORIGINS deve ser restrito aos domínios específicos
```

## 🧪 Testes

### Estrutura de Testes
```bash
# Executar todos os testes
pytest

# Testes específicos
pytest modules/orcamentos/tests/

# Com coverage
pytest --cov=modules --cov-report=html
```

### Exemplo de Teste
```python
@pytest.mark.asyncio
async def test_criar_orcamento():
    # Setup de dados
    cliente_data = {...}
    
    # Teste da criação
    response = await client.post("/api/v1/orcamentos/", json=cliente_data)
    
    assert response.status_code == 201
    assert response.json()["numero"] is not None
```

## 📝 Logs e Monitoramento

### Logging Estruturado
```python
import logging
logger = logging.getLogger(__name__)

# Logs automáticos incluem:
logger.info("REQUEST: GET /api/v1/orcamentos/", extra={
    "user_id": user_id,
    "loja_id": loja_id,
    "request_id": request_id
})
```

### Headers de Debug
- `X-Request-ID` - ID único da requisição
- `X-Process-Time` - Tempo de processamento
- `X-Environment` - Ambiente atual (development)

## 🔄 Próximos Passos



## 🆘 Troubleshooting

### Erros Comuns

**ImportError: No module named 'core'**
```bash
# Verificar PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

**Supabase connection failed**
```bash
# Verificar variáveis de ambiente
python -c "from core.config import settings; print(settings.supabase_url)"
```

**JWT decode error**
```bash
# Verificar JWT_SECRET_KEY
# Deve ser a mesma chave usada para gerar o token
```

### Logs Úteis
```bash
# Ver logs detalhados
uvicorn main:app --log-level debug

# Logs de SQL (Supabase)
export SUPABASE_LOG_LEVEL=DEBUG
```

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs detalhados
2. Consultar documentação do Supabase
3. Revisar configurações no arquivo `.env`
4. Checar permissões RLS no dashboard Supabase






🧮 REGRAS DE NEGÓCIO CRÍTICAS
❗ COMISSÃO PROGRESSIVA (NÃO LINEAR)
VENDEDOR - Por faixa da venda individual:
python# Exemplo: Venda R$ 40.000
# Faixas: Até 25k=5%, 25k-50k=6%, 50k+=8%
def calcular_comissao_vendedor(valor_venda):
    if valor_venda <= 25000:
        return valor_venda * 0.05
    elif valor_venda <= 50000:
        return (25000 * 0.05) + ((valor_venda - 25000) * 0.06)
    else:
        return (25000 * 0.05) + (25000 * 0.06) + ((valor_venda - 50000) * 0.08)

# R$ 40k = (25k×5%) + (15k×6%) = R$ 1.250 + R$ 900 = R$ 2.150
GERENTE - Sobre total vendas da equipe:
python# Mesmo cálculo progressivo, mas sobre soma total da equipe no mês
❗ MÍNIMO GARANTIDO - NÃO AFETA ORÇAMENTO
python# IMPORTANTE: Mínimo garantido é custo operacional
# NÃO entra no cálculo de margem do orçamento
# Apenas garante salário mínimo do vendedor

def salario_vendedor(comissao_calculada, minimo_garantido):
    return max(comissao_calculada, minimo_garantido)

# Mas no orçamento usa sempre a comissão calculada
❗ RLS - ISOLAMENTO POR LOJA
python# TODA consulta deve filtrar por loja do usuário
async def get_user_loja_id(current_user) -> str:
    # Extrair loja_id do JWT ou user metadata
    return current_user.loja_id

# Aplicar em TODAS as queries
❗ CUSTOS - SEMPRE SNAPSHOT
python# Quando orçamento é criado, salvar configurações vigentes
orcamento_data = {
    "custo_fabrica": valor_xml * deflator_atual,
    "comissao_vendedor": calcular_comissao(valor, regras_atuais),
    "config_snapshot": {
        "deflator": deflator_atual,
        "regras_comissao": regras_atuais,
        # ... todas as configs do momento
    }
}


🔐 SEGURANÇA OBRIGATÓRIA
1. Authentication Middleware
python# Toda rota (exceto login) precisa de JWT válido
@app.middleware("http")
async def auth_middleware(request, call_next):
    # Validar JWT Supabase
    # Extrair user_id e loja_id
    # Adicionar ao request.state
2. RLS Enforcement
python# Toda query deve incluir loja_id automaticamente
async def execute_with_rls(query: str, user_loja_id: str):
    # Adicionar WHERE loja_id = {user_loja_id} automaticamente
3. Permissões por Perfil
pythondef require_admin_master(current_user):
    if current_user.perfil != "ADMIN_MASTER":
        raise HTTPException(403, "Apenas Admin Master")

def hide_margin_from_vendedor(data, current_user):
    if current_user.perfil == "VENDEDOR":
        # Remover campos de custo e margem
        data.pop("custo_fabrica", None)
        data.pop("margem_lucro", None)


🔄 XML PROCESSOR (CRÍTICO)
Baseado no documento modulos.md, o sistema precisa processar XMLs do Promob:
pythonclass PromobXMLProcessor:
    def parse_xml(self, xml_content: bytes) -> Dict:
        # Extrair ambientes conforme 4 coleções:
        # - Unique, Sublime, Portábille, Brilhart Color
        
        return {
            "cliente": {
                "nome": "...",
                "endereco": "..."
            },
            "ambientes": [
                {
                    "nome": "Cozinha",
                    "valor": 15000.00,
                    "colecao": "Unique",
                    "detalhes": {...}
                }
            ],
            "valor_total": 35000.00
        }





📊 ENGINE DE CÁLCULO
pythonclass CalculationEngine:
    def calcular_orcamento(self, ambientes: List, desconto: float, config: Dict):
        valor_base = sum(amb.valor for amb in ambientes)
        valor_final = valor_base * (1 - desconto)
        
        # Custos baseados em config
        custo_fabrica = valor_base * config.deflator
        comissao_vendedor = self.calcular_comissao_progressiva(valor_final, "VENDEDOR")
        comissao_gerente = self.calcular_comissao_progressiva(valor_final, "GERENTE")
        custo_medidor = config.valor_medidor
        custo_frete = valor_final * config.percentual_frete
        
        margem = valor_final - (custo_fabrica + comissao_vendedor + 
                               comissao_gerente + custo_medidor + custo_frete)
        
        return {
            "valor_final": valor_final,
            "margem": margem,  # SÓ Admin Master vê
            "custos": {...}    # SÓ Admin Master vê
        }


🚨 VALIDAÇÕES CRÍTICAS
Antes de implementar qualquer endpoint:

 RLS está funcionando? (usuário só vê sua loja)
 Comissão é progressiva por faixa? (não linear)
 Mínimo garantido NÃO afeta orçamento?
 Vendedor NÃO vê margem? (só Admin Master)
 Snapshot de configurações salvo?
 Todos ambientes incluídos automaticamente?



📝 EXEMPLO DE IMPLEMENTAÇÃO
python# modules/orcamentos/controller.py
@router.post("/", response_model=OrcamentoResponse)
async def criar_orcamento(
    data: OrcamentoCreate,
    current_user: User = Depends(get_current_user)
):
    # 1. Validar se user pode criar orçamento
    # 2. Buscar configurações atuais da loja
    # 3. Calcular custos com engine
    # 4. Salvar com snapshot de config
    # 5. Verificar se precisa aprovação
    # 6. Retornar dados filtrados por perfil
    
    service = OrcamentoService()
    orcamento = await service.criar(data, current_user)
    
    # Filtrar dados por perfil
    if current_user.perfil != "ADMIN_MASTER":
        orcamento.margem_lucro = None
        orcamento.custo_fabrica = None
    
    return orcamento

✅ PRÓXIMOS PASSOS

Criar estrutura de pastas conforme especificado, parte ja existe 
Implementar conexão Supabase com RLS
Criar models Pydantic baseados no schema existente
Implementar auth middleware com JWT
Começar com endpoints simples (clientes)
Implementar engine de cálculo progressivo
Testar com dados reais do Supabase

FOCO: Funcionalidade antes de elegância. O objetivo é ter o sistema funcionando corretamente com as regras de negócio implementadas.
REMEMBER: O database já existe e tem dados de exemplo. Use-os para testar!

**Status:** ✅ **PRONTO PARA DESENVOLVIMENTO**
