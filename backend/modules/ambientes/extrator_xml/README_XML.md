# Mapeamento XML Promob - Extrator de Acabamentos (v2.0)

## ✨ **NOVA FUNCIONALIDADE: MÚLTIPLAS LINHAS SIMULTÂNEAS**

O sistema agora detecta e processa **simultaneamente** múltiplas linhas no mesmo XML, concatenando dados com separador ` / `:

### **Exemplo Real:**
```xml
<!-- XML com AMBAS as linhas -->
<MODELCATEGORYINFORMATION DESCRIPTION="Coleção Unique ">
    <MODELINFORMATION DESCRIPTION="5 - Puxadores">
        <MODELTYPEINFORMATION DESCRIPTION="128mm\Pux. Punata" />
    </MODELINFORMATION>
</MODELCATEGORYINFORMATION>

<MODELCATEGORYINFORMATION DESCRIPTION="Coleção Sublime">
    <MODELINFORMATION DESCRIPTION="Modelo Frontal">
        <MODELTYPEINFORMATION DESCRIPTION="Frontal" />
    </MODELINFORMATION>
</MODELCATEGORYINFORMATION>
```

### **Resultado Concatenado:**
```
Linha Detectada: Unique / Sublime
🚪 Portas
Material: MDF / MDP
Modelo: Frontal Milano / Frontal
🔧 Ferragens  
Puxadores: 128mm > Pux. Punata / Sem Puxador
Corrediças: Movelmar Telescópica c/amortecedor
```

## ESTRUTURA BASE XML

Todos os dados seguem a estrutura hierárquica:
```
LISTING → AMBIENTS → AMBIENT → MODELINFORMATIONS → MODELCATEGORYINFORMATIONS → 
MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Unique "] OU [@DESCRIPTION="Coleção Sublime"] → 
MODELINFORMATIONS → MODELINFORMATION[@DESCRIPTION="..."] → 
MODELTYPEINFORMATIONS → MODELTYPEINFORMATION[@DESCRIPTION="valor"]
```

## CAMPOS MAPEADOS (7 SEÇÕES) - **COM MÚLTIPLAS LINHAS**

### ✅ 1. CAIXA - **REFATORADO PARA MÚLTIPLAS LINHAS**

**Seções Base**: 
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Unique "]` 
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Sublime"]`

| Campo | XPath Unique | XPath Sublime | Valor Exemplo | Tratamento |
|-------|--------------|---------------|---------------|------------|
| **Linha** | Detectar todas disponíveis | Detectar todas disponíveis | "Unique / Sublime" | **NOVO: Múltiplas linhas** |
| **Espessura** | `MODELINFORMATION[@DESCRIPTION="1 - Espessura Caixa"]` | ❌ Não existe (15mm padrão) | "18mm / 15mm" | **Concatenar com ` / `** |
| **Espessura Prateleiras** | `MODELINFORMATION[@DESCRIPTION="1.1 - Espessura Prateleiras"]` | ❌ Não existe | "18mm" | **Concatenar com ` / `** |
| **Material + Cor** | `MODELINFORMATION[@DESCRIPTION="4 - Cor Corpo"]` | `MODELINFORMATION[@DESCRIPTION="Cor Corpo"]` | "MDF\Branco / MDP\Itapuã" | **Separar por `\` + Concatenar materiais/cores** |

**⚠️ NOVA REGRA MÚLTIPLAS LINHAS**: 
- O extrator detecta **TODAS** as linhas disponíveis no XML
- Concatena valores únicos com ` / ` (ex: "MDF / MDP", "18mm / 15mm")
- Remove duplicatas automaticamente
- Sublime usa espessura padrão 15mm quando não especificada

**📋 FORMATO DE SAÍDA ESPERADO**:
```
Caixa
Linha: Unique / Sublime
Espessura: 18mm / 15mm
Material: MDF / MDP  
Cor: Branco Polar / Itapuã
```

**Algoritmo Python Refatorado**:
```python
def extrair_caixa_multiplas_linhas(xml_content):
    # NOVO: Detectar TODAS as linhas disponíveis
    linhas_detectadas = detectar_linhas_disponiveis(xml_content)  # ["Unique", "Sublime"]
    
    # Inicializar listas para agrupamento
    todas_espessuras = []
    todos_materiais = []
    todas_cores = []
    
    for linha in linhas_detectadas:
        colecao_xpath = f"//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção {linha}{"" if linha == "Sublime" else " "}']"
        
        # Extrair dados específicos por linha
        if linha == "Unique":
            espessuras = extrair_multiplos_valores_se_existe(colecao_xpath, "1 - Espessura Caixa")
            materiais_cores = extrair_multiplos_valores_se_existe(colecao_xpath, "4 - Cor Corpo")
        elif linha == "Sublime":
            espessuras = ["15mm"]  # Padrão para Sublime
            materiais_cores = extrair_multiplos_valores_se_existe(colecao_xpath, "Cor Corpo")
        
        # Processar e adicionar às listas globais
        todas_espessuras.extend(espessuras)
        
        for item in materiais_cores:
            if '\\' in item:
                material, cor = item.split('\\', 1)
                todos_materiais.append(material.strip())
                todas_cores.append(cor.strip())
    
    # NOVO: Concatenar dados únicos de todas as linhas
    resultado = {
        'linha': ' / '.join(linhas_detectadas),
        'espessura': ' / '.join(list(dict.fromkeys(todas_espessuras))) if todas_espessuras else None,
        'material': ' / '.join(list(dict.fromkeys(todos_materiais))) if todos_materiais else None,
        'cor': ' / '.join(list(dict.fromkeys(todas_cores))) if todas_cores else None
    }
    
    return resultado if any(resultado.values()) else None

