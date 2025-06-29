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
## 4. Tabelas de Sistema e Logs

### `auditoria_alteracoes`

*   **Função:** Atua como um sistema de log universal, uma "caixa preta" que registra todas as alterações (INSERT, UPDATE, DELETE) que ocorrem no banco de dados.
*   **Quem Gerencia:** O sistema, automaticamente. Nenhuma interação manual é necessária.
*   **Fluxo:** Gatilhos (triggers) no banco de dados são responsáveis por capturar as alterações em tabelas específicas e inserir um novo registro em `auditoria_alteracoes`, contendo detalhes sobre o que foi alterado, quem alterou e quando.

### `c_ambientes`

*   **Função:** Armazena os ambientes e projetos extraídos de arquivos XML gerados pelo software de design externo **Promob**.
*   **Quem Gerencia:** O sistema, através do processo de upload e parsing de XML.
*   **Fluxo:**
    1.  Um usuário (vendedor) realiza o upload de um arquivo `.xml` pela interface do sistema.
    2.  O backend recebe o arquivo e um parser especializado (UploadXML-Parser) é acionado.
    3.  O parser lê o XML, extrai os diferentes ambientes (ex: Cozinha, Dormitório) e seus componentes.
    4.  Para cada ambiente, um novo registro é criado na tabela `c_ambientes`.
    5.  A descrição detalhada de cada ambiente é separada por categorias como `Porta`, `Caixa`, `Tampo`, `Porta Perfil`, e para cada uma dessas categorias, são armazenados atributos como `Cor`, `Espessura` e `Material`.

---

## 5. Tabelas de Fluxo de Aprovações

### `c_aprovacao_historico`

*   **Função:** Registra **todo o histórico** do fluxo de aprovações de descontos em orçamentos.
*   **Quem Gerencia:** O sistema, automaticamente. Toda ação de aprovação gera um registro.
*   **Fluxo:**
    1.  **Vendedor aplica desconto** acima do limite 20% → Gera registro "SOLICITADO"
    2.  **Aprovador decide** → Gera registro "APROVADO" ou "REJEITADO"
    3.  **Cancelamento** → Gera registro "CANCELADO"
*   **Campos Principais:**
    - `orcamento_id`: Qual orçamento está sendo aprovado
    - `aprovador_id`: Quem está aprovando (Gerente/Admin Master)
    - `acao`: SOLICITADO → APROVADO → REJEITADO → CANCELADO
    - `nivel_aprovacao`: "Gerente" ou "Admin Master"
    - `valor_desconto`: % de desconto solicitado
    - `margem_resultante`: Margem após desconto (APENAS para aprovador)
*   **Regras de Negócio:**
    - **Hierarquia por limite**: Desconto 20% vai para Gerente, 30% para Admin Master
    - **Contexto completo**: Aprovador vê margem resultante para decidir
    - **Auditoria**: Todo pedido fica registrado permanentemente
    - **Rastreabilidade**: Quem pediu, quem aprovou, quando, por quê
*   **Crítico**: Essencial para **compliance** e **controle gerencial** - sem isso não há governança sobre descontos e margens.

---

## 6. Tabelas de Formalização

### `c_contratos`

*   **Função:** Armazena os **contratos formais** gerados a partir dos orçamentos aprovados/vendidos.
*   **Quem Gerencia:** O sistema, automaticamente após orçamento ser marcado como "VENDIDO".
*   **Fluxo:**
    1.  **Orçamento vendido** → Gera contrato automático
    2.  **Numeração manual** configurável (independente do orçamento)
    3.  **Dados consolidados** do negócio fechado
    4.  **Base para assinatura** (física ou digital futura)
*   **Campos Principais:**
    - `numero_contrato`: Numeração manual configurável por loja
    - `orcamento_id`: Referência ao orçamento original
    - `valor_total`: Valor final contratado
    - `condicoes`: Texto das condições contratuais
    - `assinado`: Status de assinatura (boolean)
    - `data_assinatura`: Quando foi assinado
