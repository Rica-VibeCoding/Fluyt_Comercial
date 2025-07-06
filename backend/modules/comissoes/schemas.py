"""
Schemas para o módulo de Regras de Comissão
Define estruturas de dados alinhadas com tabela c_config_regras_comissao_faixa
"""

from typing import Optional, Literal
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, field_validator


class RegraComissaoBase(BaseModel):
    """Campos base para regras de comissão"""
    loja_id: UUID
    tipo_comissao: Literal['VENDEDOR', 'GERENTE', 'SUPERVISOR']
    valor_minimo: float
    valor_maximo: Optional[float] = None
    percentual: float
    ordem: int
    ativo: bool = True
    descricao: Optional[str] = None
    
    @field_validator('valor_minimo')
    def validar_valor_minimo(cls, v):
        if v < 0:
            raise ValueError('Valor mínimo deve ser maior ou igual a zero')
        return v
    
    @field_validator('valor_maximo')
    def validar_valor_maximo(cls, v, values):
        if v is not None and 'valor_minimo' in values and v <= values['valor_minimo']:
            raise ValueError('Valor máximo deve ser maior que valor mínimo')
        return v
    
    @field_validator('percentual')
    def validar_percentual(cls, v):
        if v <= 0 or v > 100:
            raise ValueError('Percentual deve estar entre 0.01% e 100%')
        return v


class RegraComissaoCreate(RegraComissaoBase):
    """Dados para criar nova regra de comissão"""
    pass


class RegraComissaoUpdate(BaseModel):
    """Dados para atualizar regra de comissão (todos opcionais)"""
    loja_id: Optional[UUID] = None
    tipo_comissao: Optional[Literal['VENDEDOR', 'GERENTE', 'SUPERVISOR']] = None
    valor_minimo: Optional[float] = None
    valor_maximo: Optional[float] = None
    percentual: Optional[float] = None
    ordem: Optional[int] = None
    ativo: Optional[bool] = None
    descricao: Optional[str] = None
    
    @field_validator('valor_minimo')
    def validar_valor_minimo(cls, v):
        if v is not None and v < 0:
            raise ValueError('Valor mínimo deve ser maior ou igual a zero')
        return v
    
    @field_validator('percentual')
    def validar_percentual(cls, v):
        if v is not None and (v <= 0 or v > 100):
            raise ValueError('Percentual deve estar entre 0.01% e 100%')
        return v


class RegraComissaoResponse(BaseModel):
    """Dados retornados quando consultamos uma regra"""
    id: str
    loja_id: str
    tipo_comissao: str
    valor_minimo: float
    valor_maximo: Optional[float]
    percentual: float
    ordem: int
    ativo: bool
    descricao: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Campos relacionados (via JOIN)
    loja_nome: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class RegraComissaoListResponse(BaseModel):
    """Resposta quando listamos regras de comissão"""
    items: list[RegraComissaoResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosRegraComissao(BaseModel):
    """Filtros para buscar regras de comissão"""
    loja_id: Optional[UUID] = None
    tipo_comissao: Optional[Literal['VENDEDOR', 'GERENTE', 'SUPERVISOR']] = None
    ativo: Optional[bool] = None
    busca: Optional[str] = None
    page: Optional[int] = 1
    limit: Optional[int] = 20


class CalculoComissaoRequest(BaseModel):
    """Request para calcular comissão"""
    valor: float
    tipo_comissao: Literal['VENDEDOR', 'GERENTE', 'SUPERVISOR']
    loja_id: UUID
    
    @field_validator('valor')
    def validar_valor(cls, v):
        if v <= 0:
            raise ValueError('Valor deve ser maior que zero')
        return v


class CalculoComissaoResponse(BaseModel):
    """Response com resultado do cálculo de comissão"""
    valor_venda: float
    percentual_aplicado: float
    valor_comissao: float
    regra_id: str
    regra_descricao: Optional[str] = None