def detectar_linhas_disponiveis(xml_content):
    """NOVO: Detecta TODAS as linhas disponíveis no XML"""
    linhas = []
    if 'DESCRIPTION="Coleção Unique "' in xml_content:
        linhas.append('Unique')
    if 'DESCRIPTION="Coleção Sublime"' in xml_content:
        linhas.append('Sublime')
    return linhas
```

### ✅ 2. PORTAS - **REFATORADO PARA MÚLTIPLAS LINHAS**

**Seções Base**: 
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Unique "]`
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Sublime"]`

| Campo | XPath Unique | XPath Sublime | Valor Exemplo | Tratamento |
|-------|--------------|---------------|---------------|------------|
| **Espessura Frontal** | `MODELINFORMATION[@DESCRIPTION="3 - Espessura Frontal"]` | ❌ Não existe | "18mm" | **Concatenar com ` / `** |
| **Modelo Frontal** | `MODELINFORMATION[@DESCRIPTION="4.1 - Modelo Frontal"]` | `MODELINFORMATION[@DESCRIPTION="Modelo Frontal"]` | "Frontal Milano / Frontal" | **Concatenar com ` / `** |
| **Cor Frontal** | `MODELINFORMATION[@DESCRIPTION="5 - Cor Frontal"]` | `MODELINFORMATION[@DESCRIPTION="Cor Frontal"]` | "MDF\Branco / MDP\Itapuã" | **Separar por `\` + Concatenar** |

**🚨 REGRAS CRÍTICAS MÚLTIPLAS LINHAS**:
- **JAMAIS exibir dados que NÃO existem no XML** - pode comprometer o negócio
- **Concatenar apenas dados reais** de cada linha disponível
- **Sublime**: Nomenclatura diferente (sem números nos campos)
- **Validação rigorosa**: Verificar existência antes de extrair

**📋 FORMATO DE SAÍDA ESPERADO**:
```
Portas
Espessura: 18mm
Material: MDF / MDP
Modelo: Frontal Milano / Frontal
Cor: Branco Polar / Itapuã
```

### ✅ 3. FERRAGENS - **REFATORADO PARA MÚLTIPLAS LINHAS**

**Seções Base**: 
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Unique "]`
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Sublime"]`

