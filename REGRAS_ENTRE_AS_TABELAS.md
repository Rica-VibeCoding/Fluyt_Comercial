# Regras de Negócio e Relacionamento entre Tabelas

Este documento serve para registrar as regras de negócio e o fluxo de dados que governam as interações entre as diferentes partes do sistema (Frontend, Backend, Banco de Dados). O objetivo é garantir que todos os desenvolvedores (atuais e futuros, incluindo IAs) sigam a mesma lógica.

## 1. Criação de um Novo Cliente

**Contexto:** Um novo cliente sempre é cadastrado por um usuário (vendedor, gerente, etc.) que está logado no sistema.

**Regra de Negócio:** Ao cadastrar um novo cliente, ele deve ser automaticamente associado à **loja** e ao **vendedor** que realizaram o cadastro, sem a necessidade de seleção manual desses dados no formulário.

### Papel de Cada Componente:

#### **Banco de Dados (Supabase)**

*   **Função:** Armazena o cliente com `loja_id` e `vendedor_id` já preenchidos automaticamente.
*   **Implementação:** O INSERT é feito diretamente com esses campos já populados pelo backend.

#### **Backend (FastAPI)**

*   **Função:** Recebe os dados do frontend (sem loja nem vendedor) e adiciona automaticamente essas informações do usuário logado.
*   **Implementação:** O backend pega `user.loja_id` e `user.id` e adiciona aos dados antes de salvar.

#### **Frontend (React/Next.js)**

*   **Função:** Apresenta o formulário **apenas com os campos que o vendedor deve preencher** (nome, telefone, etc.).
*   **Implementação:** O formulário **NÃO** tem campos para selecionar loja ou vendedor - isso é transparente ao usuário.

---

## 2. Orçamentos Multiambiente

**Contexto:** Um orçamento pode conter múltiplos ambientes (ex: cozinha + banheiro), e cada ambiente pode ter materiais específicos.

**Regra de Negócio:** O sistema deve permitir criar um orçamento único que englobe vários ambientes, cada um com sua própria lista de materiais e preços.

### Papel de Cada Componente:

#### **Banco de Dados**

*   **Função:** Relaciona um orçamento com múltiplos ambientes através de `orcamento_id` na tabela de ambientes.
*   **Estrutura:** 
    *   `c_orcamentos` (1) → `c_ambientes` (N)
    *   `c_ambientes` (1) → `c_ambientes_material` (1)

#### **Backend**

*   **Função:** Gerencia a criação/edição de orçamentos com múltiplos ambientes de forma transacional.
*   **Implementação:** Endpoint que recebe array de ambientes e processa cada um individualmente.

#### **Frontend**

*   **Função:** Interface que permite adicionar/remover ambientes dinamicamente dentro do mesmo orçamento.
*   **Implementação:** Componente de lista com botões "Adicionar Ambiente" e gerenciamento de estado local.

---

## 3. Importação de XML do Promob

**Contexto:** O sistema permite importar arquivos XML gerados pelo software Promob, que contém a estrutura completa de um projeto (ambientes + materiais).

**Regra de Negócio:** Ao importar um XML, o sistema deve:
1. Criar automaticamente os ambientes encontrados
2. Associar os materiais (em formato JSON) a cada ambiente
3. Gerar um hash do XML para evitar importações duplicadas
4. Manter rastreabilidade da origem dos dados

### Papel de Cada Componente:

#### **Banco de Dados**

*   **Função:** Armazenar ambientes com origem "xml" e materiais detalhados em JSONB.
*   **Estrutura:**
    *   `c_ambientes.origem = 'xml'`
    *   `c_ambientes_material.materiais_json` (JSONB)
    *   `c_ambientes_material.xml_hash` (para detectar duplicatas)

#### **Backend**

*   **Função:** Parser XML + criação transacional de ambientes + materiais.
*   **Implementação:** Módulo extrator XML que processa arquivo e popula ambas as tabelas.

#### **Frontend**

*   **Função:** Upload de arquivo + visualização do resultado da importação.
*   **Implementação:** Drag & drop + feedback de progresso + listagem dos ambientes criados.

---

## 4. Tabelas de Sistema

### **Tabela `c_ambientes_material`**

**Função Real:** Armazenar materiais detalhados de cada ambiente em formato JSON estruturado.

#### **Relacionamentos:**
- **1:1 com `c_ambientes`** - Cada ambiente tem um registro de materiais
- **Campo principal:** `materiais_json` (JSONB) - Estrutura flexível para diferentes tipos de materiais

#### **Funcionamento:**
- **UPSERT automático:** Backend faz inserção ou atualização conforme necessário
- **Hash de controle:** `xml_hash` permite detectar XMLs já importados
- **JSON estruturado:** Permite consultas flexíveis e expansão futura
- **Origem rastreável:** Distingue materiais vindos de XML vs inserção manual

#### **Valor para o negócio:**
- **Rastreabilidade completa:** Do XML original até o orçamento final
- **Flexibilidade:** Suporte a qualquer estrutura de materiais do Promob
- **Performance:** Consultas JSON otimizadas no PostgreSQL
- **Auditoria:** Histórico completo de alterações nos materiais

---

## 5. Controle de Acesso (RLS)

**Contexto:** O sistema possui múltiplas lojas e usuários de diferentes perfis que devem ver apenas os dados da sua loja.

**Regra de Negócio:** Row Level Security (RLS) garante que cada usuário veja apenas dados da sua loja, exceto SUPER_ADMIN que vê tudo.

### Papel de Cada Componente:

#### **Banco de Dados**

*   **Função:** Aplicar RLS automaticamente em todas as consultas baseado no usuário logado.
*   **Implementação:** Policies que filtram por `loja_id` baseado no JWT token.

#### **Backend**

*   **Função:** Passar contexto do usuário para o Supabase via RLS Context.
*   **Implementação:** Middleware que seta `auth.uid()` e claims do usuário.

#### **Frontend**

*   **Função:** Trabalhar transparentemente - os dados já vêm filtrados pelo RLS.
*   **Implementação:** Não precisa se preocupar com filtros de loja nas consultas.

---

## 6. Soft Delete

**Contexto:** O sistema não deve deletar registros fisicamente para manter histórico e integridade referencial.

**Regra de Negócio:** Todos os registros possuem campo `ativo` que marca se estão em uso ou foram "excluídos".

### Papel de Cada Componente:

#### **Banco de Dados**

*   **Função:** Manter todos os registros fisicamente, apenas marcando como inativo.
*   **Implementação:** Campo `ativo BOOLEAN DEFAULT true` em todas as tabelas principais.

#### **Backend**

*   **Função:** Filtrar automaticamente registros inativos em consultas normais.
*   **Implementação:** `.eq('ativo', True)` em todas as queries de listagem.

#### **Frontend**

*   **Função:** Oferecer opção de "restaurar" registros se necessário.
*   **Implementação:** Tela administrativa para visualizar registros inativos.

---

## 7. Hierarquia Empresarial

### **Tabela `cad_setores`**

**Função Real:** Cadastro de setores/departamentos para organizar funcionários da empresa.

#### **Características:**
- **Tabela global:** Não pertence a uma loja específica, é compartilhada
- **Setores únicos:** Nome não pode repetir em toda a empresa
- **Soft delete:** Campo `ativo` para exclusão lógica
- **Validação rigorosa:** Backend impede exclusão se houver funcionários vinculados

#### **Funcionamento:**
- **CRUD completo:** Criar, listar, editar e "excluir" setores
- **Contagem automática:** Backend conta quantos funcionários por setor
- **Proteção de integridade:** Não permite excluir setores com funcionários ativos
- **Ordenação inteligente:** Lista setores por nome alfabeticamente

#### **Relacionamentos:**
- **1:N com `cad_equipe`** - Um setor pode ter vários funcionários
- **Referenciado por:** Funcionários usam `setor_id` para organização

