"""
Schemas (estruturas de dados) para o módulo de ambientes
Define como os dados de ambiente devem ser enviados e recebidos pela API
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, field_validator
from decimal import Decimal


class AmbienteBase(BaseModel):
    """
    Campos base que todo ambiente tem
    """
    # Dados principais
    cliente_id: str  # UUID do cliente (obrigatório)
    nome: str  # Nome do ambiente (obrigatório)
    valor_custo_fabrica: Optional[Decimal] = None
    valor_venda: Optional[Decimal] = None
    data_importacao: Optional[str] = None  # Data em formato ISO string (YYYY-MM-DD)
    hora_importacao: Optional[str] = None  # Hora em formato ISO string (HH:MM:SS)
    origem: str = "manual"  # 'xml' ou 'manual'
    
    @field_validator('origem')
    def validar_origem(cls, v):
        """
        Valida se origem é 'xml' ou 'manual'
        """
        if v not in ['xml', 'manual']:
            raise ValueError("Origem deve ser 'xml' ou 'manual'")
        return v
    
    @field_validator('valor_custo_fabrica', 'valor_venda')
    def validar_valores_monetarios(cls, v):
        """
        Valida valores monetários (devem ser positivos se informados)
        """
        if v is not None and v < 0:
            raise ValueError("Valores monetários devem ser positivos")
        return v


class AmbienteCreate(AmbienteBase):
    """
    Dados necessários para criar um novo ambiente
    """
    pass


class AmbienteUpdate(BaseModel):
    """
    Dados para atualizar um ambiente (todos os campos são opcionais)
    """
    cliente_id: Optional[str] = None
    nome: Optional[str] = None
    valor_custo_fabrica: Optional[Decimal] = None
    valor_venda: Optional[Decimal] = None
    data_importacao: Optional[str] = None  # Data em formato ISO string (YYYY-MM-DD)
    hora_importacao: Optional[str] = None  # Hora em formato ISO string (HH:MM:SS)
    origem: Optional[str] = None
    
    @field_validator('origem')
    def validar_origem(cls, v):
        """
        Valida se origem é 'xml' ou 'manual'
        """
        if v is not None and v not in ['xml', 'manual']:
            raise ValueError("Origem deve ser 'xml' ou 'manual'")
        return v


class AmbienteResponse(AmbienteBase):
    """
    Dados retornados quando consultamos um ambiente
    """
    id: str
    
    # Dados relacionados (vem de JOINs)
    cliente_nome: Optional[str] = None
    
    # Materiais opcionais (apenas se solicitado com ?include=materiais)
    materiais: Optional[Dict[str, Any]] = None
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v) if v is not None else None
        }


class AmbienteMaterialCreate(BaseModel):
    """
    Dados para criar/atualizar materiais de um ambiente
    """
    ambiente_id: str  # UUID do ambiente
    materiais_json: Dict[str, Any]  # Dados dos materiais em JSON
    xml_hash: Optional[str] = None  # Hash do XML para evitar duplicatas


class AmbienteMaterialResponse(BaseModel):
    """
    Resposta dos materiais de um ambiente
    """
    id: str
    ambiente_id: str
    materiais_json: Dict[str, Any]
    xml_hash: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            Decimal: lambda v: float(v) if v is not None else None
        }


class AmbienteListResponse(BaseModel):
    """
    Resposta quando listamos vários ambientes
    """
    items: list[AmbienteResponse]
    total: int
    page: int
    limit: int
    pages: int


class AmbienteFiltros(BaseModel):
    """
    Filtros disponíveis para buscar ambientes
    """
    busca: Optional[str] = None  # Busca por nome do ambiente
    cliente_id: Optional[str] = None  # Filtrar por cliente específico
    origem: Optional[str] = None  # Filtrar por origem ('xml' ou 'manual')
    data_inicio: Optional[datetime] = None  # Período de importação - início
    data_fim: Optional[datetime] = None  # Período de importação - fim
    valor_min: Optional[Decimal] = None  # Valor mínimo de venda
    valor_max: Optional[Decimal] = None  # Valor máximo de venda
    
    @field_validator('origem')
    def validar_origem(cls, v):
        """
        Valida se origem é 'xml' ou 'manual'
        """
        if v is not None and v not in ['xml', 'manual']:
            raise ValueError("Origem deve ser 'xml' ou 'manual'")
        return v 