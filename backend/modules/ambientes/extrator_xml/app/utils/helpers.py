"""
Funções auxiliares para extração XML

Autor: Ricardo Borges - 2025
"""

from typing import List, Optional, Tuple, Set
from lxml import etree
import re
import locale


def detectar_linha(xml_content: str) -> Optional[str]:
    """
    Detecta automaticamente se o XML é da linha Unique ou Sublime
    
    Quando há múltiplas linhas, retorna a linha principal (com mais itens)
    
    Args:
        xml_content: Conteúdo XML como string
        
    Returns:
        "Unique" ou "Sublime" ou None se não encontrado
    """
    try:
        # Parse do XML
        tree = etree.fromstring(xml_content.encode('utf-8'))
        
        # Contar itens por família
        unique_count = len(tree.xpath('//ITEM[@FAMILY="Coleção Unique "]'))
        sublime_count = len(tree.xpath('//ITEM[@FAMILY="Coleção Sublime"]'))
        
        # Se não encontrou nenhum item, usar detecção por MODELCATEGORYINFORMATION
        if unique_count == 0 and sublime_count == 0:
            # Fallback: verificar pela existência das coleções
            has_unique = bool(tree.xpath('//MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Unique "]'))
            has_sublime = bool(tree.xpath('//MODELCATEGORYINFORMATION[@DESCRIPTION="Coleção Sublime"]'))
            
            if has_unique and not has_sublime:
                return "Unique"
            elif has_sublime and not has_unique:
                return "Sublime"
            elif has_unique and has_sublime:
                # Ambas existem mas sem itens para contar - usar primeira encontrada
                return "Unique"
            else:
                return None
        
        # Retornar a linha com mais itens
        if unique_count > sublime_count:
            return "Unique"
        elif sublime_count > unique_count:
            return "Sublime"
        elif unique_count == sublime_count and unique_count > 0:
            # Empate - usar primeira encontrada
            return "Unique"
        
        return None
        
    except Exception:
        # Em caso de erro no parse, usar método simples de busca de string
        if 'DESCRIPTION="Coleção Unique "' in xml_content:
            return "Unique"
        elif 'DESCRIPTION="Coleção Sublime"' in xml_content:
            return "Sublime"
        return None


def detectar_linhas_disponiveis(xml_content: str) -> List[str]:
    """
    Detecta quais linhas (Unique/Sublime) estão disponíveis no XML
    
    REGRA CRÍTICA: APENAS retorna linhas que EXISTEM no XML específico
    
    Args:
        xml_content: Conteúdo XML como string
        
    Returns:
        Lista com as linhas disponíveis ["Unique", "Sublime"] APENAS se existirem no XML
    """
    linhas = []
    
    # VERIFICAÇÃO RIGOROSA: só adiciona se REALMENTE existe no XML
    if 'DESCRIPTION="Coleção Unique "' in xml_content:
        linhas.append('Unique')
    
    if 'DESCRIPTION="Coleção Sublime"' in xml_content:
        linhas.append('Sublime')
    
    return linhas


def extrair_multiplos_valores(tree: etree._Element, base_xpath: str, campo_descricao: str) -> List[str]:
    """
    Extrai todos os valores únicos de um campo
    
    Args:
        tree: Árvore XML parseada
        base_xpath: XPath base da seção
        campo_descricao: Descrição do campo a buscar
        
    Returns:
        Lista de valores únicos encontrados
    """
    xpath = f"{base_xpath}//MODELINFORMATION[@DESCRIPTION='{campo_descricao}']/MODELTYPEINFORMATIONS/MODELTYPEINFORMATION/@DESCRIPTION"
    try:
        elementos = tree.xpath(xpath)
        # Remove duplicatas mantendo ordem
        valores_unicos = []
        vistos = set()
        for elem in elementos:
            if elem not in vistos:
                vistos.add(elem)
                valores_unicos.append(elem)
        return valores_unicos
    except Exception:
        return []


def extrair_multiplos_valores_se_existe(tree: etree._Element, base_xpath: str, campo_descricao: str) -> List[str]:
    """
    Extrai múltiplos valores APENAS se o campo existir no XML
    
    Args:
        tree: Árvore XML parseada
        base_xpath: XPath base da seção
        campo_descricao: Descrição do campo a buscar
        
    Returns:
        Lista de valores únicos ou lista vazia se campo não existe
    """
    try:
        return extrair_multiplos_valores(tree, base_xpath, campo_descricao)
    except Exception:
        return []  # Campo não existe, retorna lista vazia