#### **Valor para o negócio:**
- **Organização clara:** Estrutura departamental da empresa
- **Relatórios gerenciais:** Análises por setor/departamento  
- **Controle de acesso:** Base para permissões por área
- **Escalabilidade:** Suporte ao crescimento da empresa

---

## 8. Gestão de Filiais

### **Tabela `c_lojas`**

**Função Real:** Gerenciamento de filiais/unidades da empresa com controle hierárquico completo.

#### **Características Baseadas no Código:**
- **Relacionamento empresarial:** Pertence a uma `cad_empresas` (FK `empresa_id`)
- **Gestão local:** Cada loja tem um gerente da `cad_equipe` (FK `gerente_id`)
- **Nome único global:** Não pode ter duas lojas com mesmo nome no sistema
- **Soft delete:** Campo `ativo` para exclusão lógica com proteção de dados
- **Permissões rigorosas:** Apenas ADMIN cria, só SUPER_ADMIN exclui

#### **Funcionamento Real (baseado nos Controllers/Services):**
- **CRUD controlado com validações:**
  - `POST /lojas` - Criação restrita a administradores
  - `GET /lojas` - Listagem com filtros avançados e paginação
  - `PUT /lojas/{id}` - Atualização parcial com validação de conflitos
  - `DELETE /lojas/{id}` - Exclusão lógica apenas por SUPER_ADMIN
- **Validação em tempo real:** `GET /lojas/verificar-nome/{nome}` para formulários
- **Filtros implementados:** Busca textual (nome/telefone/email), empresa, gerente, período
- **JOINs otimizados:** Retorna nome da empresa e gerente automaticamente

#### **Relacionamentos Implementados:**
- **N:1 com `cad_empresas`** - Várias lojas por empresa (campo obrigatório)
- **N:1 com `cad_equipe`** - Cada loja pode ter um gerente (campo opcional)
- **1:N com `c_clientes`** - Uma loja tem vários clientes (base do RLS)
- **1:N com usuários** - Funcionários pertencem a uma loja específica

#### **Regras de Negócio Implementadas:**
- **Nome único global:** ConflictException se nome já existe
- **Campos UUID flexíveis:** `empresa_id` e `gerente_id` podem ser NULL ou string vazia
- **Paginação padrão:** 20 itens por página, máximo 100
- **Ordenação:** Mais recentes primeiro (`created_at DESC`)
- **Soft delete:** `ativo = false` preserva histórico

#### **Endpoints de Teste (Desenvolvimento):**
- `GET /lojas/test/public` - Teste de conectividade sem autenticação
- Retorna contagem total de lojas para validar API

#### **Valor para o negócio:**
- **Expansão territorial controlada:** Sistema robusto para crescimento multi-filial
- **Gestão descentralizada:** Cada loja com autonomia local e gerente próprio
- **Segregação total:** RLS garante isolamento absoluto entre lojas
- **Auditoria completa:** Histórico preservado com soft delete
- **Escalabilidade:** Arquitetura preparada para centenas de lojas

---

## 9. Cadastro de Clientes com RLS Avançado

### **Tabela `c_clientes`**

**Função Real:** Cadastro de clientes com segregação por loja usando Row Level Security nativo do Supabase.

#### **Características Baseadas no Código:**
- **RLS nativo implementado:** Cada usuário vê apenas clientes da sua loja via Postgres Policies
- **Nome único por loja:** Validação específica por `loja_id` (nomes podem repetir entre lojas)
- **CPF/CNPJ flexível:** Pode repetir entre lojas diferentes (apenas log de auditoria)
- **Associação automática:** Cliente sempre vinculado à `loja_id` do usuário logado
- **Vendedor inteligente:** Se não informado no form, usa o próprio usuário (se for vendedor)

#### **Funcionamento Real (baseado nos Controllers/Services):**
- **CRUD com RLS automático:**
  - `POST /clientes` - Criação com `loja_id` automático do usuário
  - `GET /clientes` - Listagem filtrada por RLS (SUPER_ADMIN vê todos)
  - `PUT /clientes/{id}` - Atualização apenas de clientes da mesma loja
  - `DELETE /clientes/{id}` - Exclusão lógica apenas por ADMIN+
- **Validação em tempo real:** `GET /clientes/verificar-cpf-cnpj/{cpf}` para formulários
- **Filtros implementados:** Busca unificada (nome/CPF/telefone), tipo venda, vendedor, procedência, período
- **JOINs com relacionados:** Retorna nome do vendedor e procedência automaticamente

#### **Relacionamentos Implementados:**
- **N:1 com `c_lojas`** - Muitos clientes por loja (FK `loja_id`, base do RLS)
- **N:1 com `cad_equipe`** - Cliente tem vendedor responsável (FK `vendedor_id`)
- **N:1 com `c_procedencias`** - Cliente tem origem de marketing (FK `procedencia_id`)
- **1:N com `c_ambientes`** - Cliente pode ter vários projetos/ambientes

#### **Regras de Negócio Complexas:**
- **Validação por loja:**
  - Nome único APENAS na mesma loja (`buscar_por_nome(nome, loja_id)`)
  - CPF/CNPJ pode repetir entre lojas diferentes (log de auditoria)
- **Vendedor automático:** Se `vendedor_id` não informado e usuário é VENDEDOR, usa `user.id`
- **RLS dinâmico:** 
  - SUPER_ADMIN: `loja_id = None` (vê todos os clientes)
  - Demais usuários: `loja_id = user.loja_id` (apenas sua loja)
- **Tipos de venda:** 'NORMAL' ou 'FUTURA' para diferentes fluxos de negócio

#### **Validações de Dados (Schemas):**
- **CPF/CNPJ:** Remove caracteres especiais, valida 11 ou 14 dígitos
- **Telefone:** Remove especiais, mínimo 10 dígitos
- **CEP:** Remove especiais, exatamente 8 dígitos
- **UF:** Valida contra lista de estados brasileiros válidos
- **Email:** Validação EmailStr do Pydantic

#### **Endpoints Especiais:**
- `GET /clientes/procedencias` - Lista procedências ativas para formulários
- `GET /clientes/test/public` - Teste conectividade (desenvolvimento)
- `POST /clientes/test/criar-sem-auth` - Teste criação sem token (desenvolvimento)

#### **Valor Estratégico:**
- **Segurança absoluta:** RLS garante isolamento total entre lojas
- **Flexibilidade de duplicatas:** CPF pode existir em lojas diferentes (franquias)
- **Rastreabilidade comercial:** Vendedor e procedência sempre registrados
- **Escalabilidade:** Arquitetura preparada para milhares de clientes
- **Compliance:** Auditoria completa com soft delete e logs
- **UX otimizada:** Validações em tempo real e preenchimento automático

---

## 10. Tabelas para Versões Futuras (V2/V3)

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

## 11. Tabelas de Cadastro e Hierarquia

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
## 12. Tabelas de Sistema e Logs

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

### `c_ambientes_material`

*   **Função:** Armazena os **materiais detalhados** de cada ambiente em formato JSON estruturado, complementando a tabela `c_ambientes` com informações específicas dos materiais extraídos do XML do Promob.
*   **Quem Gerencia:** O sistema automaticamente durante a importação de XML.
*   **Fluxo:**
    1.  **Relacionamento 1:1** com `c_ambientes` - cada ambiente pode ter um registro de materiais
    2.  **Importação XML:** Quando arquivo XML é processado, todos os detalhes técnicos são armazenados em `materiais_json`
    3.  **UPSERT automático:** Se já existe material para o ambiente, atualiza; senão cria novo
    4.  **Estrutura JSON:** Organizada por categorias (caixa, portas, ferragens, etc.) com propriedades como cor, material, espessura