*   **Regras de Negócio:**
    - **Um contrato por orçamento** vendido
    - **Numeração independente** do orçamento (sistema próprio)
    - **Snapshot dos dados** no momento da venda
    - **Template editável** antes da finalização
    - **Versionamento** para alterações pós-geração
*   **Relacionamentos:**
    - **Orçamento:** 1:1 - cada contrato vem de um orçamento
    - **Parcelas:** 1:N via `c_parcelas_contrato` (plano de pagamento)
    - **Empresa:** Dados da empresa para cabeçalho do contrato
*   **Crítico**: É o **documento legal** que formaliza a venda - deve ter integridade total e rastreabilidade completa.

---

## 7. Hierarquia Empresarial

### `cad_empresas`

*   **Função:** Nível hierárquico **mais alto** do sistema. Representa empresas clientes que contrataram o Fluyt.
*   **Quem Gerencia:** **APENAS Admin Master** (desenvolvedor/dono do sistema) pode criar empresas.
*   **Fluxo:** Admin Master cadastra empresa → Administrador da empresa pode criar suas lojas → Lojas podem cadastrar funcionários.
*   **Campos Principais:**
    - `nome`: Único campo obrigatório
    - `cnpj`: Validado com 14 dígitos (opcional)
    - `email`, `telefone`, `endereco`: Campos opcionais com validação
    - `ativo`: Controle de soft delete
*   **Regras de Negócio:**
    - **CNPJ único** quando fornecido
    - **Validações rigorosas** em telefone e email
    - **Campos calculados**: total_lojas, lojas_ativas, funcionários
*   **Relacionamentos:** 1:N com `c_lojas` (uma empresa tem várias lojas)

### `c_lojas`

*   **Função:** Unidades operacionais de uma empresa. Cada loja opera de forma **semi-independente**.
*   **Quem Gerencia:** **Administrador da empresa** pode criar/gerenciar lojas de sua empresa.
*   **Fluxo:** Empresa existe → Admin cria lojas → Designa gerente → Loja opera independentemente.
*   **Campos Principais:**
    - `nome`: Único campo obrigatório
    - `empresa_id`: Referência obrigatória para empresa pai
    - `gerente_id`: Referência para funcionário responsável (cad_equipe)
    - `endereco`, `telefone`, `email`: Dados de contato opcionais
*   **Regras de Negócio:**
    - **Uma loja por vez** por gerente
    - **Associação automática** nos cadastros (clientes/orçamentos ficam ligados à loja)
    - **Isolamento de dados** entre lojas da mesma empresa
*   **Relacionamentos:** N:1 com `cad_empresas`, 1:N com `cad_equipe`, `c_clientes`, `c_orcamentos`

### `cad_equipe`

*   **Função:** Funcionários que trabalham nas lojas. Controla **permissões, comissões e hierarquia**.
*   **Quem Gerencia:** **Gerente da loja** ou **Admin** podem cadastrar funcionários.
*   **Fluxo:** Loja existe → Gerente cadastra funcionário → Associa setor → Define perfil/comissões → Funcionário opera.
*   **Campos Principais:**
    - `nome`, `email`, `telefone`: Obrigatórios
    - `perfil`: VENDEDOR | GERENTE | MEDIDOR | ADMIN_MASTER
    - `nivel_acesso`: USUARIO | SUPERVISOR | GERENTE | ADMIN
    - `loja_id`, `setor_id`: Associações obrigatórias
    - `limite_desconto`: Até onde pode dar desconto sem aprovação
    - `salario`, `comissao_percentual_vendedor/gerente`: Dados financeiros
    - `tem_minimo_garantido`, `valor_minimo_garantido`: Proteção financeira
*   **Regras de Negócio:**
    - **Perfil define permissões**: VENDEDOR < GERENTE < ADMIN_MASTER
    - **Limite de desconto por perfil**: Vendedor 15%, Gerente 25%
    - **Comissões automáticas** calculadas nos orçamentos
    - **Associação automática**: vendedor que cria cliente fica como responsável
    - **Hierarquia de aprovação**: descontos acima do limite vão para superior