| Campo | XPath Unique | XPath Sublime | Valor Exemplo | Tratamento |
|-------|--------------|---------------|---------------|------------|
| **Puxadores** | `MODELINFORMATION[@DESCRIPTION="5 - Puxadores"]` | **FALLBACK para Unique** | "128mm > Pux. Punata / Sem Puxador" | **Concatenar com ` / `** |
| **Dobradiça** | `MODELINFORMATION[@DESCRIPTION="7 - Dobradiça"]` | ❌ Usar "Tipo Dobradiças" | "Movelmar / Soft" | **Concatenar com ` / `** |
| **Tipo Dobradiça** | `MODELINFORMATION[@DESCRIPTION="7.2.1 - Tipo Dobradiça"]` | `MODELINFORMATION[@DESCRIPTION="Tipo Dobradiças"]` | "c/ Amortecimento / c/ amortecimento" | **Concatenar com ` / `** |
| **Corrediças** | **7.1 + 7.1.1 + 7.2** | `MODELINFORMATION[@DESCRIPTION="Tipo Corrediças"]` | "Movelmar Telescópica c/amortecedor / Standard amortecimento" | **Hierarquia 3 níveis + Concatenar** |

**⚠️ REGRAS MÚLTIPLAS LINHAS**: 
- **Puxadores**: Sublime busca fallback em Unique se não tiver próprios
- **Dobradiças**: Combinar marca + tipo quando ambos existem
- **Corrediças Unique**: Hierarquia 3 níveis (7.1 Marca + 7.1.1 Modelo + 7.2 Tipo)
- **Corrediças Sublime**: Apenas tipo da variável "Tipo Corrediças"
- **Limpeza automática**: Remove redundâncias ("c/ corrediça", prefixos)
- **Concatenação**: Usar ` / ` entre valores de diferentes linhas
- **Todos campos opcionais**: Se nenhum existir, não mostrar seção

**📋 FORMATO DE SAÍDA ESPERADO**:
```
Ferragens
Puxadores: 128mm > Pux. Punata / Sem Puxador
Dobradiças: Movelmar c/ Amortecimento / Soft c/ amortecimento
Corrediças: Movelmar Telescópica c/amortecedor / Standard amortecimento
```

### ✨ **CORREDIÇAS - IMPLEMENTAÇÃO HIERÁRQUICA COMPLETA**

**Estrutura Hierárquica Unique:**
```
7.1 - Corrediça (MARCA)
├── Movelmar
├── Hafele
└── [Outras marcas]

7.1.1 - Gaveta (MODELO)  
├── c/ corrediça telescópica → "Telescópica"
├── c/ corrediça oculta → "Oculta"
├── Alto Drawer → "Alto Drawer"
└── [Outros modelos]

7.2 - Tipo Corrediça (TIPO)
├── s/ amortecimento → "s/amortecedor"  
├── c/ amortecimento → "c/amortecedor"
└── [Outros tipos]
```

**Processamento Inteligente:**
- **Limpeza automática**: Remove "c/ corrediça" redundante do modelo
- **Padronização**: "amortecimento" → "amortecedor" para consistência
- **Concatenação**: Marca + Modelo + Tipo = "Movelmar Telescópica c/amortecedor"
- **Fallback**: Se 7.1 não existir, usa MARCA das REFERENCES

**Sublime Simplificado:**
- **Apenas**: `MODELINFORMATION[@DESCRIPTION="Tipo Corrediças"]`
- **Exemplo**: "Standard s/ amortecimento" → "Standard amortecimento"
- **Processamento**: Remove prefixos "s/" e "c/" desnecessários

### ✅ 4. PAINÉIS - **REFATORADO PARA MÚLTIPLAS LINHAS**

**Seções Base**: 
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Unique "]`
- `MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Sublime"]`

