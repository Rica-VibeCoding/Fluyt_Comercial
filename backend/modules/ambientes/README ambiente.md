# =� M�DULO AMBIENTES - DOCUMENTA��O COMPLETA

**�ltima atualiza��o:** 29/06/2025  
**Autor:** Ricardo Borges  
**Status:**  Funcional com importa��o XML

## <� VIS�O GERAL

O m�dulo Ambientes gerencia ambientes de m�veis planejados, permitindo:
- Criar ambientes manualmente
- Importar ambientes de arquivos XML do Promob
- Armazenar detalhes t�cnicos em formato JSON flex�vel
- Calcular valores de custo e venda

## =� ESTRUTURA DO BANCO DE DADOS

### Tabela: `c_ambientes`
```sql
- id: UUID (PK)
- cliente_id: UUID (FK � c_clientes) OBRIGAT�RIO
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
- ambiente_id: UUID (FK � c_ambientes)
- materiais_json: JSONB (flex�vel)
- xml_hash: TEXT (para evitar duplicatas)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## =� ESTRUTURA DE ARQUIVOS

```
modules/ambientes/
   __init__.py          # Exports do m�dulo
   controller.py        # Endpoints da API REST
   service.py          # L�gica de neg�cio
   repository.py       # Acesso ao banco de dados
   schemas.py          # Modelos Pydantic (valida��o)
   README ambiente.md  # Esta documenta��o
   extrator_xml/       # M�dulo de processamento XML
       app/
          extractors/
             xml_extractor.py  # Motor principal
          models/               # Estruturas de dados
          utils/               # Fun��es auxiliares
       main.py                  # API standalone do extrator
```

## = ENDPOINTS DA API

### 1. **Listar Ambientes**
```http
GET /api/v1/ambientes
```
**Par�metros de Query:**
- `cliente_id`: UUID do cliente (filtro)
- `nome`: Nome parcial (busca)
- `origem`: 'xml' ou 'manual'
- `valor_min/valor_max`: Faixa de valores
- `data_inicio/data_fim`: Per�odo
- `page`: P�gina (padr�o: 1)
- `per_page`: Itens por p�gina (padr�o: 20)

**Resposta:**
```json
{
  "items": [...],
  "total": 10,
  "page": 1,
  "per_page": 20,
  "pages": 1
}
```

### 2. **Buscar Ambiente por ID**
```http
GET /api/v1/ambientes/{id}?include=materiais
```
**Par�metros:**
- `include=materiais`: Incluir dados JSON dos materiais

### 3. **Criar Ambiente Manual**
```http
POST /api/v1/ambientes
```
**Body:**
```json
{
  "cliente_id": "uuid",
  "nome": "Cozinha Moderna",
  "valor_custo_fabrica": 5000.00,
  "valor_venda": 10000.00,
  "origem": "manual"
}
```

### 4. **Importar XML** P NOVO
```http
POST /api/v1/ambientes/importar-xml?cliente_id=uuid
```
**Headers:**
```
Content-Type: multipart/form-data
```
**Body:**
- `arquivo`: Arquivo XML do Promob

**Fluxo:**
1. Recebe arquivo XML
2. Processa com extrator
3. Cria ambiente + materiais
4. Retorna ambiente completo

### 5. **Atualizar Ambiente**
```http
PUT /api/v1/ambientes/{id}
```

### 6. **Deletar Ambiente**
```http
DELETE /api/v1/ambientes/{id}
```

### 7. **Gerenciar Materiais**
```http
GET /api/v1/ambientes/{id}/materiais
POST /api/v1/ambientes/{id}/materiais
```

## =' COMO FUNCIONA A IMPORTA��O XML

### 1. **Frontend envia arquivo**
```javascript
// Frontend: ambiente-page.tsx
const response = await ambientesService.importarXML(clienteId, file);
```

### 2. **Controller recebe**
```python
# controller.py - linha 330
@router.post("/importar-xml")
async def importar_xml(arquivo: UploadFile):
    # Valida arquivo
    # L� conte�do
    # Chama service
```

### 3. **Service processa**
```python
# service.py - linha 412
async def importar_xml_ambiente():
    # Integra com extrator XML
    # Converte valores monet�rios
    # Cria ambiente
    # Salva materiais em JSON
