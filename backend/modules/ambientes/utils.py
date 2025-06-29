"""
Funções utilitárias para o módulo de ambientes
"""
import logging
from typing import Optional

logger = logging.getLogger(__name__)


def converter_valor_monetario(valor_str: Optional[str]) -> float:
    """Converte string de valor monetário para float de forma segura"""
    if not valor_str:
        return 0.0
    
    valor_limpo = str(valor_str).strip().upper()
    
    # Casos especiais que retornam 0
    if valor_limpo in ['N/A', 'NA', '-', 'NULL', 'NONE', '']:
        return 0.0
    
    try:
        # Remover símbolos de moeda
        for moeda in ['R$', 'RS', 'BRL', 'USD', '$', '€', '£', '¥']:
            valor_limpo = valor_limpo.replace(moeda, '')
        
        valor_limpo = valor_limpo.strip()
        
        # Detectar formato BR vs US
        if ',' in valor_limpo and '.' in valor_limpo:
            if valor_limpo.rindex(',') > valor_limpo.rindex('.'):
                valor_limpo = valor_limpo.replace('.', '').replace(',', '.')
            else:
                valor_limpo = valor_limpo.replace(',', '')
        elif ',' in valor_limpo:
            valor_limpo = valor_limpo.replace(',', '.')
        
        valor_final = float(valor_limpo)
        
        # Validações
        if valor_final < 0 or valor_final > 10_000_000:
            logger.warning(f"Valor monetário inválido: {valor_str}")
            return 0.0
        
        return round(valor_final, 2)
        
    except (ValueError, AttributeError) as e:
        logger.warning(f"Erro ao converter valor monetário '{valor_str}': {e}")
        return 0.0