*   **Campos Principais:**
    - `ambiente_id`: Referência única ao ambiente (FK para `c_ambientes`)
    - `materiais_json`: Campo JSONB contendo toda estrutura de materiais
    - `xml_hash`: Hash do XML para evitar importações duplicadas
*   **Exemplo de Estrutura JSON:**
    ```json
    {
        "linha_detectada": "Linha Premium",
        "caixa": {"cor": "Branco", "material": "MDF", "espessura": "15mm"},
        "portas": {"cor": "Carvalho", "perfil": "Reta", "acabamento": "Verniz"},
        "ferragens": {"tipo": "Blum", "acabamento": "Inox"},
        "valor_total": {"custo_fabrica": 15000, "valor_venda": 25000}
    }
    ```
*   **Regras de Negócio:**
    - **Constraint única:** Um ambiente só pode ter um registro de materiais
    - **Busca otimizada:** Índice GIN no campo JSON para consultas rápidas
    - **Integridade:** CASCADE DELETE - se ambiente é excluído, materiais também são
*   **Valor Estratégico:** Permite **consultas detalhadas** sobre materiais, análise de custos por componente, e **rastreabilidade completa** desde o XML original até o orçamento final.

---

## 13. Tabelas de Fluxo de Aprovações

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

## 14. Tabelas de Formalização

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

## 15. Marketing e Análise

### `c_procedencias`

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

## 16. Relacionamentos de Orçamentos

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

