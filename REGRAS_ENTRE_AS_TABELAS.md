# Regras de Negócio e Relacionamento entre Tabelas

Este documento serve para registrar as regras de negócio e o fluxo de dados que governam as interações entre as diferentes partes do sistema (Frontend, Backend, Banco de Dados). O objetivo é garantir que todos os desenvolvedores (atuais e futuros, incluindo IAs) sigam a mesma lógica.

## 1. Criação de um Novo Cliente

**Contexto:** Um novo cliente sempre é cadastrado por um usuário (vendedor, gerente, etc.) que está logado no sistema.

**Regra de Negócio:** Ao cadastrar um novo cliente, ele deve ser automaticamente associado à **loja** e ao **vendedor** que realizaram o cadastro, sem a necessidade de seleção manual desses dados no formulário.

### Papel de Cada Componente:

#### **Banco de Dados (Supabase)**

*   **Função:** Armazenar os dados e garantir a integridade.
*   **Tabela `c_clientes`:** Possui os campos `loja_id` e `vendedor_id`.
*   **O que ele faz:** Apenas garante que, se um valor for inserido nesses campos, ele deve corresponder a um ID válido nas tabelas `c_lojas` e `cad_equipe`, respectivamente (integridade referencial).
*   **O que ele NÃO faz:** Ele não sabe qual usuário está logado e não preenche esses campos automaticamente. A responsabilidade de fornecer os valores corretos não é dele.

#### **Backend (API)**

*   **Função:** Orquestrar a lógica de negócio e se comunicar com o banco de dados.
*   **O que ele faz:**
    1.  Recebe a requisição do frontend para criar um novo cliente (contendo apenas os dados básicos como nome, telefone, etc.).
    2.  Verifica o token de autenticação da requisição para identificar qual **usuário (vendedor)** está logado.
    3.  Com o ID do usuário, consulta a tabela `cad_equipe` para obter o `loja_id` associado a ele.
    4.  Ao montar o objeto para salvar no banco, ele **adiciona programaticamente** o `vendedor_id` (do usuário logado) e o `loja_id` (que ele acabou de buscar).
    5.  Envia o comando SQL para o banco de dados com os dados completos do cliente, incluindo os IDs da loja e vendedor.
*   **Ponto-chave:** O backend é o cérebro da operação, garantindo que a regra de negócio seja cumprida de forma segura e automática.

#### **Frontend (Interface do Usuário)**

*   **Função:** Coletar os dados do usuário e interagir com o backend.
*   **O que ele faz:**
    1.  Gerencia o login do usuário. Após o login, armazena as informações do usuário logado (como o token de autenticação).
    2.  Apresenta um formulário para o cadastro de um novo cliente, pedindo apenas as informações pertinentes ao cliente (nome, contato, endereço, etc.).
    3.  **NÃO** exibe campos para o usuário selecionar a loja ou o vendedor. Essa informação já é conhecida pelo sistema.
    4.  Envia a requisição para o endpoint de "criar cliente" no backend, passando os dados do formulário e o token de autenticação no cabeçalho da requisição.
*   **Ponto-chave:** O frontend simplifica a experiência do usuário, pedindo apenas o necessário e confiando que o backend fará o resto.

---

## 2. Tabelas para Versões Futuras (V2/V3)

**Contexto:** Existem tabelas no banco de dados que foram criadas para suportar funcionalidades que não serão desenvolvidas na versão atual (V1) do sistema.

**Regra de Negócio:** Nenhuma funcionalidade de backend ou frontend deve ser criada para as tabelas listadas abaixo. Elas devem ser ignoradas no desenvolvimento da V1.

*   **`cad_bancos`**: Reservada para o **Módulo Financeiro (V2)**.
*   **`cad_montadores`**: Reservada para o **Módulo de Pós-Venda (V3)**.
*   **`cad_transportadoras`**: Reservada para o **Módulo de Pós-Venda (V3)**.

### Papel de Cada Componente:

*   **Banco de Dados:** As tabelas existem, mas não terão dados inseridos ou utilizados por enquanto.
*   **Backend:** Não deve haver endpoints (APIs) para criar, ler, atualizar ou deletar dados nessas tabelas.
*   **Frontend:** Não deve haver telas ou componentes que interajam com essas tabelas.

---

## 3. Tabelas de Cadastro e Hierarquia

### `cad_empresas`

*   **Função:** Tabela de mais alto nível, representa uma empresa cliente que contratou o sistema Fluyt.
*   **Quem Gerencia:** Apenas usuários com perfil **Admin Master** (desenvolvedor/dono do sistema).
*   **Fluxo:** O Admin Master cadastra uma nova empresa. O administrador dessa nova empresa poderá então acessar o sistema para cadastrar suas próprias lojas.

### `cad_setores`

*   **Função:** Cadastrar os diferentes setores de uma empresa (ex: Comercial, Administrativo, Financeiro, Técnico).
*   **Quem Gerencia:** Usuários com perfil de **Administrador** da empresa (ou superior).
*   **Relacionamento Chave:** Está diretamente ligada à tabela `cad_equipe`. Ao adicionar um novo funcionário em `cad_equipe`, é **obrigatório** selecionar a qual setor ele pertence.

### `cad_procedencias`

*   **Função:** Cadastrar as origens de um cliente (ex: Instagram, Facebook, Indicação de amigo, Site).
*   **Quem Gerencia:** Usuários com perfil de **Administrador** da empresa, para manter um padrão de opções.
*   **Relacionamento Chave:** Está ligada à tabela `c_clientes`. No momento do cadastro do cliente, o vendedor terá uma lista de opções (vindas desta tabela) para selecionar como aquele cliente conheceu a loja.

---
*Este documento será atualizado conforme novas regras forem discutidas e definidas.*