*   **Relacionamentos:** N:1 com `c_lojas`, `cad_setores`; é referenciado por `c_clientes`, `c_orcamentos`

---

## 8. Núcleo do Sistema - Orçamentos

### `c_orcamentos`

*   **Função:** É a **tabela principal** do sistema - centraliza todo o processo de venda desde a criação até o fechamento.
*   **Quem Gerencia:** Vendedores criam, sistema calcula automaticamente, aprovadores decidem sobre descontos.
*   **Fluxo:**
    1.  **Cliente + Ambientes** → Cria orçamento
    2.  **Sistema calcula** todos os custos automaticamente
    3.  **Vendedor aplica** desconto e plano de pagamento
    4.  **Fluxo de aprovação** se necessário
    5.  **Fechamento** em contrato
*   **Campos Críticos:**
    - **Identificação:** `numero` (configurável por loja), `cliente_id`, `vendedor_id`
    - **Valores Principais:** `valor_ambientes`, `desconto_percentual`, `valor_final`
    - **Snapshot de Custos:** `custo_fabrica`, `comissao_vendedor`, `comissao_gerente`, `custo_medidor`, `custo_montador`, `custo_frete`, `margem_lucro`
    - **Controle:** `necessita_aprovacao`, `config_snapshot`, `plano_pagamento`
*   **Regras de Negócio:**
    - **Inclusão automática** de TODOS os ambientes
    - **Cálculo automático** de custos no momento da criação
    - **Snapshot obrigatório** das configurações (auditoria)
    - **Aprovação hierárquica** baseada em limites individuais
    - **Visibilidade diferenciada** por perfil (vendedor NÃO vê custos)
*   **Relacionamentos Críticos:**
    - **Ambientes:** Via `c_orcamento_ambientes` (todos incluídos)
    - **Custos Adicionais:** Via `c_orcamento_custos_adicionais` (múltiplos)
    - **Aprovações:** Via `c_aprovacao_historico` (rastreabilidade)
    - **Prestadores:** Montador/Transportadora selecionados
    - **Contrato:** 1:1 quando vendido
*   **Crítico**: É a **espinha dorsal** do sistema - concentra todas as regras de negócio, cálculos financeiros e fluxos de aprovação.

---

## 9. Marketing e Análise

### `cad_procedencias`

*   **Função:** Cadastro dos **canais de marketing** e pontos de contato que geram leads/clientes para rastreamento de eficácia.
*   **Quem Gerencia:** **Admin configura** os canais disponíveis por loja.
*   **Fluxo:**
    1.  **Admin configura** os canais disponíveis por loja
    2.  **Vendedor seleciona** na criação do cliente
    3.  **Relatórios mostram** qual canal traz mais conversões
    4.  **ROI de marketing** baseado na origem
*   **Campos Principais:**
    - `nome`: Nome do canal (ex: "Instagram", "Google Ads", "Feira")
    - `descricao`: Detalhes do canal
    - `ativo`: Se está disponível para seleção
*   **Exemplos Típicos:**
    - **Digital:** Instagram, Facebook, Google Ads, Site
    - **Físico:** Feira, Loja Física, Outdoor
    - **Relacionamento:** Indicação Amigo, Cliente Antigo
    - **Parcerias:** Arquiteto, Designer, Construtora
*   **Relacionamentos:**
    - **Clientes:** Via campo `procedencia_id` em `c_clientes`
    - **Relatórios:** Análise de conversão por canal
    - **ROI:** Custo marketing vs vendas geradas
*   **Valor Estratégico:** Permite **análise de marketing** - quais canais trazem mais clientes, maior ticket médio, melhor conversão.
*   **Importante:** **NÃO confundir** com indicadores específicos (arquitetos/designers) que podem ter comissão - isso seria um perfil separado no futuro.

