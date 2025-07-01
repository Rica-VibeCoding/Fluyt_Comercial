# Módulo Ambientes - Documentação Técnica

## Visão Geral
Módulo responsável por gerenciar ambientes de móveis planejados com importação XML do Promob.

## Componentes

### AmbientePage
**Uso**: Página principal do módulo
**Funcionalidades**:
- Listagem de ambientes por cliente
- Importação XML via upload
- Criação manual de ambientes
- Navegação para orçamento

### AmbienteTable
**Uso**: Tabela expansível com detalhes
**Funcionalidades**:
- Cache inteligente de materiais
- Estados de loading/erro
- Indicadores visuais na linha principal
- Expansão com detalhes completos

### AmbienteMaterialDetail
**Uso**: Exibição rica de materiais XML
**Props**:
- `materiais: MaterialData` - Estrutura JSON do backend

**Estrutura de Dados**:
```typescript
{
  linha_detectada: "Unique / Sublime",
  caixa: { material: "MDF", cor: "Frapê" },
  ferragens: { puxadores: "Ponto > 2551" },
  valor_total: { valor_venda: "R$ 8.698,50" }
}
```

### AmbienteModal
**Uso**: Criação manual de ambientes
**Validações**:
- Nome obrigatório (min 2 chars)
- Valores monetários positivos
- Cliente obrigatório

## Hooks

### useAmbientes(clienteId)
**Funcionalidades**:
- CRUD completo
- Cache automático
- Estados de loading/erro
- Materiais sempre incluídos

**Retorno**:
```typescript
{
  ambientes: Ambiente[],
  isLoading: boolean,
  error: string | null,
  adicionarAmbiente: (dados) => Promise<boolean>
}
```

## Performance
- ✅ Materiais incluídos por padrão
- ✅ Cache de materiais por sessão
- ✅ Requests otimizados
- ✅ Loading states específicos

## Integração Backend
- **Endpoint**: `/api/v1/ambientes`
- **Autenticação**: Bearer token
- **Formato**: snake_case → camelCase
- **Materiais**: JSONB estruturado