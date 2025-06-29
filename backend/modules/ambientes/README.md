# 📋 MÓDULO AMBIENTES - DOCUMENTAÇÃO COMPLETA

**Última atualização:** 29/06/2025  
**Autor:** Ricardo Borges  
**Status:** ✅ Funcional com importação XML

## 📊 VISÃO GERAL

O módulo Ambientes gerencia ambientes de móveis planejados, permitindo:
- Criar ambientes manualmente
- Importar ambientes de arquivos XML do Promob
- Armazenar detalhes técnicos em formato JSON flexível
- Calcular valores de custo e venda

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `c_ambientes`
```sql
- id: UUID (PK)
- cliente_id: UUID (FK → c_clientes) OBRIGATÓRIO
- nome: TEXT 
- valor_custo_fabrica: DECIMAL(10,2)
- valor_venda: DECIMAL(10,2)
- data_importacao: DATE
- hora_importacao: TIME
- origem: VARCHAR(20) ['xml', 'manual']
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Tabela: `c_ambientes_material`
```sql
- id: UUID (PK)
- ambiente_id: UUID (FK → c_ambientes) ÚNICO
- materiais_json: JSONB
- xml_hash: VARCHAR(64) - Hash SHA256 do XML (ÍNDICE ÚNICO)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🔧 ENDPOINTS DA API

### Listar Ambientes
```http
GET /api/ambientes
```

### Buscar Ambiente
```http
GET /api/ambientes/{id}
```

### Criar Ambiente
```http
POST /api/ambientes
```

### Atualizar Ambiente
```http
PUT /api/ambientes/{id}
```

### Excluir Ambiente
```http
DELETE /api/ambientes/{id}
```

### Importar XML
```http
POST /api/ambientes/importar-xml?cliente_id={uuid}
```

## 🚀 MELHORIAS IMPLEMENTADAS

1. **Segurança**
   - Validação robusta de upload XML
   - Prevenção de path traversal
   - Hash SHA256 para evitar duplicatas

2. **Performance**
   - JOINs otimizados (sem N+1)
   - Índice único no xml_hash
   - Paginação eficiente

3. **Código Limpo**
   - Service reduzido de 559 para 170 linhas
   - Validações unificadas
   - Conversão monetária centralizada

4. **Integridade**
   - Transações via RPC
   - Field converter para snake_case/camelCase
   - Tratamento de erros centralizado