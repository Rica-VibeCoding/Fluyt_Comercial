# 🎯 MISSÃO: IMPLEMENTAR BACKEND DO MÓDULO AMBIENTES

**Data:** 2025-01-29  
**Gerente:** Claude Code  
**Desenvolvedor:** IA Backend  
**Prazo:** 3-4 horas  

## 📋 CONTEXTO

O módulo de Ambientes gerencia ambientes de móveis planejados, com dados importados de XML ou criados manualmente. As tabelas já foram criadas no Supabase com a seguinte estrutura:

### **Tabelas no Banco:**

1. **c_ambientes** - Tabela principal
```sql
- id: UUID
- cliente_id: UUID (FK para c_clientes)
- nome: TEXT
- valor_custo_fabrica: DECIMAL(10,2)
- valor_venda: DECIMAL(10,2)
- data_importacao: DATE
- hora_importacao: TIME
- origem: VARCHAR(20) ('xml' ou 'manual')
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

2. **c_ambientes_material** - Detalhes em JSON
```sql
- id: UUID
- ambiente_id: UUID (FK para c_ambientes)
- materiais_json: JSONB
- xml_hash: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🎯 OBJETIVOS

Criar o backend completo seguindo a estrutura padrão:
- `schemas.py` - Modelos Pydantic
- `repository.py` - Acesso ao banco
- `services.py` - Lógica de negócio
- `controller.py` - Endpoints REST

## 📐 ARQUITETURA ESPERADA

### **1. Schemas (schemas.py)**

```python
# Classes necessárias:
- AmbienteBase
- AmbienteCreate 
- AmbienteUpdate
- AmbienteResponse (com materiais opcionalmente)
- AmbienteMaterialCreate
- AmbienteMaterialResponse
- AmbienteListResponse (com paginação)
- AmbienteFiltros
```

### **2. Repository (repository.py)**

Métodos necessários:
- `criar_ambiente()`
- `obter_ambiente_por_id()` - COM JOIN opcional para materiais
- `listar_ambientes()` - com filtros e paginação
- `atualizar_ambiente()`
- `deletar_ambiente()` - DELETE real (não soft delete)
- `criar_material_ambiente()`
- `obter_materiais_ambiente()`
- `atualizar_material_ambiente()`

### **3. Services (services.py)**

Lógica de negócio:
- Validar se cliente existe antes de criar ambiente
- Calcular valores se necessário
- Gerenciar transações (ambiente + materiais)
- Validar origem (xml/manual)

### **4. Controller (controller.py)**

Endpoints REST:
```
GET    /api/v1/ambientes - Listar com filtros
POST   /api/v1/ambientes - Criar ambiente
GET    /api/v1/ambientes/{id} - Obter por ID
PUT    /api/v1/ambientes/{id} - Atualizar
DELETE /api/v1/ambientes/{id} - Deletar

GET    /api/v1/ambientes/{id}/materiais - Obter materiais
POST   /api/v1/ambientes/{id}/materiais - Criar/atualizar materiais
```

## 🔧 REQUISITOS TÉCNICOS

### **Conversão de Nomes**
- Backend usa `snake_case` (valor_custo_fabrica)
- Frontend espera `camelCase` (valorCustoFabrica)
- Use o middleware `field_converter.py` existente

### **Resposta Agregada**
Quando solicitado com `?include=materiais`, retornar:
```json
{
  "id": "uuid",
  "nome": "Cozinha Gourmet",
  "clienteId": "uuid",
  "valorCustoFabrica": 1500.00,
  "valorVenda": 3000.00,
  "origem": "xml",
  "materiais": {
    // conteúdo do JSONB
  }
}
```

### **Filtros Disponíveis**
- Por cliente_id
- Por origem (xml/manual)
- Por período de importação
- Por nome (busca parcial)

## 📦 PADRÕES A SEGUIR

1. **Use o módulo LOJAS como referência** de estrutura e padrões
2. **Comentários em PT-BR** explicando a lógica
3. **Tratamento de erros** com mensagens claras
4. **Logs** em operações importantes
5. **Validações** antes de salvar no banco

## ⚠️ ATENÇÃO ESPECIAL

1. **Materiais são opcionais** - um ambiente pode não ter materiais
2. **XML Hash** - usado para evitar duplicatas na importação
3. **Transações** - ao criar ambiente com materiais, usar transação
4. **Performance** - cuidado com N+1 queries ao listar

## 🧪 VALIDAÇÃO

Após implementar, teste:
1. CRUD completo de ambientes
2. Associar/atualizar materiais
3. Filtros funcionando
4. Paginação correta
5. Conversão camelCase ↔ snake_case

## 📝 ENTREGÁVEIS

1. Arquivos criados em `/backend/modules/ambientes/`:
   - `__init__.py`
   - `schemas.py`
   - `repository.py`
   - `services.py`
   - `controller.py`

2. Registro da rota em `/backend/main.py`

3. Testes básicos funcionando

## 🚀 INICIAR IMPLEMENTAÇÃO

1. Criar a estrutura de arquivos
2. Implementar schemas primeiro
3. Repository com queries otimizadas
4. Services com validações
5. Controller com endpoints REST
6. Registrar rotas
7. Testar tudo

**BOA SORTE! Implemente com qualidade de código sênior.**