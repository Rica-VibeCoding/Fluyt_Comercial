# 🧪 MISSÃO INTEGRAÇÃO - MÓDULO [NOME_MODULO]

> **ID:** T03_INTEGRACAO_[MODULO]  
> **Responsável:** IA Testes  
> **Status:** 🔒 Bloqueado (aguarda Backend)  
> **Dependências:** Backend com API funcionando  
> **Execução:** Pode ser paralela com Frontend  

## 🎯 OBJETIVO

Validar a integração completa do módulo [NOME], garantindo que o fluxo end-to-end funcione perfeitamente, com foco em segurança, performance e experiência do usuário com dados reais do Supabase.

## 📋 PRÉ-REQUISITOS

### Backend Disponível
- **Base URL:** `http://localhost:8000/api/v1`
- **Documentação:** `http://localhost:8000/docs`
- **Endpoints implementados:**
  - GET `/[modulo]` - Listar
  - GET `/[modulo]/{id}` - Buscar
  - POST `/[modulo]` - Criar
  - PUT `/[modulo]/{id}` - Atualizar
  - DELETE `/[modulo]/{id}` - Excluir

### Credenciais de Teste
```json
{
  "admin": {
    "email": "admin@fluyt.com",
    "password": "senha123",
    "perfil": "ADMIN"
  },
  "vendedor": {
    "email": "vendedor@fluyt.com",
    "password": "senha123",
    "perfil": "VENDEDOR"
  }
}
```

## 📁 ESTRUTURA DE TESTES

```bash
tests/[modulo]/
├── postman/
│   └── [Modulo]_Collection.json      # Coleção Postman
├── integration/
│   └── [modulo].test.ts             # Testes E2E
├── scenarios/
│   └── README.md                     # Cenários documentados
└── reports/
    └── test-results.md               # Resultados dos testes
```

## ✅ CHECKLIST DE TESTES

### 1️⃣ TESTES DE API (Postman/Insomnia)

#### Configuração Inicial
```javascript
// Variables
{
  "base_url": "http://localhost:8000/api/v1",
  "token": "{{auth_token}}",
  "[modulo]_id": ""
}

// Pre-request Script (Login)
pm.sendRequest({
  url: pm.variables.get("base_url") + "/auth/login",
  method: 'POST',
  header: { 'Content-Type': 'application/json' },
  body: {
    mode: 'raw',
    raw: JSON.stringify({
      email: "admin@fluyt.com",
      password: "senha123"
    })
  }
}, (err, res) => {
  const token = res.json().access_token;
  pm.variables.set("auth_token", token);
});
```

#### Requests Obrigatórios
- [ ] **1. Listar Todos**
  ```
  GET {{base_url}}/[modulo]
  Headers: Authorization: Bearer {{token}}
  Tests: Status 200, Array response, Pagination info
  ```

- [ ] **2. Criar Novo**
  ```
  POST {{base_url}}/[modulo]
  Body: { "nome": "Teste {{$timestamp}}", "campo2": "valor" }
  Tests: Status 201, ID retornado, Dados corretos
  Save: [modulo]_id = response.id
  ```

- [ ] **3. Buscar por ID**
  ```
  GET {{base_url}}/[modulo]/{{[modulo]_id}}
  Tests: Status 200, Dados completos
  ```

- [ ] **4. Atualizar**
  ```
  PUT {{base_url}}/[modulo]/{{[modulo]_id}}
  Body: { "nome": "Atualizado {{$timestamp}}" }
  Tests: Status 200, Dados atualizados
  ```

- [ ] **5. Excluir**
  ```
  DELETE {{base_url}}/[modulo]/{{[modulo]_id}}
  Tests: Status 200, Soft delete aplicado
  ```

### 2️⃣ TESTES DE VALIDAÇÃO

#### Campos Obrigatórios
- [ ] POST sem campo obrigatório → 422
- [ ] POST com campo vazio → 422
- [ ] PUT removendo obrigatório → 422

#### Duplicidade
- [ ] POST com nome duplicado → 409
- [ ] PUT mudando para nome existente → 409
- [ ] Verificar endpoint `/verificar-nome`

#### Tipos de Dados
- [ ] String onde espera número → 422
- [ ] Data em formato inválido → 422
- [ ] UUID inválido → 422

### 3️⃣ TESTES DE PERMISSÃO

#### Por Perfil de Usuário
| Ação | SUPER_ADMIN | ADMIN | VENDEDOR | Esperado |
|------|-------------|-------|----------|----------|
| Listar | ✅ | ✅ | ✅ | 200 |
| Criar | ✅ | ✅ | ❌ | 403 |
| Editar | ✅ | ✅ | ❌ | 403 |
| Excluir | ✅ | ❌ | ❌ | 403 |

- [ ] Testar cada combinação
- [ ] Verificar mensagens de erro
- [ ] Confirmar logs de auditoria

#### Multi-tenant (se aplicável)
- [ ] Usuário Loja A não vê dados Loja B
- [ ] SUPER_ADMIN vê todos
- [ ] Filtros respeitam isolamento

### 4️⃣ TESTES DE INTEGRAÇÃO E2E