---

## 10. Relacionamentos de Orçamentos

### `c_orcamento_ambientes`

*   **Função:** Tabela de **relacionamento N:N** entre orçamentos e ambientes - define quais ambientes fazem parte de cada orçamento.
*   **Quem Gerencia:** O sistema, automaticamente. Vendedor **NÃO** escolhe ambientes.
*   **Fluxo:**
    1.  **Orçamento criado** → Sistema insere TODOS os ambientes automaticamente
    2.  **Campo `incluido`** sempre `true` (não há seleção manual)
    3.  **Relacionamento obrigatório** - orçamento sem ambiente é inválido
*   **Campos Principais:**
    - `orcamento_id`: Referência ao orçamento
    - `ambiente_id`: Referência ao ambiente
    - `incluido`: Sempre `true` (todos ambientes incluídos)
*   **Regras de Negócio:**
    - **Criação automática** - vendedor NÃO escolhe ambientes
    - **Todos incluídos** - regra absoluta do sistema
    - **Não há edição** - uma vez criado, não se remove ambientes
    - **Base do cálculo** - soma de todos os ambientes = valor base
*   **Funcionamento Prático:**
    ```
    Cliente tem XML com 3 ambientes:
    - Cozinha: R$ 15.000
    - Dormitório: R$ 8.000  
    - Banheiro: R$ 3.000

    Sistema cria orçamento e automaticamente insere:
    - registro 1: orcamento_123 + cozinha + incluido=true
    - registro 2: orcamento_123 + dormitorio + incluido=true  
    - registro 3: orcamento_123 + banheiro + incluido=true

    Valor base orçamento = R$ 26.000
    ```
*   **Crítico**: Fundamental para **integridade** do sistema - garante que todo orçamento tem base de cálculo correta e completa.

---

## 11. Configurações Operacionais

### `config_loja`

*   **Função:** Centraliza **TODAS as configurações financeiras e operacionais** específicas de cada loja - é o "painel de controle" do Admin Master.
*   **Quem Gerencia:** **APENAS Admin Master** configura todos os parâmetros.
*   **Fluxo:**
    1.  **Uma configuração por loja** (relacionamento 1:1)
    2.  **Admin Master configura** todos os parâmetros
    3.  **Sistema usa** essas configs em tempo real nos cálculos
    4.  **Snapshot salvo** nos orçamentos para auditoria
*   **Configurações Críticas:**
    - **Custos Operacionais:**
      - `deflator_custo_fabrica`: 0.40 = 40% sobre valor XML
      - `valor_medidor_padrao`: R$ 200 (padrão para medição)
      - `valor_frete_percentual`: 0.02 = 2% sobre valor da venda
    - **Limites de Desconto:**
      - `limite_desconto_vendedor`: 0.15 = 15% máximo
      - `limite_desconto_gerente`: 0.25 = 25% máximo
      - Admin Master = sem limite
    - **Numeração Manual:**
      - `numero_inicial_orcamento`: Número que usuário define
      - `proximo_numero_orcamento`: Sistema incrementa +1
      - `formato_numeracao`: SEQUENCIAL/ANO_SEQUENCIAL/PERSONALIZADO
      - `prefixo_numeracao`: Ex: "D-Art-2025-"
*   **Impacto nos Cálculos:**
    ```
    Orçamento R$ 50.000:
    - Custo fábrica = 50.000 × 0.40 = R$ 20.000
    - Frete = 50.000 × 0.02 = R$ 1.000
    - Medidor = R$ 200 (fixo)
    ```
*   **Relacionamentos:**
    - **Loja:** 1:1 obrigatório
    - **Orçamentos:** Usa configs em tempo real
    - **Auditoria:** Via `config_historico_configuracoes`
*   **Crítico**: É o **cérebro financeiro** do sistema - qualquer alteração aqui impacta TODOS os cálculos futuros. Mudanças devem ser auditadas rigorosamente.

---

## 12. Custos e Controle Financeiro

