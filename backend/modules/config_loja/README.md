# Módulo Config_Loja

## Visão Geral
Módulo responsável pelo gerenciamento das configurações operacionais por loja no sistema Fluyt Comercial.

## Funcionalidades
- ✅ **CRUD Completo**: Criar, listar, obter, atualizar e excluir configurações
- ✅ **Configuração Padrão**: Criação automática de configurações com valores padrão
- ✅ **Validações**: Hierarquia de descontos, percentuais e campos obrigatórios
- ✅ **Permissões**: Controle de acesso baseado em perfil (ADMIN+)
- ✅ **Auditoria**: Rastreamento de criação e atualização

## Estrutura do Módulo

### Backend (`/backend/modules/config_loja/`)
```
config_loja/
├── __init__.py
├── controller.py      # 9 endpoints REST
├── repository.py      # Acesso ao banco (Supabase)
├── schemas.py         # Modelos Pydantic + validações
└── services.py        # Lógica de negócio
```

### Frontend (`/Frontend/src/`)
```
├── hooks/modulos/sistema/use-config-loja.ts    # Hook principal
├── components/modulos/sistema/configuracoes/   # Componentes UI
├── lib/validations/config-loja.ts             # Validações centralizadas
└── lib/utils/numbering-formatter.ts           # Utilitário de numeração
```

## API Endpoints

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| `GET` | `/config-loja` | Lista configurações | Qualquer |
| `GET` | `/config-loja/loja/{store_id}` | Obter por loja | Qualquer |
| `POST` | `/config-loja` | Criar configuração | ADMIN+ |
| `PUT` | `/config-loja/{config_id}` | Atualizar configuração | ADMIN+ |
| `DELETE` | `/config-loja/{config_id}` | Excluir configuração | SUPER_ADMIN |
| `POST` | `/config-loja/loja/{store_id}/padrao` | Criar configuração padrão | ADMIN+ |

## Campos da Configuração

### Limites de Desconto (%)
- `discount_limit_vendor`: Limite para vendedores
- `discount_limit_manager`: Limite para gerentes  
- `discount_limit_admin_master`: Limite para administradores

### Valores Operacionais
- `default_measurement_value`: Valor padrão de medição (R$)
- `freight_percentage`: Percentual de frete (%)
- `assembly_percentage`: Percentual de montagem (%)
- `executive_project_percentage`: Percentual de projeto executivo (%)

### Numeração de Orçamentos
- `initial_number`: Número inicial
- `number_format`: Formato (YYYY-NNNNNN, MM-YYYY-NNNN, etc.)
- `number_prefix`: Prefixo (ex: "ORC")

## Validações Implementadas

### Hierarquia de Descontos
```
vendedor <= gerente <= admin_master
```

### Percentuais
- Todos os valores percentuais: 0% ≤ valor ≤ 100%

### Campos Obrigatórios
- `store_id`, `freight_percentage`, `assembly_percentage`, `executive_project_percentage`, `number_format`

## Exemplo de Uso

### Frontend (Hook)
```typescript
const {
  configuracoes,
  loading,
  salvarConfiguracao,
  obterConfiguracao
} = useConfigLoja();

// Salvar configuração
const sucesso = await salvarConfiguracao({
  storeId: "123",
  discountLimitVendor: 10,
  discountLimitManager: 20,
  discountLimitAdminMaster: 50,
  // ... outros campos
});
```

### Backend (API)
```python
# Criar configuração
POST /api/v1/config-loja
{
  "store_id": "123e4567-e89b-12d3-a456-426614174000",
  "discount_limit_vendor": 10.0,
  "discount_limit_manager": 20.0,
  "discount_limit_admin_master": 50.0
}

# Resposta
{
  "success": true,
  "data": {
    "id": "config-id",
    "store_id": "123e4567-e89b-12d3-a456-426614174000",
    // ... campos da configuração
  }
}
```

## Arquitetura

### Padrão MVC
- **Controller**: Endpoints HTTP + autenticação
- **Service**: Lógica de negócio + validações
- **Repository**: Acesso aos dados + queries

### Frontend
- **Hook**: `useConfigLoja` baseado em `useApiCrud` genérico
- **Componentes**: Separados por responsabilidade (container, form, stats)
- **Validações**: Centralizadas em `ConfigLojaValidator`

## Tecnologias
- **Backend**: FastAPI + Supabase + Pydantic
- **Frontend**: React + TypeScript + Zustand
- **Autenticação**: JWT + RLS (Row Level Security)
- **Rate Limiting**: SlowAPI (30 req/min leitura, 10 req/min escrita)

## Testes
Arquivo de teste disponível: `/Frontend/test-config-loja-integration.html`

Execute no navegador para validar integração completa frontend ↔ backend.