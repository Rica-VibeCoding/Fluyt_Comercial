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