## 17. Configurações Operacionais

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
    - Frete = 50.000 × 0.02 = R$ 1.000
    - Medidor = R$ 200 (fixo)
    ```
*   **Relacionamentos:**
    - **Loja:** 1:1 obrigatório
    - **Orçamentos:** Usa configs em tempo real
    - **Auditoria:** Via `config_historico_configuracoes`
*   **Crítico**: É o **cérebro financeiro** do sistema - qualquer alteração aqui impacta TODOS os cálculos futuros. Mudanças devem ser auditadas rigorosamente.

---

## 18. Custos e Controle Financeiro

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

## 21. Sistema de Autenticação - Tabela `usuarios`

### **Função Real:** Sistema de autenticação híbrido que combina Supabase Auth com tabela customizada para dados específicos do negócio.

#### **Arquitetura Implementada (baseada no código):**
- **Dupla camada:** Supabase Auth (tokens JWT) + tabela `usuarios` (dados específicos)
- **Integração por `user_id`:** Campo que conecta registro do Auth com dados personalizados
- **RLS nativo:** Políticas Postgres garantem acesso apenas aos próprios dados
- **JWT completo:** Access token + refresh token com expiração configurável
- **Perfis hierárquicos:** SUPER_ADMIN, ADMIN, GERENTE, VENDEDOR, USER

#### **Funcionamento Real (baseado nos Controllers/Services):**
- **Login complexo (`POST /auth/login`):**
  1. Autentica no Supabase Auth com email/senha
  2. Busca dados complementares na tabela `usuarios` via `user_id`
  3. Monta objeto User completo com perfil, loja, empresa
  4. Retorna tokens + dados do usuário estruturados
- **Refresh token (`POST /auth/refresh`):**
  - Renova access token usando refresh token válido
  - Mantém sessão ativa sem novo login
- **Logout (`POST /auth/logout`):**
  - Invalida token no Supabase Auth
  - Sempre retorna sucesso (mesmo com erro, logout local funciona)
- **Dados usuário (`GET /auth/me`):**
  - Retorna dados completos do usuário autenticado
  - Inclui nome, perfil, loja, empresa vinculados
- **Verificação (`GET /auth/verify`):**
  - Valida se token JWT está ativo e válido
  - Usado pelo frontend para manter sessão

#### **Schemas Implementados:**
- **LoginRequest:** Email (EmailStr) + senha (mín. 6 caracteres)
- **UserResponse:** Dados completos (id, email, nome, perfil, loja_id, empresa_id, função)
- **LoginResponse:** Tokens + dados usuário + metadados de sessão
- **RefreshResponse:** Novos tokens após renovação
- **LogoutResponse:** Confirmação de logout bem-sucedido

#### **Regras de Negócio Críticas:**
- **Validação dupla:** Auth válido + usuário ativo na tabela `usuarios`
- **Perfil obrigatório:** Todo usuário deve ter perfil definido
- **Loja vinculada:** Usuários (exceto SUPER_ADMIN) pertencem a uma loja
- **Função mapeada:** Perfil convertido em função legível (ex: VENDEDOR → "Vendedor")
- **Sessão configurável:** Tempo de expiração baseado em `settings.jwt_access_token_expire_minutes`

#### **Tratamento de Erros Implementado:**
- **Credenciais inválidas:** HTTP 401 com mensagem padronizada
- **Usuário não encontrado:** HTTP 403 "Usuário não autorizado no sistema"
- **Usuário inativo:** HTTP 403 "Usuário inativo"
- **Token expirado:** HTTP 401 com renovação via refresh
- **Erro interno:** HTTP 500 com logs detalhados

#### **Endpoints de Desenvolvimento:**
- `GET /auth/test-connection` - Testa conectividade Supabase (apenas dev)
- Retorna status da conexão, ambiente, URL mascarada

#### **Relacionamentos Implementados:**
- **N:1 com `c_lojas`** - Usuário pertence a uma loja (base do RLS)
- **N:1 com `cad_empresas`** - Usuário vinculado à empresa da loja
- **1:N com operações** - User é usado em todos os endpoints protegidos
- **Auditoria:** User_id registrado em todas as alterações de dados

#### **Segurança Implementada:**
- **Rate limiting:** Proteção contra ataques de força bruta
- **Logs detalhados:** Todas as tentativas de login registradas
- **Tokens seguros:** JWT com assinatura e expiração
- **RLS automático:** Usuário só acessa dados da própria loja
- **Validação rigorosa:** Email, senha, perfil, status ativo

#### **Dependências do Core:**
- **`core.auth.get_current_user`** - Dependency para extrair usuário do JWT
- **`core.database.get_supabase`** - Cliente Supabase para operações
- **`core.config.settings`** - Configurações de JWT e ambiente
- **`core.exceptions`** - Tratamento padronizado de erros

#### **Valor Estratégico:**
- **Segurança robusta:** Autenticação profissional com padrões de mercado
- **Flexibilidade:** Perfis hierárquicos para diferentes níveis de acesso
- **Escalabilidade:** Suporte a múltiplas empresas e lojas
- **Auditoria completa:** Rastreabilidade de todas as ações por usuário
- **UX otimizada:** Sessões persistentes com refresh automático
- **Compliance:** Logs detalhados para auditoria e segurança

#### **Crítico para o Sistema:**
- **Base de tudo:** Sem autenticação funcionando, sistema não opera
- **RLS dependente:** Todas as consultas filtradas dependem do user_id
- **Integridade:** Conexão Auth ↔ usuarios deve estar sempre sincronizada
- **Performance:** JWT evita consultas desnecessárias ao banco
- **Manutenibilidade:** Arquitetura limpa com separação de responsabilidades

---

## 22. Gestão de Funcionários - Tabela `cad_equipe`

### **Função Real:** Sistema completo de gestão de funcionários com hierarquia, validações rigorosas e relacionamentos otimizados.

#### **Arquitetura Implementada (baseada no código):**
- **Repository otimizado:** Evita problema N+1 com nested selects e batch queries
- **Validações duplas:** Nome único por loja, email repetível com auditoria
- **Soft delete exclusivo:** Preservação total de dados históricos
- **Relacionamentos múltiplos:** Loja, setor, perfil hierárquico
- **Campos obrigatórios:** 12 campos NOT NULL conforme constraints do banco

#### **Funcionamento Real (baseado nos Controllers/Services):**
- **CRUD completo (`/equipe`):**
  - `GET /` - Listagem com filtros (busca, perfil, setor, período) + paginação
  - `GET /{id}` - Dados completos com JOINs (loja_nome, setor_nome)
  - `POST /` - Criação com validação de duplicidade e conversão camelCase→snake_case
  - `PUT /{id}` - Atualização parcial com manutenção de integridade
  - `DELETE /{id}` - Soft delete apenas por ADMIN+ (preserva histórico)
- **Validação tempo real:** `GET /verificar-nome/{nome}` com rate limiting (10/min)
- **Conversão automática:** Middleware converte camelCase do frontend para snake_case do banco
- **Endpoint teste:** `GET /test/public` para validação de conectividade

#### **Schemas Implementados:**
- **FuncionarioCreate:** 12 campos obrigatórios conforme banco (nome, email, telefone, perfil, etc.)
- **FuncionarioUpdate:** Todos campos opcionais para atualização parcial
- **FuncionarioResponse:** Dados completos + relacionamentos (loja_nome, setor_nome)
- **FiltrosFuncionario:** Busca textual, perfil, setor, período de admissão

#### **Regras de Negócio Críticas:**
- **Nome único por loja:** ConflictException se nome já existe
- **Email repetível:** Permitido entre lojas (apenas log de auditoria)
- **Campos financeiros obrigatórios:** Salário, data admissão, limite desconto (NOT NULL)
- **Hierarquia de perfis:** VENDEDOR, GERENTE, MEDIDOR, ADMIN_MASTER
- **Níveis de acesso:** USUARIO, SUPERVISOR, GERENTE, ADMIN
- **Soft delete protegido:** Apenas ADMIN_MASTER, SUPER_ADMIN e ADMIN podem excluir

#### **Validações Implementadas:**
- **Email:** Pattern regex + obrigatório + normalização (lowercase)
- **Telefone:** Mínimo 10 dígitos + remoção caracteres especiais
- **UUIDs:** Conversão automática para string (loja_id, setor_id)
- **Datas:** Serialização ISO format para compatibilidade

#### **Otimizações de Performance:**
- **Evita N+1:** Batch queries para buscar nomes de lojas e setores
- **Nested selects:** Uma query para funcionários + queries separadas para relacionados
- **Índices aproveitados:** Busca por nome (ilike), filtros por loja_id, setor_id
- **Paginação eficiente:** COUNT separado + LIMIT/OFFSET otimizado

#### **Relacionamentos Implementados:**
- **N:1 com `c_lojas`** - Funcionário pertence a uma loja (FK `loja_id`)
- **N:1 com `cad_setores`** - Funcionário tem setor/departamento (FK `setor_id`)
- **1:N com vendas** - Funcionário como vendedor responsável
- **1:N com aprovações** - Gerentes aprovam descontos

#### **Tratamento de Erros Específico:**
- **ConflictException:** Nome duplicado (HTTP 409)
- **NotFoundException:** Funcionário não encontrado (HTTP 404)
- **DatabaseException:** Erros de banco genéricos (HTTP 500)
- **ValidationException:** Dados inválidos (HTTP 400)

#### **Campos Financeiros Completos:**
- **salario:** Salário base (obrigatório, NOT NULL)
- **data_admissao:** Data de contratação (obrigatório, NOT NULL)
- **limite_desconto:** % máximo de desconto (default 0.0)
- **comissao_percentual_vendedor/gerente:** % comissão por nível
- **tem_minimo_garantido:** Boolean para salário mínimo garantido
- **valor_minimo_garantido:** Valor mínimo mensal (default 0.0)
- **valor_medicao:** Taxa por medição (opcional)
- **override_comissao:** Comissão especial override (opcional)

#### **Valor Estratégico:**
- **RH completo:** Gestão profissional de equipe com dados financeiros
- **Hierarquia clara:** Perfis e níveis para controle de acesso
- **Auditoria total:** Soft delete preserva histórico completo
- **Performance otimizada:** Queries eficientes mesmo com milhares de funcionários
- **Escalabilidade:** Arquitetura preparada para grandes equipes

---

## 23. Sistema de Ambientes - Tabelas `c_ambientes` + `c_ambientes_material`

### **Função Real:** Sistema completo de gestão de ambientes/projetos com importação XML do Promob, armazenamento de materiais detalhados e relacionamento com clientes.

#### **Arquitetura Implementada (baseada no código):**
- **Dupla tabela:** `c_ambientes` (dados básicos) + `c_ambientes_material` (detalhes JSON)
- **Importador XML integrado:** Extrator específico para arquivos Promob
- **Service/Repository pattern:** Separação clara entre lógica de negócio e acesso a dados
- **Validações rigorosas:** Origem (xml/manual), valores monetários, dados obrigatórios
- **UPSERT inteligente:** Materiais são criados ou atualizados automaticamente

#### **Funcionamento Real (baseado nos Controllers/Services):**
- **CRUD completo (`/ambientes`):**
  - `GET /` - Listagem com filtros avançados (cliente, nome, origem, faixa de valores, período)
  - `GET /{id}` - Dados específicos com opção de incluir materiais
  - `POST /` - Criação manual ou via sistema
  - `PUT /{id}` - Atualização de dados básicos
  - `DELETE /{id}` - Exclusão permanente (hard delete)
- **Gestão de materiais (`/{id}/materiais`):**
  - `POST /{id}/materiais` - Criar/atualizar materiais JSON (UPSERT)
  - `GET /{id}/materiais` - Obter materiais estruturados
- **Importação XML:** `POST /importar-xml` com validações de segurança aprimoradas

#### **Sistema de Importação XML:**
- **Validações de segurança:**
  - Extensão .xml obrigatória
  - Content-type validado
  - Tamanho máximo 10MB
  - Prevenção path traversal
- **Processamento integrado:**
  - Extrator especializado para Promob XML
  - Conversão automática de valores (R$ → float)
  - Criação automática de ambiente + materiais
  - Metadados preservados (data/hora importação)

#### **Schemas Implementados:**
- **AmbienteCreate/Update:** Dados básicos (cliente_id, nome, valores, origem)
- **AmbienteResponse:** Dados completos + cliente_nome via JOIN
- **AmbienteMaterialCreate:** Estrutura JSON + hash para duplicatas
- **AmbienteFiltros:** Busca por cliente, nome, origem, faixa valores, período

#### **Regras de Negócio Específicas:**
- **Origem controlada:** Apenas 'xml' ou 'manual'
- **Valores positivos:** Validação para custo_fabrica e valor_venda
- **XML obrigatório:** Data/hora importação para origem 'xml'
- **Nome mínimo:** Pelo menos 2 caracteres
- **Cliente obrigatório:** Todo ambiente deve pertencer a um cliente

#### **Estrutura de Materiais JSON:**
```json
{
  "linha_detectada": "Linha Premium",
  "nome_ambiente": "Cozinha Principal",
  "caixa": {"cor": "Branco", "material": "MDF", "espessura": "15mm"},
  "paineis": {"acabamento": "Verniz", "textura": "Lisa"},
  "portas": {"cor": "Carvalho", "perfil": "Reta", "tipo": "Basculante"},
  "ferragens": {"marca": "Blum", "acabamento": "Inox", "tipo": "Soft Close"},
  "porta_perfil": {"modelo": "Perfil J", "cor": "Alumínio"},
  "brilhart_color": {"codigo": "BC-001", "nome": "Carvalho Natural"},
  "valor_total": {"custo_fabrica": "R$ 15.000,00", "valor_venda": "R$ 25.000,00"},
  "metadata": {"arquivo_origem": "projeto_cliente_001.xml", "versao_promob": "2024"}
}
```

#### **Relacionamentos Implementados:**
- **N:1 com `c_clientes`** - Ambiente pertence a cliente específico
- **1:1 com `c_ambientes_material`** - Detalhes técnicos em JSON
- **1:N com orçamentos** - Via `c_orcamento_ambientes`
- **JOIN otimizado** - Busca inclui cliente_nome automaticamente

#### **Validações de Importação XML:**
- **Segurança:** Prevenção de uploads maliciosos
- **Formato:** Validação de estrutura XML
- **Processamento:** Extração segura de dados técnicos
- **Conversão:** Valores monetários BRL para decimal
- **Metadados:** Preservação de informações de origem

#### **Filtros Avançados Implementados:**
- **busca:** Nome do ambiente (ILIKE)
- **cliente_id:** Filtro por cliente específico
- **origem:** 'xml' ou 'manual'
- **valor_min/valor_max:** Faixa de valores de venda
- **data_inicio/data_fim:** Período de importação
- **Paginação:** 1-100 itens por página
- **Ordenação:** Por data criação (mais recentes primeiro)

#### **Tratamento de Erros Específico:**
- **ValidationException:** Dados inválidos, arquivo XML malformado
- **NotFoundException:** Ambiente/cliente não encontrado
- **DatabaseException:** Erros de persistência
- **HTTPException 400:** Arquivo inválido (tipo, tamanho, formato)

#### **Valor Estratégico:**
- **Integração Promob:** Sistema conectado com principal ferramenta do setor
- **Rastreabilidade total:** XML → Ambiente → Materiais → Orçamento
- **Flexibilidade:** Criação manual ou automatizada via XML
- **Dados ricos:** Estrutura JSON preserva todos os detalhes técnicos
- **Performance:** Relacionamentos otimizados e filtros eficientes
- **Segurança:** Validações rigorosas para upload de arquivos

#### **Crítico para o Negócio:**
- **Base dos orçamentos:** Todo orçamento parte de ambientes
- **Precisão técnica:** Materiais detalhados garantem orçamentos corretos
- **Workflow otimizado:** Promob → XML → Sistema → Orçamento
- **Diferencial competitivo:** Integração profissional com ferramenta de design

---

## 24. Marketing e Rastreabilidade - Tabela `c_procedencias`

### **Função Real:** Sistema de rastreamento de origem de clientes para análise de eficácia de canais de marketing e ROI de investimentos promocionais.

#### **Implementação Atual (baseada no código):**
- **Script de população:** Criação automática de procedências padrão via script
- **Integração com clientes:** Referenciada em `c_clientes` via FK `procedencia_id`
- **Endpoint específico:** `GET /clientes/procedencias` retorna procedências ativas
- **Validação ativa:** Apenas procedências com `ativo = true` são exibidas

#### **Estrutura da Tabela `c_procedencias`:**
```sql
CREATE TABLE c_procedencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Procedências Padrão Implementadas:**
```python
PROCEDENCIAS_PADRAO = [
    'Indicação Amigo',
    'Facebook', 
    'Google',
    'Site',
    'WhatsApp',
    'Loja Física',
    'Outros'
]
```

