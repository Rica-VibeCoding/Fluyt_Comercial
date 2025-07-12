# Histórico de Problemas e Soluções - Módulo Clientes

Este documento registra problemas notáveis encontrados no módulo de clientes e as soluções aplicadas, servindo como referência para futuras manutenções e depurações.

---

## 1. Travamento ao Editar Cliente via Menu de Ações ("...")

- **Data da Resolução:** 31/07/2024
- **Arquivos Afetados:** `cliente-actions-menu.tsx`

### Problema
A interface do usuário travava completamente ao tentar editar um cliente usando a opção "Editar" de dentro do menu de contexto (ícone "..."). No entanto, a edição funcionava normalmente quando acionada pelo botão de edição direto (ícone de lápis).

### Análise e Diagnóstico
A investigação revelou que, embora ambos os botões chamassem a mesma função (`onEditarCliente`) com os mesmos dados, o ambiente de execução era diferente. O menu de contexto é renderizado por um componente `DropdownMenu` (da biblioteca `shadcn/ui`), que possui uma lógica interna complexa para gerenciamento de estado, foco e animações.

O travamento era causado por um conflito de renderização: a lógica do `DropdownMenu` para fechar o menu estava competindo com a lógica do `ClientePage` para abrir o modal de edição. Essas duas operações de UI pesadas, disparadas simultaneamente pelo mesmo clique, causavam um "congestionamento" no ciclo de renderização do React, resultando no travamento da página.

### Solução
A solução foi desacoplar as duas operações, garantindo que o menu tivesse tempo de fechar antes que o modal começasse a abrir. Isso foi alcançado envolvendo a chamada `onEditar(cliente)` dentro de um `setTimeout` com um pequeno atraso (50 milissegundos). Esse atraso é imperceptível para o usuário, mas eficaz em dar ao React tempo suficiente para processar o fechamento do menu antes de iniciar a renderização do modal, resolvendo o conflito.

**Implementação em `cliente-actions-menu.tsx`:**

```typescript
const handleEditClick = () => {
  // Adiciona um pequeno delay para permitir que o menu feche antes de abrir o modal.
  setTimeout(() => {
    onEditar(cliente);
  }, 50);
};

// ...

<DropdownMenuItem onClick={handleEditClick}>
  <Edit className="mr-2 h-4 w-4" />
  Editar
</DropdownMenuItem>
``` 

---

## 2. Campo "Procedência" Ausente ou Inconsistente na Tabela

- **Data da Resolução:** 31/07/2024
- **Arquivos Afetados:** `backend/modules/clientes/repository.py`

### Problema
O campo "Procedência" não era exibido de forma consistente na tabela de clientes. Ele aparecia ausente no carregamento inicial da página (ou após um F5), mas podia aparecer "magicamente" após certas ações, como editar um cliente.

### Análise e Diagnóstico
A depuração profunda revelou uma inconsistência crítica na camada de acesso a dados do backend (`repository.py`):

- **Listagem de Clientes (`listar`):** A função que buscava a lista completa de clientes fazia um `SELECT` simples na tabela `c_clientes` e **não incluía os dados da tabela de procedências** (`c_procedencias`). Ela retornava apenas o `procedencia_id`.
- **Busca de Cliente Único (`buscar_por_id`):** A função que buscava um cliente específico por seu ID utilizava a sintaxe de `JOIN` do Supabase e **incluía o nome da procedência**.

Essa diferença criava o comportamento errático: a tabela era populada com dados incompletos (sem o nome da procedência), mas ações que disparavam a busca de um cliente único podiam temporariamente "corrigir" a exibição para aquele item específico.

### Solução
A solução definitiva foi refatorar a função `listar` no `ClienteRepository` para que ela use a mesma lógica de `JOIN` da função `buscar_por_id`. A nova implementação unificada utiliza a seguinte consulta:

```sql
SELECT 
  *,
  vendedor:cad_equipe!vendedor_id(id, nome),
  procedencia:c_procedencias!procedencia_id(id, nome)
FROM c_clientes;
```

Isso garante que a API sempre retorne os dados da procedência junto com os dados do cliente, em uma única consulta eficiente. A correção eliminou a inconsistência, resolveu o problema de exibição no frontend e ainda otimizou o acesso ao banco de dados, removendo a necessidade de consultas separadas. 