"""
Utilitários para extração XML
"""

from .helpers import (
    detectar_linha,
    detectar_linhas_disponiveis,
    extrair_multiplos_valores,
    extrair_multiplos_valores_se_existe,
    processar_material_cor,
    formatar_valor_monetario,
    validar_espessura,
    limpar_tipo_dobradica,
    extrair_espessura_vidro,
    mapear_tipo_corredica,
    detectar_espessura_brilhart
)

__all__ = [
    "detectar_linha",
    "detectar_linhas_disponiveis",
    "extrair_multiplos_valores",
    "extrair_multiplos_valores_se_existe",
    "processar_material_cor",
    "formatar_valor_monetario",
    "validar_espessura",
    "limpar_tipo_dobradica",
    "extrair_espessura_vidro",
    "mapear_tipo_corredica",
    "detectar_espessura_brilhart"
] 