def processar_material_cor(valores: List[str]) -> Tuple[List[str], List[str]]:
    """
    Processa valores de material\\cor separando em listas distintas
    
    Args:
        valores: Lista de valores no formato "Material\\Cor"
        
    Returns:
        Tupla (materiais, cores) com listas únicas
    """
    materiais = []
    cores = []
    
    for item in valores:
        if '\\' in item:
            partes = item.split('\\', 1)
            material = partes[0].strip()
            cor = partes[1].strip()
            
            if material and material not in materiais:
                materiais.append(material)
            if cor and cor not in cores:
                cores.append(cor)
        else:
            # Se não tem separador, assume que é só cor
            if item and item not in cores:
                cores.append(item)
    
    return materiais, cores


def formatar_valor_monetario(valor: float) -> str:
    """
    Formata valor monetário para o padrão brasileiro
    
    Args:
        valor: Valor numérico
        
    Returns:
        String formatada como "R$ 1.234,56"
    """
    try:
        # Tenta usar locale brasileiro
        locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')
    except:
        # Fallback se locale não disponível
        pass
    
    # Formata manualmente se locale não disponível
    valor_str = f"{valor:,.2f}"
    # Substitui separadores para padrão brasileiro
    valor_str = valor_str.replace(',', 'X').replace('.', ',').replace('X', '.')
    return f"R$ {valor_str}"


def validar_espessura(espessura: str) -> bool:
    """
    Valida se a espessura está nos valores permitidos
    
    Args:
        espessura: String com a espessura (ex: "18mm")
        
    Returns:
        True se válida, False caso contrário
    """
    espessuras_validas = ["6mm", "15mm", "18mm", "20mm", "25mm", "42mm"]
    return espessura in espessuras_validas


def limpar_tipo_dobradica(tipo: str) -> str:
    """
    Limpa e extrai apenas a parte relevante do tipo de dobradiça
    
    Args:
        tipo: String com o tipo completo
        
    Returns:
        Parte final após último '\\'
    """
    if '\\' in tipo:
        return tipo.split('\\')[-1].strip()
    return tipo.strip()


def extrair_espessura_vidro(descricao: str) -> Optional[str]:
    """
    Extrai espessura do vidro de uma descrição
    
    Args:
        descricao: String como "Vidro 4mm"
        
    Returns:
        Espessura encontrada (ex: "4mm") ou None
    """
    match = re.search(r'(\d+mm)', descricao)
    return match.group(1) if match else None


def mapear_tipo_corredica(tipo: str) -> str:
    """
    Mapeia tipos de corrediça para nomes específicos
    
    Args:
        tipo: Tipo original (ex: "s/ Amortecimento")
        
    Returns:
        Nome mapeado (ex: "Telescópica s/ Amortecimento")
    """
    mapeamento = {
        's/ Amortecimento': 'Telescópica s/ Amortecimento',
        'c/ Amortecimento': 'Oculta c/ Amortecimento'
    }
    return mapeamento.get(tipo, tipo)


def detectar_espessura_brilhart(tree: etree._Element) -> Optional[str]:
    """
    Detecta espessura automaticamente dos itens filhos do Brilhart Color
    
    Args:
        tree: Árvore XML parseada
        
    Returns:
        Espessura detectada ou None se não encontrada
    """
    # Buscar por padrões de espessura nos IDs ou descrições
    brilhart_xpath = "//MODELCATEGORYINFORMATION[@DESCRIPTION='Brilhart Color']"
    
    try:
        elementos = tree.xpath(f"{brilhart_xpath}//@*")
        espessuras_encontradas = []
        
        for attr in elementos:
            matches = re.findall(r'(\d+mm)', str(attr))
            espessuras_encontradas.extend(matches)
        
        # Filtrar espessuras válidas
        espessuras_validas = ["15mm", "18mm", "20mm", "25mm"]
        for esp in set(espessuras_encontradas):
            if esp in espessuras_validas:
                return esp
                
    except Exception:
        pass
    
    return None  # Retornar None se não encontrar, não inventar valor


def extrair_espessura_paineis_sublime(tree: etree._Element, colecao_xpath: str) -> List[str]:
    """
    Extrai espessura de painéis Sublime via DESCRI REFERENCE
    
    Args:
        tree: Árvore XML parseada
        colecao_xpath: XPath da coleção Sublime
        
    Returns:
        Lista com espessuras encontradas (ex: ["15mm"])
    """
    try:
        # Buscar referências DESCRI dentro da coleção de painéis Sublime
        xpath_descri = f"{colecao_xpath}//MODELINFORMATION[@DESCRIPTION='Painéis']//DESCRI/@REFERENCE"
        elementos = tree.xpath(xpath_descri)
        
        espessuras = []
        for elem in elementos:
            # Verificar se é uma espessura válida (formato: "15mm", "18mm", etc.)
            if re.match(r'^\d+mm$', elem):
                if elem not in espessuras:
                    espessuras.append(elem)
        
        return espessuras
        
    except Exception:
        return [] 