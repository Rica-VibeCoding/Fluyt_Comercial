"""
Funções unificadas para conversão monetária PT-BR
Centraliza toda lógica de conversão monetária do backend
"""

from decimal import Decimal
from typing import Union


def converter_valor_monetario(valor: Union[str, float, Decimal]) -> Decimal:
    """
    Converte string monetária BR para Decimal
    Aceita formatos: "R$ 1.234,56", "1234.56", "1.234,56", "1234,56"
    
    Args:
        valor: String com valor monetário ou número
        
    Returns:
        Decimal com o valor convertido
    """
    # Se já é Decimal, retorna
    if isinstance(valor, Decimal):
        return valor
        
    # Se é float ou int, converte para Decimal
    if isinstance(valor, (float, int)):
        return Decimal(str(valor))
    
    # Remove espaços e símbolo de moeda
    valor_limpo = str(valor).strip().replace('R$', '').strip()
    
    # Se está vazio, retorna 0
    if not valor_limpo:
        return Decimal('0')
    
    # Detecta formato: se tem vírgula após ponto = formato BR (1.234,56)
    ultimo_ponto = valor_limpo.rfind('.')
    ultima_virgula = valor_limpo.rfind(',')
    
    if ultima_virgula > ultimo_ponto:
        # Formato BR: remove pontos e substitui vírgula por ponto
        valor_convertido = valor_limpo.replace('.', '').replace(',', '.')
    else:
        # Formato US ou sem separadores: remove vírgulas
        valor_convertido = valor_limpo.replace(',', '')
    
    try:
        return Decimal(valor_convertido)
    except:
        return Decimal('0')


def formatar_valor_monetario(valor: Union[Decimal, float, int]) -> str:
    """
    Formata número como moeda BR
    
    Args:
        valor: Número a ser formatado
        
    Returns:
        String formatada como "R$ 1.234,56"
    """
    if isinstance(valor, Decimal):
        valor_float = float(valor)
    else:
        valor_float = float(valor)
    
    # Formata com 2 casas decimais
    valor_str = f"{valor_float:,.2f}"
    
    # Converte formato US para BR
    valor_br = valor_str.replace(',', 'X').replace('.', ',').replace('X', '.')
    
    return f"R$ {valor_br}"