### `c_orcamento_custos_adicionais`

*   **Função:** Permite adicionar **custos específicos** que não se enquadram nas categorias padrão (fábrica, comissões, montador, frete, medidor) e **impactam diretamente a margem**.
*   **Quem Gerencia:** **Vendedor/Gerente adiciona** conforme necessidade.
*   **Fluxo:**
    1.  **Múltiplos custos** por orçamento (1:N)
    2.  **Vendedor/Gerente adiciona** conforme necessidade
    3.  **Soma automática** incluída no cálculo de margem
    4.  **Descrição livre** para identificação
*   **Campos Principais:**
    - `orcamento_id`: Qual orçamento recebe o custo
    - `descricao_custo`: Descrição livre do custo adicional
    - `valor_custo`: Valor monetário do custo
*   **Exemplos Práticos:**
    - **Taxa Projeto Especial:** R$ 500
    - **Aluguel Equipamento Específico:** R$ 300
    - **Comissão Indicador (Arquiteto):** R$ 800
    - **Custo Extra Logística:** R$ 200
    - **Taxa Urgência:** R$ 150
*   **Impacto na Margem:**
    ```
    Orçamento base: R$ 50.000
    Custos padrão: R$ 35.000
    Custos adicionais:
    - Taxa projeto: R$ 500
    - Comissão arquiteto: R$ 800
    Total custos adicionais: R$ 1.300

    Margem final = 50.000 - 35.000 - 1.300 = R$ 13.700
    ```
*   **Relacionamentos:**
    - **Orçamento:** N:1 - um orçamento pode ter vários custos extras
    - **Cálculo automático:** Soma incluída na fórmula de margem
*   **Crítico**: Essencial para **precisão da margem** - custos eventuais que não são captados pelas categorias fixas devem ser contabilizados para não mascarar a lucratividade real.

### `c_parcelas_contrato`

*   **Função:** Armazena o **plano de pagamento** detalhado do contrato, convertendo o JSON do orçamento em registros estruturados para controle financeiro.
*   **Quem Gerencia:** Sistema automaticamente, baseado no plano definido no orçamento.
*   **Fluxo:**
    1.  **Contrato gerado** → Sistema cria parcelas baseado no `plano_pagamento` do orçamento
    2.  **Cada parcela** tem valor, data e forma de pagamento
    3.  **Controle de recebimento** por parcela individual
    4.  **Base para cobrança** e follow-up financeiro
*   **Campos Principais:**
    - `contrato_id`: Referência ao contrato
    - `numero_parcela`: Sequencial (1, 2, 3...)
    - `valor_parcela`: Valor individual da parcela
    - `data_vencimento`: Data de vencimento
    - `status_pagamento`: PENDENTE/PAGO/ATRASADO/CANCELADO
    - `data_pagamento`: Quando foi efetivamente pago
*   **Exemplo Prático:**
    ```
    Contrato R$ 18.000:
    Parcela 1: R$ 3.000 PIX (30/05/2025) - PAGO
    Parcela 2: R$ 1.000 Cartão (28/06/2025) - PENDENTE
    Parcela 3: R$ 1.000 Cartão (28/07/2025) - PENDENTE
    ...
    Parcela 12: R$ 1.500 Boleto (18/12/2025) - PENDENTE
    ```
*   **Valor Operacional:**
    - **Controle de recebimento** parcela a parcela
    - **Alertas de vencimento** automáticos
    - **Relatórios financeiros** detalhados
    - **Base para cobrança** de atrasados
*   **Relacionamentos:**
    - **Contrato:** N:1 - múltiplas parcelas por contrato
    - **Módulo Financeiro:** Base para controle de recebíveis
    - **Relatórios:** Fluxo de caixa e inadimplência
*   **Crítico**: Fundamental para **gestão financeira** - sem controle detalhado das parcelas, a empresa perde dinheiro por falta de cobrança efetiva.

---

*Este documento será atualizado conforme novas regras forem discutidas e definidas.*
