"""
Modelos Pydantic para validação e serialização

Autor: Ricardo Borges - 2025
"""

from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field, validator
from enum import Enum


class LinhaEnum(str, Enum):
    """Linhas disponíveis no Promob"""
    UNIQUE = "Unique"
    SUBLIME = "Sublime"


class SectionEnum(str, Enum):
    """Seções disponíveis para extração"""
    CAIXA = "caixa"
    PAINEIS = "paineis"
    PORTAS = "portas"
    FERRAGENS = "ferragens"
    PORTA_PERFIL = "porta_perfil"
    BRILHART_COLOR = "brilhart_color"
    VALOR_TOTAL = "valor_total"


class CaixaModel(BaseModel):
    """Modelo para dados da Caixa - REFATORADO para múltiplas linhas"""
    linha: Optional[str] = None  # Ex: "Unique / Sublime"
    espessura: Optional[str] = None  # Ex: "18mm / 15mm"
    espessura_prateleiras: Optional[str] = None
    material: Optional[str] = None  # Ex: "MDF / MDP"
    cor: Optional[str] = None  # Ex: "Branco Polar / Itapuã"

    class Config:
        json_schema_extra = {
            "example": {
                "linha": "Unique / Sublime",
                "espessura": "18mm / 15mm",
                "espessura_prateleiras": "18mm",
                "material": "MDF / MDP", 
                "cor": "Branco Polar / Itapuã"
            }
        }


class PainelModel(BaseModel):
    """Modelo para dados dos Painéis - REFATORADO para múltiplas linhas"""
    material: Optional[str] = None  # Ex: "MDF / MDP"
    espessura: Optional[str] = None  # Ex: "18mm / 15mm"
    cor: Optional[str] = None  # Ex: "Carvalho Berlin / Itapuã"

    class Config:
        json_schema_extra = {
            "example": {
                "material": "MDF / MDP",
                "espessura": "18mm / 15mm",
                "cor": "Carvalho Berlin / Itapuã"
            }
        }


class PortaModel(BaseModel):
    """Modelo para dados das Portas - REFATORADO para múltiplas linhas"""
    espessura: Optional[str] = None  # Ex: "18mm / 15mm" 
    material: Optional[str] = None  # Ex: "MDF / MDP"
    modelo: Optional[str] = None  # Ex: "Frontal Milano / Frontal"
    cor: Optional[str] = None  # Ex: "Branco Polar / Itapuã"
    puxadores: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "espessura": "18mm / 15mm",
                "material": "MDF / MDP",
                "modelo": "Frontal Milano / Frontal",
                "cor": "Branco Polar / Itapuã",
                "puxadores": "Sem Puxador"
            }
        }


class FerragemModel(BaseModel):
    """Modelo para dados das Ferragens - REFATORADO para múltiplas linhas"""
    puxadores: Optional[str] = None
    dobradicas: Optional[str] = None  # Ex: "Movelmar c/ Amortecimento / Soft c/ amortecimento"
    corredicas: Optional[str] = None  # Ex: "Movelmar Telescópica c/amortecedor"

    class Config:
        json_schema_extra = {
            "example": {
                "puxadores": "128mm > 5774 - Pux. Punata",
                "dobradicas": "Movelmar c/ Amortecimento / Soft c/ amortecimento",
                "corredicas": "Movelmar Telescópica c/amortecedor"
            }
        }


class PortaPerfilModel(BaseModel):
    """Modelo para dados da Porta Perfil"""
    perfil: Optional[str] = None
    vidro: Optional[str] = None
    puxador: Optional[str] = None
    dobradicas: Optional[str] = None  # Opcional, omitir se "Sem Dobradiças"

    class Config:
        json_schema_extra = {
            "example": {
                "perfil": "1830 / Anodizado",
                "vidro": "Argentato / 4mm",
                "puxador": "2007"
            }
        }


class BrilhartColorModel(BaseModel):
    """Modelo para dados do Brilhart Color"""
    espessura: Optional[str] = None
    cor: Optional[str] = None
    perfil: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "espessura": "18mm",
                "cor": "Fosco(2 Face)> Alba",
                "perfil": "Anodizado> Inox Escovado"
            }
        }


class ValorTotalModel(BaseModel):
    """Modelo para dados de Valor Total - MÁXIMO SIMPLIFICADO"""
    # Custo de fábrica formatado
    custo_fabrica: Optional[str] = None
    
    # Valor de venda formatado  
    valor_venda: Optional[str] = None
    
    origem: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "custo_fabrica": "R$ 1.644,38", 
                "valor_venda": "R$ 14.799,42",
                "origem": "totalprices_root"
            }
        }


class MetadataModel(BaseModel):
    """Metadados da extração - REFATORADO para múltiplas linhas"""
    linha: Optional[str] = None  # Ex: "Unique / Sublime"
    sections_extracted: Optional[List[str]] = None
    warnings: Optional[List[str]] = None

    class Config:
        json_schema_extra = {
            "example": {
                "linha": "Unique / Sublime",
                "sections_extracted": ["caixa", "portas", "ferragens"],
                "warnings": []
            }
        }


class ExtractionResult(BaseModel):
    """Resultado da extração XML - REFATORADO para múltiplas linhas"""
    success: bool
    linha_detectada: Optional[str] = None  # Ex: "Unique / Sublime"
    nome_ambiente: Optional[str] = None  # Ex: "Projeto - PUXADORES"
    caixa: Optional[CaixaModel] = None
    paineis: Optional[PainelModel] = None
    portas: Optional[PortaModel] = None
    ferragens: Optional[FerragemModel] = None
    porta_perfil: Optional[PortaPerfilModel] = None
    brilhart_color: Optional[BrilhartColorModel] = None
    valor_total: Optional[ValorTotalModel] = None
    metadata: Optional[MetadataModel] = None
    error: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "linha_detectada": "Unique / Sublime",
                "nome_ambiente": "PUXADORES",
                "caixa": {
                    "linha": "Unique / Sublime",
                    "espessura": "18mm / 15mm",
                    "material": "MDF / MDP",
                    "cor": "Branco Polar / Itapuã"
                }
            }
        }


class ExtractionRequest(BaseModel):
    """Request para extração via string XML"""
    xml_content: str = Field(..., description="Conteúdo XML como string")
    extract_sections: Optional[List[SectionEnum]] = Field(
        None, 
        description="Seções específicas para extrair. Se None, extrai todas."
    )

    @validator('xml_content')
    def validate_xml_content(cls, v):
        if not v or not v.strip():
            raise ValueError("XML content cannot be empty")
        return v


class ExtractionFileRequest(BaseModel):
    """Request para extração via arquivo"""
    sections: Optional[List[str]] = Field(
        None,
        description="Lista de seções para extrair"
    )


class ValidationResult(BaseModel):
    """Resultado da validação do XML"""
    valid: bool
    linha_detectada: Optional[LinhaEnum] = None
    available_sections: List[str] = Field(default_factory=list)
    file_size_kb: Optional[float] = None
    errors: List[str] = Field(default_factory=list)

    class Config:
        json_schema_extra = {
            "example": {
                "valid": True,
                "linha_detectada": "Unique",
                "available_sections": ["caixa", "paineis", "portas", "ferragens"],
                "file_size_kb": 143.5,
                "errors": []
            }
        } 