| Campo | XPath Unique | XPath Sublime | Valor Exemplo | Tratamento |
|-------|--------------|---------------|---------------|------------|
| **Material + Cor** | `MODELINFORMATION[@DESCRIPTION="7 - Painéis"]` | `MODELINFORMATION[@DESCRIPTION="Painéis"]` | "MDF\Azul / MDP\Branco" | **Separar por `\` + Concatenar** |
| **Espessura** | `MODELINFORMATION[@DESCRIPTION="2 - Espessura Painéis"]` | ❌ Não existe | "15mm" | **Concatenar com ` / `** |

**📋 FORMATO DE SAÍDA ESPERADO**:
```
Painéis
Material: MDF / MDP
Espessura: 15mm
Cor: Azul Lord / Branco Trama
```

### ✅ 5. PORTA PERFIL - **INDEPENDENTE DE LINHA**

**Seção Base**: `MODELCATEGORYINFORMATION[@DESCRIPTION="Portábille"]`

| Campo | XPath | Valor Exemplo | Tratamento |
|-------|-------|---------------|------------|
| **Perfil** | `MODELINFORMATION[@DESCRIPTION="Perfil"]` + `MODELINFORMATION[@DESCRIPTION="Acab Perfis"]` | "1830 / Anodizado" | **Combinar perfil + acabamento** |
| **Vidro** | `MODELINFORMATION[@DESCRIPTION="Acab Vidros"]` + `MODELINFORMATION[@DESCRIPTION="Painéis"]` | "Argentato / 4mm" | **Combinar acabamento + espessura** |
| **Puxador** | `MODELINFORMATION[@DESCRIPTION="Puxadores"]` | "2007" | **Direto** |

**🚨 REGRAS ESPECÍFICAS**:
- **Independente de linha**: Não afetado por Unique/Sublime
- **Combinação inteligente**: Perfil + Acabamento, Vidro + Espessura
- **Omissão**: "Sem Dobradiças" não aparece no resultado

### ✅ 6. BRILHART COLOR - **INDEPENDENTE DE LINHA**

**Seção Base**: `MODELCATEGORYINFORMATION[@DESCRIPTION="Brilhart Color"]`

| Campo | XPath | Valor Exemplo | Tratamento |
|-------|-------|---------------|------------|
| **Espessura** | Detectar automaticamente | "18mm" | **Detecção automática** |
| **Cor** | `MODELINFORMATION[@DESCRIPTION="Acab Porta"]` | "Fosco(1 Face) > Alaska" | **Separar por `>`** |
| **Perfil** | `MODELINFORMATION[@DESCRIPTION="Acab Perfil"]` | "Anodizado > Inox Escovado" | **Separar por `>`** |

**🚨 REGRAS ESPECÍFICAS**:
- **Independente de linha**: Não afetado por Unique/Sublime
- **HTML entities**: Decodificar `&gt;` para `>`
- **Separação**: Usar ` > ` para melhor legibilidade

### ✅ 7. VALOR TOTAL - **SIMPLIFICADO**

**Seção Base**: `LISTING/TOTALPRICES`

| Campo | XPath | Valor Exemplo | Tratamento |
|-------|-------|---------------|------------|
| **Custo Fábrica** | `//TOTALPRICES/MARGINS/ORDER/@VALUE` | "R$ 1.644,38" | **Formatado direto** |
| **Valor Venda** | `//TOTALPRICES/MARGINS/BUDGET/@VALUE` | "R$ 14.799,42" | **Formatado direto** |

**🚨 SIMPLIFICAÇÃO IMPLEMENTADA**:
- **Apenas 2 campos**: Custo de fábrica e valor de venda
- **Já formatados**: Retorna strings no formato "R$ X.XXX,XX"
- **Múltiplos fallbacks**: Busca em diferentes locais do XML

**📋 FORMATO DE SAÍDA ESPERADO**:
```
Valor Total
Custo Fábrica: R$ 1.644,38
Valor Venda: R$ 14.799,42
```

## ALGORITMO PRINCIPAL - **MÚLTIPLAS LINHAS**

```python
def extract_multiplas_linhas(xml_content):
    """
    NOVO: Extrai dados de TODAS as linhas disponíveis simultaneamente
    """
    # 1. Detectar TODAS as linhas disponíveis
    linhas_detectadas = detectar_linhas_disponiveis(xml_content)
    
    if not linhas_detectadas:
        return {"success": False, "error": "Nenhuma linha detectada"}
    
    # 2. Extrair dados de cada seção para TODAS as linhas
    resultado = {
        "success": True,
        "linha_detectada": " / ".join(linhas_detectadas),
        "caixa": extrair_caixa_multiplas_linhas(linhas_detectadas),
        "paineis": extrair_paineis_multiplas_linhas(linhas_detectadas),
        "portas": extrair_portas_multiplas_linhas(linhas_detectadas),
        "ferragens": extrair_ferragens_multiplas_linhas(linhas_detectadas),
        "porta_perfil": extrair_porta_perfil(),  # Independente de linha
        "brilhart_color": extrair_brilhart_color(),  # Independente de linha
        "valor_total": extrair_valor_total_simplificado()
    }
    
    # 3. Remover seções vazias
    resultado = {k: v for k, v in resultado.items() if v is not None}
    
    return resultado

def concatenar_valores_unicos(valores_lista):
    """
    NOVO: Concatena valores únicos de múltiplas linhas
    Remove duplicatas e junta com ' / '
    """
    if not valores_lista:
        return None
    
    valores_unicos = list(dict.fromkeys(valores_lista))  # Remove duplicatas mantendo ordem
    return ' / '.join(valores_unicos) if valores_unicos else None
```