```

### 4. **Extrator XML analisa**
```python
# extrator_xml/app/extractors/xml_extractor.py
- Detecta linhas (Unique/Sublime)
- Extrai 7 se��es de dados
- Retorna estrutura organizada
```

### 5. **Estrutura do JSON salvo**
```json
{
  "linha_detectada": "Unique / Sublime",
  "nome_ambiente": "COZINHA",
  "caixa": {
    "material": "MDF",
    "cor": "Branco",
    "espessura": "18mm"
  },
  "portas": {...},
  "ferragens": {...},
  "valor_total": {
    "custo_fabrica": "R$ 1.644,38",
    "valor_venda": "R$ 14.799,42"
  }
}
```

## = PROBLEMAS CONHECIDOS

### 1. **Codifica��o do arquivo .env**
- **Sintoma:** UnicodeDecodeError ao iniciar
- **Solu��o:** Recriar .env em UTF-8

### 2. **Backend n�o rodando**
- **Sintoma:** Erro 502 Bad Gateway
- **Solu��o:** Executar `python main.py` no backend

### 3. **Import paths no Frontend**
- **Sintoma:** Module not found
- **Solu��o:** Usar `@/` ao inv�s de caminhos relativos

## =� COMO TESTAR

### 1. **Teste Manual Completo**
```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd Frontend
npm run dev

# Navegador
1. Acessar http://localhost:3000/painel/ambientes
2. Selecionar um cliente
3. Clicar "Importar XML"
4. Escolher arquivo .xml do Promob
5. Ver ambiente criado na tabela
```

### 2. **Teste via API (Postman/Insomnia)**
```bash
# 1. Login
POST http://localhost:8000/api/v1/auth/login
{
  "email": "admin@fluyt.com",
  "password": "admin123"
}

# 2. Importar XML
POST http://localhost:8000/api/v1/ambientes/importar-xml?cliente_id=UUID
Headers: Authorization: Bearer TOKEN
Body: form-data com arquivo XML
```

## =� TAREFAS FUTURAS

### Alta Prioridade
- [ ] Implementar hash do XML para evitar duplicatas
- [ ] Adicionar preview dos materiais na tabela
- [ ] Criar relat�rio de ambientes por cliente

### M�dia Prioridade
- [ ] Edi��o de materiais ap�s importa��o
- [ ] Exportar ambientes para Excel
- [ ] Hist�rico de altera��es

### Baixa Prioridade
- [ ] Importa��o em lote (m�ltiplos XMLs)
- [ ] Templates de ambientes
- [ ] C�lculo autom�tico de margem

## = DEBUGGING

### Logs importantes
```python
# Ver processamento XML
logger.info(f"Processando XML '{nome_arquivo}' com extrator")

# Ver cria��o do ambiente
logger.info(f"Ambiente {ambiente.id} importado do XML com sucesso")
```

### Verificar no banco
```sql
-- Ver ambientes
SELECT * FROM c_ambientes ORDER BY created_at DESC;

-- Ver materiais
SELECT ambiente_id, materiais_json 
FROM c_ambientes_material;

-- Ver ambiente completo
SELECT a.*, m.materiais_json
FROM c_ambientes a
LEFT JOIN c_ambientes_material m ON a.id = m.ambiente_id
WHERE a.cliente_id = 'UUID';
```

## =h=� PARA DESENVOLVEDORES

### Adicionar novo campo
1. Alterar tabela no Supabase
2. Atualizar `schemas.py`
3. Ajustar `repository.py` 
4. Modificar `service.py` se necess�rio
5. Atualizar tipos no Frontend

### Modificar extrator XML
1. Arquivos em `extrator_xml/app/`
2. Testar standalone: `cd extrator_xml && python main.py`
3. Interface web: http://localhost:8000

### Padr�es do projeto
- Backend: snake_case
- Frontend: camelCase
- Convers�o autom�tica via middleware
- Sempre validar dados de entrada
- Logs em portugu�s

## <� SUPORTE

**Problemas comuns:**
1. Verificar se backend est� rodando
2. Conferir se cliente foi selecionado
3. Ver console do navegador para erros
4. Checar logs do backend

**Contato:** Ricardo Borges - Empreendedor criando com IA =