#### **Funcionamento no Sistema:**
- **Cadastro de cliente:** Vendedor seleciona procedência obrigatoriamente
- **Listagem filtrada:** Apenas procedências ativas aparecem no formulário
- **Soft delete:** Procedências inativas não aparecem mas preservam histórico
- **Relacionamento protegido:** FK em clientes mantém integridade referencial

#### **Integração com Módulo Clientes:**
- **JOIN automático:** Repository busca nome da procedência junto com cliente
- **Filtro por procedência:** Relatórios podem filtrar clientes por origem
- **Análise de conversão:** Base para métricas de marketing

#### **Script de Inicialização:**
- **Verificação de duplicatas:** Não cria procedência se já existe
- **Criação em lote:** Popula todas as procedências padrão
- **Logs detalhados:** Feedback completo do processo
- **UUID automático:** Geração segura de identificadores

#### **Endpoints Implementados:**
- **`GET /clientes/procedencias`** - Lista procedências ativas para formulários
- **Integrado no módulo clientes** - Não tem módulo próprio separado
- **JOIN automático** - Nome da procedência vem junto com dados do cliente

#### **Regras de Negócio Simples:**
- **Nome único:** Constraint UNIQUE impede duplicatas
- **Obrigatório no cliente:** Todo cliente deve ter procedência informada
- **Soft delete:** Campo `ativo` controla visibilidade
- **Expansível:** Admins podem adicionar novos canais via script

#### **Relacionamentos Implementados:**
- **1:N com `c_clientes`** - Uma procedência pode ter vários clientes
- **Referência em relatórios** - Base para análises gerenciais
- **Filtros de busca** - Usado em consultas de clientes

#### **Valor para Análise de Marketing:**
- **ROI por canal:** Identificar quais investimentos geram mais clientes
- **Ticket médio por origem:** Clientes do Google vs. Indicação
- **Conversão por canal:** Taxa de fechamento por procedência
- **Sazonalidade:** Análise temporal de eficácia dos canais

#### **Índices Recomendados:**
```sql
CREATE INDEX idx_c_procedencias_nome ON c_procedencias(nome);
CREATE INDEX idx_c_procedencias_ativo ON c_procedencias(ativo);
```

#### **Políticas RLS:**
```sql
-- Procedências visíveis para todos os usuários autenticados
CREATE POLICY "procedencias_select" ON c_procedencias 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Apenas ADMIN pode modificar procedências
CREATE POLICY "procedencias_admin_only" ON c_procedencias 
    FOR ALL USING (
        auth.jwt() ->> 'perfil' IN ('ADMIN', 'SUPER_ADMIN')
    );
```

#### **Potencial Futuro (V2):**
- **Custos por canal:** Investimento mensal em cada procedência
- **Metas por origem:** Objetivos de captação por canal
- **Comissionamento diferenciado:** % diferentes por tipo de origem
- **Integração com ads:** Conectar com Facebook Ads, Google Ads

#### **Crítico para o Negócio:**
- **Simplicidade:** Tabela simples mas essencial para rastreamento
- **Base de relatórios:** Fundamental para análises de marketing
- **Obrigatório:** Todo cliente deve ter origem identificada
- **Escalável:** Fácil adicionar novos canais conforme necessário

---

## 25. Sistema de Configurações Operacionais - Interface `config_loja`

### **Função Real:** Interface completa de configuração de parâmetros críticos que controlam cálculos financeiros, limites de desconto e numeração de documentos por loja.

#### **Arquitetura Implementada (baseada no código):**
- **Frontend completo:** Hook + componentes + validações + persistência
- **LocalStorage:** Dados persistidos localmente com fallback para mock
- **Validações rigorosas:** Hierarquia de limites e regras de negócio
- **Interface responsiva:** Layout adaptativo com formulários organizados
- **Feedback em tempo real:** Cálculo de impacto e exemplos dinâmicos

#### **Configurações Financeiras Implementadas:**
- **Deflator Custo Fábrica (%):** Impacto direto na margem calculado em tempo real
- **Percentual de Frete (%):** Aplicado sobre valor de venda
- **Valor Padrão Medição (R$):** Taxa fixa para serviços de medição
- **Cálculo de impacto:** Mostra diferença monetária por R$ 1.000 de venda

#### **Limites de Desconto Hierárquicos:**
- **Limite Vendedor:** Desconto máximo sem aprovação (ex: 10%)
- **Limite Gerente:** Desconto intermediário com aprovação gerencial (ex: 20%)
- **Limite Admin Master:** Desconto máximo do sistema (ex: 50%)
- **Validação hierárquica:** Vendedor ≤ Gerente ≤ Admin Master

#### **Sistema de Numeração Configurável:**
- **Prefixo personalizado:** Ex: "ORC", "PROP", "VEN"
- **Formatos disponíveis:**
  - `YYYY-NNNNNN` → 2025-001001
  - `NNNNNN` → 001001
  - `MM-YYYY-NNNN` → 01-2025-1001
- **Número inicial:** Controle do ponto de partida da numeração
- **Exemplo dinâmico:** Preview em tempo real da numeração