## VALIDAÇÃO ANTI-DADOS FANTASMA

```python
def tem_dados_reais(dados):
    """
    CRÍTICO: Verifica se um objeto tem dados reais
    Evita renderizar seções vazias no frontend
    """
    if not dados or not isinstance(dados, dict):
        return False
    
    # Verificar se pelo menos um campo tem valor útil
    for valor in dados.values():
        if isinstance(valor, list):
            if len(valor) > 0:
                return True
        elif valor is not None and valor != '' and valor != []:
            return True
    
    return False

def validar_secao_antes_renderizar(secao_dados):
    """
    NOVO: Validação rigorosa antes de renderizar no frontend
    """
    if not tem_dados_reais(secao_dados):
        return False
    
    # Verificações específicas por tipo de seção
    if isinstance(secao_dados, dict):
        campos_uteis = [v for v in secao_dados.values() if v is not None and v != '']
        return len(campos_uteis) > 0
    
    return True
```

## STATUS GERAL - **VERSÃO 2.0**

- ✅ **1. Caixa**: **REFATORADO** - Múltiplas linhas com concatenação ` / `
- ✅ **2. Portas**: **REFATORADO** - Detecção Unique/Sublime simultânea
- ✅ **3. Ferragens**: **REFATORADO** - Fallback inteligente + concatenação
- ✅ **4. Painéis**: **REFATORADO** - Nomenclatura adaptativa múltiplas linhas
- ✅ **5. Porta Perfil**: **MANTIDO** - Independente de linha
- ✅ **6. Brilhart Color**: **MANTIDO** - Independente de linha  
- ✅ **7. Valor Total**: **SIMPLIFICADO** - Apenas 2 campos essenciais

## CORREÇÕES IMPLEMENTADAS

### 🚨 **1. Problema Dados Fantasma - RESOLVIDO**
- **Antes**: Sistema criava seções vazias no frontend
- **Depois**: Validação `tem_dados_reais()` antes de renderizar
- **Resultado**: Apenas seções com dados úteis aparecem

### ✨ **2. Múltiplas Linhas - IMPLEMENTADO**
- **Antes**: Detectava apenas uma linha (Unique OU Sublime)
- **Depois**: Detecta e processa AMBAS simultaneamente
- **Resultado**: "Unique / Sublime" com dados concatenados

### 🎯 **3. Valor Total Simplificado - IMPLEMENTADO**
- **Antes**: Múltiplos campos redundantes
- **Depois**: Apenas `custo_fabrica` e `valor_venda`
- **Formato**: Strings já formatadas "R$ X.XXX,XX"

## TRATAMENTOS ESPECIAIS - **ATUALIZADOS**

1. **🚨 REGRA CRÍTICA**: **JAMAIS exibir dados inexistentes** - comprometeria negócio
2. **Múltiplas linhas**: Detectar e processar Unique + Sublime simultaneamente
3. **Concatenação**: Usar ` / ` entre valores de diferentes linhas
4. **Remoção duplicatas**: `list(dict.fromkeys())` mantém ordem e remove duplicatas
5. **Validação rigorosa**: `tem_dados_reais()` antes de qualquer renderização
6. **Fallback inteligente**: Sublime usa Unique para puxadores se necessário
7. **HTML entities**: Decodificar `&gt;` para `>` usando `html.unescape()`
8. **Nomenclatura adaptativa**: Unique vs Sublime usam nomes diferentes
9. **Campos opcionais**: Seções podem não existir - omitir completamente
10. **Espaços críticos**: "Coleção Unique " tem espaço, "Coleção Sublime" não tem