#### Fluxo Completo
```typescript
describe('Módulo [Nome] - E2E', () => {
  it('deve completar fluxo CRUD', async () => {
    // 1. Login
    await loginAs('admin@fluyt.com', 'senha123');
    
    // 2. Navegar para módulo
    await page.goto('/painel/[modulo]');
    
    // 3. Criar novo
    await page.click('button:has-text("Novo")');
    await page.fill('input[name="nome"]', 'Teste E2E');
    await page.click('button:has-text("Salvar")');
    
    // 4. Verificar na lista
    await expect(page.locator('text=Teste E2E')).toBeVisible();
    
    // 5. Editar
    await page.click('button[aria-label="Editar"]');
    await page.fill('input[name="nome"]', 'Teste Editado');
    await page.click('button:has-text("Salvar")');
    
    // 6. Excluir
    await page.click('button[aria-label="Excluir"]');
    await page.click('button:has-text("Confirmar")');
    
    // 7. Verificar exclusão
    await expect(page.locator('text=Teste Editado')).not.toBeVisible();
  });
});
```

### 5️⃣ TESTES DE PERFORMANCE

#### Métricas a Validar
- [ ] GET /[modulo] < 200ms (20 registros)
- [ ] GET /[modulo] < 500ms (100 registros)
- [ ] POST /[modulo] < 300ms
- [ ] Sem N+1 queries detectadas

#### Query Analysis
```sql
-- Verificar queries executadas
SELECT query, calls, mean_time
FROM pg_stat_statements
WHERE query LIKE '%cad_[modulo]%'
ORDER BY mean_time DESC;
```

### 6️⃣ TESTES DE DADOS REAIS

#### Validação Supabase
- [ ] Dados criados aparecem no dashboard
- [ ] Soft delete marca ativo = false
- [ ] Timestamps corretos (UTC)
- [ ] Relacionamentos íntegros

#### Queries Diretas
```sql
-- Verificar dados
SELECT * FROM cad_[modulo] ORDER BY created_at DESC LIMIT 10;

-- Verificar soft deletes
SELECT * FROM cad_[modulo] WHERE ativo = false;

-- Verificar relacionamentos
SELECT m.*, COUNT(r.id) as total_relacionados
FROM cad_[modulo] m
LEFT JOIN [tabela_relacionada] r ON r.[modulo]_id = m.id
GROUP BY m.id;
```

## 📊 RELATÓRIO DE TESTES

### Template de Documentação
```markdown
# Relatório de Testes - Módulo [Nome]
Data: [data]
Testador: IA Testes

## Resumo Executivo
- Total de testes: X
- Sucessos: X (X%)
- Falhas: X (X%)
- Tempo total: Xmin

## Testes de API
### ✅ Passou
- [Lista dos que passaram]

### ❌ Falhou
- [Lista dos que falharam com motivo]

## Testes de Integração
[Resultados]

## Performance
- Tempo médio resposta: Xms
- Queries otimizadas: Sim/Não
- Gargalos identificados: [lista]

## Segurança
- Permissões: OK/Issues
- Multi-tenant: OK/Issues
- Validações: OK/Issues

## Recomendações
1. [Ação recomendada 1]
2. [Ação recomendada 2]
```

## 🐛 CENÁRIOS DE ERRO

### Casos Críticos a Testar
1. **API Fora**
   - Frontend mostra erro apropriado
   - Não trava a aplicação
   - Retry automático?

2. **Token Expirado**
   - Redirect para login
   - Preserva dados do form
   - Mensagem clara

3. **Dados Inválidos**
   - Validação client-side primeiro
   - Mensagens específicas
   - Campos destacados

4. **Concorrência**
   - Dois usuários editando mesmo registro
   - Conflito tratado adequadamente
   - Versioning/timestamp check

5. **Limite de Rate**
   - Muitas requisições rápidas
   - Feedback adequado
   - Backoff implementado

## ✅ CRITÉRIOS DE ACEITAÇÃO

### Funcionais
- [ ] CRUD completo testado e funcionando
- [ ] Validações aplicadas corretamente
- [ ] Permissões respeitadas
- [ ] Dados reais no Supabase

### Não-Funcionais
- [ ] Performance dentro dos limites
- [ ] Segurança validada
- [ ] UX consistente
- [ ] Sem memory leaks

### Documentação
- [ ] Collection Postman exportada
- [ ] Cenários documentados
- [ ] Relatório de testes completo
- [ ] Issues encontradas reportadas

## 🚀 ENTREGA

1. **Executar todos os testes** sistematicamente
2. **Documentar resultados** no relatório
3. **Exportar evidências** (screenshots, logs)
4. **Criar issues** para problemas encontrados
5. **Notificar conclusão** com resumo

## ⚠️ PONTOS CRÍTICOS

1. **Dados de Produção**: NUNCA usar em testes
2. **Limpeza**: Remover dados de teste após execução
3. **Isolamento**: Testes não devem depender uns dos outros
4. **Idempotência**: Executar N vezes = mesmo resultado
5. **Cobertura**: Testar casos felizes E casos de erro

---

**LEMBRE-SE:** O objetivo é garantir que o módulo funcione perfeitamente em produção, com dados reais, respeitando todas as regras de negócio e requisitos não-funcionais!