#### **Validações Implementadas:**
```typescript
// Validação de hierarquia
if (vendedor > gerente) erro("Vendedor ≤ Gerente")
if (gerente > adminMaster) erro("Gerente ≤ Admin Master")

// Validação de percentuais
if (deflator < 0 || deflator > 100) erro("0% ≤ Deflator ≤ 100%")
if (frete < 0 || frete > 100) erro("0% ≤ Frete ≤ 100%")

// Validação de valores
if (medicao <= 0) erro("Medição > 0")
if (numeroInicial <= 0) erro("Número inicial > 0")
```

#### **Interface de Usuário Implementada:**
- **Formulário intuitivo:** Campos organizados com validação visual
- **Tabela expandível:** Detalhes de cada faixa em accordion
- **Badges visuais:** Cores diferenciadas por tipo e performance
- **Ordenação inteligente:** Faixas agrupadas por tipo e ordenadas por valor
- **Feedback em tempo real:** Alertas de sobreposição e erros

#### **Mock Data para Desenvolvimento:**
```typescript
mockRegrasComissao = [
  {
    id: '1', tipo: 'VENDEDOR', ordem: 1,
    valorMinimo: 0, valorMaximo: 50000, percentual: 2.5,
    ativo: true, descricao: 'Comissão básica até R$ 50k'
  },
  {
    id: '2', tipo: 'VENDEDOR', ordem: 2,
    valorMinimo: 50001, valorMaximo: 100000, percentual: 3.0,
    ativo: true, descricao: 'Comissão intermediária R$ 50k-100k'
  }
  // ... mais faixas
];
```

#### **Relacionamentos Implementados:**
- **N:1 com `c_lojas`** - Regras específicas por loja (FK `loja_id`)
- **Integração com `cad_equipe`** - Funcionários têm comissão individual + faixas
- **Uso em orçamentos** - Cálculo automático baseado no valor total
- **Auditoria via RLS** - Políticas garantem acesso apenas à própria loja

#### **Lógica de Aplicação das Comissões:**
```typescript
// Pseudocódigo de cálculo
function calcularComissao(valorVenda, tipoFuncionario, lojaId) {
  const faixas = buscarFaixasAtivas(tipoFuncionario, lojaId)
    .sort((a, b) => a.ordem - b.ordem);
  
  for (const faixa of faixas) {
    if (valorVenda >= faixa.valorMinimo && 
        (!faixa.valorMaximo || valorVenda <= faixa.valorMaximo)) {
      return valorVenda * (faixa.percentual / 100);
    }
  }
  
  return 0; // Sem comissão se não se enquadrar
}
```

#### **Hooks Implementados:**
- **`use-comissoes-crud.ts`** - CRUD completo com estado local
- **`use-comissoes-validation.ts`** - Validações específicas
- **`use-comissoes-refactored.ts`** - Versão otimizada para performance
- **Integração com localStorage** - Persistência temporária para desenvolvimento

#### **Componentes Implementados:**
- **`gestao-comissoes.tsx`** - Interface principal de gestão
- **`comissao-form.tsx`** - Formulário de criação/edição
- **`comissao-table.tsx`** - Tabela responsiva com expansão
- **Validação em tempo real** - Feedback imediato de erros

#### **Valor Estratégico:**
- **Motivação da equipe:** Comissões progressivas incentivam vendas maiores
- **Flexibilidade por loja:** Cada filial pode ter estrutura própria
- **Transparência:** Regras claras e visíveis para toda equipe
- **Escalabilidade:** Suporte a múltiplas faixas e tipos
- **Controle fino:** Ativação/desativação sem perder configurações

#### **Diferencial vs. Comissão Individual:**
- **`cad_equipe.comissao_percentual_vendedor`** - Comissão fixa individual
- **`c_config_regras_comissao_faixa`** - Comissões progressivas por faixa
- **Aplicação:** Sistema deve escolher qual usar (individual override ou faixas)
- **Flexibilidade:** Faixas permitem incentivos escalonados

#### **Implementação Backend Pendente:**
- **Controller:** Endpoints REST para CRUD das regras
- **Repository:** Queries otimizadas com filtros por loja/tipo
- **Service:** Lógica de validação e cálculo de comissões
- **RLS:** Políticas para garantir acesso apenas à própria loja
- **Migrations:** Criação de índices para performance

#### **Índices Recomendados:**
```sql
CREATE INDEX idx_comissao_faixa_loja_tipo ON c_config_regras_comissao_faixa(loja_id, tipo_comissao);
CREATE INDEX idx_comissao_faixa_ativo ON c_config_regras_comissao_faixa(ativo);
CREATE INDEX idx_comissao_faixa_valores ON c_config_regras_comissao_faixa(valor_minimo, valor_maximo);
```

#### **Políticas RLS Recomendadas:**
```sql
-- Usuários só veem regras da própria loja
CREATE POLICY "comissao_faixa_loja_policy" ON c_config_regras_comissao_faixa
    FOR SELECT USING (
        loja_id = (
            SELECT loja_id FROM usuarios 
            WHERE user_id = auth.uid()
        )
    );

-- Apenas ADMIN pode modificar regras de comissão
CREATE POLICY "comissao_faixa_admin_only" ON c_config_regras_comissao_faixa
    FOR INSERT, UPDATE, DELETE USING (
        auth.jwt() ->> 'perfil' IN ('ADMIN', 'SUPER_ADMIN', 'ADMIN_MASTER')
    );
```

#### **Crítico para o Negócio:**
- **Motivação de vendas:** Faixas progressivas incentivam vendas maiores
- **Transparência:** Regras claras evitam conflitos com equipe
- **Flexibilidade operacional:** Cada loja pode ter estrutura própria
- **Controle de custos:** Comissões previsíveis baseadas em performance
- **Escalabilidade:** Sistema suporta crescimento da rede de lojas

---

## 26. Sistema de Comissões por Faixas - Tabela `c_config_regras_comissao_faixa`

### **Função Real:** Sistema de configuração de comissões progressivas baseado em faixas de valor de venda, permitindo escalonamento de incentivos para vendedores e gerentes.

#### **Estrutura da Tabela (confirmada via análise):**
```sql
CREATE TABLE c_config_regras_comissao_faixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES c_lojas(id),
    tipo_comissao VARCHAR(20) NOT NULL, -- 'VENDEDOR' ou 'GERENTE'
    ordem INTEGER NOT NULL,
    valor_minimo DECIMAL(10,2) NOT NULL,
    valor_maximo DECIMAL(10,2), -- NULL = sem limite superior
    percentual DECIMAL(5,2) NOT NULL, -- Ex: 2.50 = 2,5%
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Arquitetura Implementada (baseada no frontend):**
- **Interface completa:** Gestão visual de faixas com validações
- **Validação de sobreposição:** Impede conflitos entre faixas
- **Ordenação automática:** Faixas organizadas por valor crescente
- **Mock data integrado:** Dados de exemplo para desenvolvimento
- **Componentes reutilizáveis:** Form + Table + Validations hooks

#### **Funcionamento Real (baseado nos componentes):**
- **Gestão visual (`gestao-comissoes.tsx`):**
  - Criação/edição de faixas por tipo (VENDEDOR/GERENTE)
  - Validação em tempo real de sobreposições
  - Preview de impacto nas comissões
  - Ativação/desativação de regras
- **Validações rigorosas (`use-comissoes-validation.ts`):**
  - Verificação de sobreposição de faixas
  - Validação hierárquica de valores
  - Consistência de percentuais (0.01% a 100%)
- **Interface responsiva (`comissao-table.tsx`):**
  - Visualização expandível de detalhes
  - Agrupamento por tipo de comissão
  - Badges coloridos por performance

#### **Regras de Negócio Implementadas:**
- **Faixas progressivas:** Valor mínimo < valor máximo
- **Sem sobreposição:** Faixas do mesmo tipo não podem se sobrepor
- **Ordem sequencial:** Campo `ordem` define sequência de aplicação
- **Tipos exclusivos:** Apenas 'VENDEDOR' e 'GERENTE' permitidos
- **Percentuais válidos:** Entre 0.01% e 100%
- **Loja obrigatória:** Toda regra pertence a uma loja específica

#### **Exemplo de Configuração Típica:**
```typescript
// Comissões VENDEDOR
Faixa 1: R$ 0 - R$ 50.000 = 2,5%
Faixa 2: R$ 50.001 - R$ 100.000 = 3,0%
Faixa 3: R$ 100.001+ = 3,5%

