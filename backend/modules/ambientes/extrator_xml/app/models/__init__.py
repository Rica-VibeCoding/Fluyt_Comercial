"""
Modelos Pydantic para validação e serialização
"""

from .models import (
    LinhaEnum,
    SectionEnum,
    CaixaModel,
    PainelModel,
    PortaModel,
    FerragemModel,
    PortaPerfilModel,
    BrilhartColorModel,
    ValorTotalModel,
    MetadataModel,
    ExtractionResult,
    ExtractionRequest,
    ExtractionFileRequest,
    ValidationResult
)

__all__ = [
    "LinhaEnum",
    "SectionEnum",
    "CaixaModel",
    "PainelModel",
    "PortaModel",
    "FerragemModel",
    "PortaPerfilModel",
    "BrilhartColorModel",
    "ValorTotalModel",
    "MetadataModel",
    "ExtractionResult",
    "ExtractionRequest",
    "ExtractionFileRequest",
    "ValidationResult"
] 