// Comissões GERENTE
Faixa 1: R$ 0 - R$ 200.000 = 1,5%
Faixa 2: R$ 200.001+ = 2,0%
```

#### **Validações Implementadas:**
```typescript
// Validação de sobreposição
const verificarSobreposicao = (novafaixa, faixasExistentes) => {
  return faixasExistentes.some(faixa => {
    const novoMin = novafaixa.valorMinimo;
    const novoMax = novafaixa.valorMaximo || Infinity;
    const existenteMin = faixa.valorMinimo;
    const existenteMax = faixa.valorMaximo || Infinity;
    
    return !(novoMax < existenteMin || novoMin > existenteMax);
  });
};

// Validação de dados
if (percentual <= 0 || percentual > 100) erro("Percentual inválido");
if (valorMaximo && valorMaximo <= valorMinimo) erro("Máximo > Mínimo");
```

#### **Interface de Usuário Implementada:**
- **Formulário intuitivo:** Campos organizados com validação visual
- **Tabela expandível:** Detalhes de cada faixa em accordion
- **Badges visuais:** Cores diferenciadas por tipo e performance
- **Ordenação inteligente:** Faixas agrupadas por tipo e ordenadas por valor
- **Feedback em tempo real:** Alertas de sobreposição e erros

#### **Mock Data para Desenvolvimento:**
```typescript
mockRegrasComissao = [
  {
    id: '1', tipo: 'VENDEDOR', ordem: 1,
    valorMinimo: 0, valorMaximo: 50000, percentual: 2.5,
    ativo: true, descricao: 'Comissão básica até R$ 50k'
  },
  {
    id: '2', tipo: 'VENDEDOR', ordem: 2,
    valorMinimo: 50001, valorMaximo: 100000, percentual: 3.0,
    ativo: true, descricao: 'Comissão intermediária R$ 50k-100k'
  }
  // ... mais faixas
];
```

#### **Relacionamentos Implementados:**
- **N:1 com `c_lojas`** - Regras específicas por loja (FK `loja_id`)
- **Integração com `cad_equipe`** - Funcionários têm comissão individual + faixas
- **Uso em orçamentos** - Cálculo automático baseado no valor total
- **Auditoria via RLS** - Políticas garantem acesso apenas à própria loja

#### **Lógica de Aplicação das Comissões:**
```typescript
// Pseudocódigo de cálculo
function calcularComissao(valorVenda, tipoFuncionario, lojaId) {
  const faixas = buscarFaixasAtivas(tipoFuncionario, lojaId)
    .sort((a, b) => a.ordem - b.ordem);
  
  for (const faixa of faixas) {
    if (valorVenda >= faixa.valorMinimo && 
        (!faixa.valorMaximo || valorVenda <= faixa.valorMaximo)) {
      return valorVenda * (faixa.percentual / 100);
    }
  }
  
  return 0; // Sem comissão se não se enquadrar
}
```

#### **Hooks Implementados:**
- **`use-comissoes-crud.ts`** - CRUD completo com estado local
- **`use-comissoes-validation.ts`** - Validações específicas
- **`use-comissoes-refactored.ts`** - Versão otimizada para performance
- **Integração com localStorage** - Persistência temporária para desenvolvimento

#### **Componentes Implementados:**
- **`gestao-comissoes.tsx`** - Interface principal de gestão
- **`comissao-form.tsx`** - Formulário de criação/edição
- **`comissao-table.tsx`** - Tabela responsiva com expansão
- **Validação em tempo real** - Feedback imediato de erros

#### **Valor Estratégico:**
- **Motivação da equipe:** Comissões progressivas incentivam vendas maiores
- **Flexibilidade por loja:** Cada filial pode ter estrutura própria
- **Transparência:** Regras claras e visíveis para toda equipe
- **Escalabilidade:** Suporte a múltiplas faixas e tipos
- **Controle fino:** Ativação/desativação sem perder configurações

#### **Diferencial vs. Comissão Individual:**
- **`cad_equipe.comissao_percentual_vendedor`** - Comissão fixa individual
- **`c_config_regras_comissao_faixa`** - Comissões progressivas por faixa
- **Aplicação:** Sistema deve escolher qual usar (individual override ou faixas)
- **Flexibilidade:** Faixas permitem incentivos escalonados

#### **Implementação Backend Pendente:**
- **Controller:** Endpoints REST para CRUD das regras
- **Repository:** Queries otimizadas com filtros por loja/tipo
- **Service:** Lógica de validação e cálculo de comissões
- **RLS:** Políticas para garantir acesso apenas à própria loja
- **Migrations:** Criação de índices para performance

#### **Índices Recomendados:**
```sql
CREATE INDEX idx_comissao_faixa_loja_tipo ON c_config_regras_comissao_faixa(loja_id, tipo_comissao);
CREATE INDEX idx_comissao_faixa_ativo ON c_config_regras_comissao_faixa(ativo);
CREATE INDEX idx_comissao_faixa_valores ON c_config_regras_comissao_faixa(valor_minimo, valor_maximo);
```

#### **Políticas RLS Recomendadas:**
```sql
-- Usuários só veem regras da própria loja
CREATE POLICY "comissao_faixa_loja_policy" ON c_config_regras_comissao_faixa
    FOR SELECT USING (
        loja_id = (
            SELECT loja_id FROM usuarios 
            WHERE user_id = auth.uid()
        )
    );

-- Apenas ADMIN pode modificar regras de comissão
CREATE POLICY "comissao_faixa_admin_only" ON c_config_regras_comissao_faixa
    FOR INSERT, UPDATE, DELETE USING (
        auth.jwt() ->> 'perfil' IN ('ADMIN', 'SUPER_ADMIN', 'ADMIN_MASTER')
    );
```

#### **Crítico para o Negócio:**
- **Motivação de vendas:** Faixas progressivas incentivam vendas maiores
- **Transparência:** Regras claras evitam conflitos com equipe
- **Flexibilidade operacional:** Cada loja pode ter estrutura própria
- **Controle de custos:** Comissões previsíveis baseadas em performance
- **Escalabilidade:** Sistema suporta crescimento da rede de lojas

---

## 26. Sistema de Comissões por Faixas - Tabela `c_config_regras_comissao_faixa`

### **Função Real:** Sistema de configuração de comissões progressivas baseado em faixas de valor de venda, permitindo escalonamento de incentivos para vendedores e gerentes.

#### **Estrutura da Tabela (confirmada via análise):**
```sql
CREATE TABLE c_config_regras_comissao_faixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loja_id UUID NOT NULL REFERENCES c_lojas(id),
    tipo_comissao VARCHAR(20) NOT NULL, -- 'VENDEDOR' ou 'GERENTE'
    ordem INTEGER NOT NULL,
    valor_minimo DECIMAL(10,2) NOT NULL,
    valor_maximo DECIMAL(10,2), -- NULL = sem limite superior
    percentual DECIMAL(5,2) NOT NULL, -- Ex: 2.50 = 2,5%
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **Arquitetura Implementada (baseada no frontend):**
- **Interface completa:** Gestão visual de faixas com validações
- **Validação de sobreposição:** Impede conflitos entre faixas
- **Ordenação automática:** Faixas organizadas por valor crescente
- **Mock data integrado:** Dados de exemplo para desenvolvimento
- **Componentes reutilizáveis:** Form + Table + Validations hooks

#### **Funcionamento Real (baseado nos componentes):**
- **Gestão visual (`gestao-comissoes.tsx`):**
  - Criação/edição de faixas por tipo (VENDEDOR/GERENTE)
  - Validação em tempo real de sobreposições
  - Preview de impacto nas comissões
  - Ativação/desativação de regras
- **Validações rigorosas (`use-comissoes-validation.ts`):**
  - Verificação de sobreposição de faixas
  - Validação hierárquica de valores
  - Consistência de percentuais (0.01% a 100%)
- **Interface responsiva (`comissao-table.tsx`):**
  - Visualização expandível de detalhes
  - Agrupamento por tipo de comissão
  - Badges coloridos por performance

#### **Regras de Negócio Implementadas:**
- **Faixas progressivas:** Valor mínimo < valor máximo
- **Sem sobreposição:** Faixas do mesmo tipo não podem se sobrepor
- **Ordem sequencial:** Campo `ordem` define sequência de aplicação
- **Tipos exclusivos:** Apenas 'VENDEDOR' e 'GERENTE' permitidos
- **Percentuais válidos:** Entre 0.01% e 100%
- **Loja obrigatória:** Toda regra pertence a uma loja específica

#### **Exemplo de Configuração Típica:**
```typescript
// Comissões VENDEDOR
Faixa 1: R$ 0 - R$ 50.000 = 2,5%
Faixa 2: R$ 50.001 - R$ 100.000 = 3,0%
Faixa 3: R$ 100.001+ = 3,5%

// Comissões GERENTE
Faixa 1: R$ 0 - R$ 200.000 = 1,5%
Faixa 2: R$ 200.001+ = 2,0%
```

#### **Validações Implementadas:**
```typescript
// Validação de sobreposição
const verificarSobreposicao = (novafaixa, faixasExistentes) => {
  return faixasExistentes.some(faixa => {
    const novoMin = novafaixa.valorMinimo;
    const novoMax = novafaixa.valorMaximo || Infinity;
    const existenteMin = faixa.valorMinimo;
    const existenteMax = faixa.valorMaximo || Infinity;
    
    return !(novoMax < existenteMin || novoMin > existenteMax);
  });
};

// Validação de dados
if (percentual <= 0 || percentual > 100) erro("Percentual inválido");
if (valorMaximo && valorMaximo <= valorMinimo) erro("Máximo > Mínimo");
```

#### **Interface de Usuário Implementada:**
- **Formulário intuitivo:** Campos organizados com validação visual
- **Tabela expandível:** Detalhes de cada faixa em accordion
- **Badges visuais:** Cores diferenciadas por tipo e performance
- **Ordenação inteligente:** Faixas agrupadas por tipo e ordenadas por valor
- **Feedback em tempo real:** Alertas de sobreposição e erros

#### **Mock Data para Desenvolvimento:**
```typescript
mockRegrasComissao = [
  {
    id: '1', tipo: 'VENDEDOR', ordem: 1,
    valorMinimo: 0, valorMaximo: 50000, percentual: 2.5,
    ativo: true, descricao: 'Comissão básica até R$ 50k'
  },
  {
    id: '2', tipo: 'VENDEDOR', ordem: 2,
    valorMinimo: 50001, valorMaximo: 100000, percentual: 3.0,
    ativo: true, descricao: 'Comissão intermediária R$ 50k-100k'
  }
  // ... mais faixas
];
```

#### **Relacionamentos Implementados:**
- **N:1 com `c_lojas`** - Regras específicas por loja (FK `loja_id`)
- **Integração com `cad_equipe`** - Funcionários têm comissão individual + faixas
- **Uso em orçamentos** - Cálculo automático baseado no valor total
- **Auditoria via RLS** - Políticas garantem acesso apenas à própria loja

#### **Lógica de Aplicação das Comissões:**
```typescript
// Pseudocódigo de cálculo
function calcularComissao(valorVenda, tipoFuncionario, lojaId) {
  const faixas = buscarFaixasAtivas(tipoFuncionario, lojaId)
    .sort((a, b) => a.ordem - b.ordem);
  
  for (const faixa of faixas) {
    if (valorVenda >= faixa.valorMinimo && 
        (!faixa.valorMaximo || valorVenda <= faixa.valorMaximo)) {
      return valorVenda * (faixa.percentual / 100);
    }
  }
  
  return 0; // Sem comissão se não se enquadrar
}
```

#### **Hooks Implementados:**
- **`use-comissoes-crud.ts`** - CRUD completo com estado local
- **`use-comissoes-validation.ts`** - Validações específicas
- **`use-comissoes-refactored.ts`** - Versão otimizada para performance
- **Integração com localStorage** - Persistência temporária para desenvolvimento

#### **Componentes Implementados:**
- **`gestao-comissoes.tsx`** - Interface principal de gestão
- **`comissao-form.tsx`** - Formulário de criação/edição
- **`comissao-table.tsx`** - Tabela responsiva com expansão
- **Validação em tempo real** - Feedback imediato de erros

#### **Valor Estratégico:**
- **Motivação da equipe:** Comissões progressivas incentivam vendas maiores
- **Flexibilidade por loja:** Cada filial pode ter estrutura própria
- **Transparência:** Regras claras e visíveis para toda equipe
- **Escalabilidade:** Suporte a múltiplas faixas e tipos
- **Controle fino:** Ativação/desativação sem perder configurações

#### **Diferencial vs. Comissão Individual:**
- **`cad_equipe.comissao_percentual_vendedor`** - Comissão fixa individual
- **`c_config_regras_comissao_faixa`** - Comissões progressivas por faixa
- **Aplicação:** Sistema deve escolher qual usar (individual override ou faixas)
- **Flexibilidade:** Faixas permitem incentivos escalonados

#### **Implementação Backend Pendente:**
- **Controller:** Endpoints REST para CRUD das regras
- **Repository:** Queries otimizadas com filtros por loja/tipo
- **Service:** Lógica de validação e cálculo de comissões
- **RLS:** Políticas para garantir acesso apenas à própria loja
- **Migrations:** Criação de índices para performance

#### **Índices Recomendados:**
```sql
CREATE INDEX idx_comissao_faixa_loja_tipo ON c_config_regras_comissao_faixa(loja_id, tipo_comissao);
CREATE INDEX idx_comissao_faixa_ativo ON c_config_regras_comissao_faixa(ativo);
CREATE INDEX idx_comissao_faixa_valores ON c_config_regras_comissao_faixa(valor_minimo, valor_maximo);
```

#### **Políticas RLS Recomendadas:**
```sql
-- Usuários só veem regras da própria loja
CREATE POLICY "comissao_faixa_loja_policy" ON c_config_regras_comissao_faixa
    FOR ALL USING (
        loja_id = (
            SELECT loja_id FROM usuarios 
            WHERE user_id = auth.uid()
        )
    );

-- Apenas ADMIN pode modificar regras de comissão
CREATE POLICY "comissao_faixa_admin_only" ON c_config_regras_comissao_faixa
    FOR INSERT, UPDATE, DELETE USING (
        auth.jwt() ->> 'perfil' IN ('ADMIN', 'SUPER_ADMIN', 'ADMIN_MASTER')
    );
```

#### **Crítico para o Negócio:**
- **Motivação de vendas:** Faixas progressivas incentivam vendas maiores
- **Transparência:** Regras claras evitam conflitos com equipe
- **Flexibilidade operacional:** Cada loja pode ter estrutura própria
- **Controle de custos:** Comissões previsíveis baseadas em performance
- **Escalabilidade:** Sistema suporta crescimento da rede de lojas

---

*Este documento será atualizado conforme novas regras forem discutidas e definidas.*
