"""
Schemas - Modelos de dados para status de orçamento
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class StatusOrcamentoBase(BaseModel):
    """Dados base de status"""
    nome: str = Field(..., max_length=50)
    descricao: Optional[str] = None
    cor: Optional[str] = Field(None, max_length=7, pattern="^#[0-9A-Fa-f]{6}$")
    ordem: int = Field(default=0)
    ativo: bool = Field(default=True)


class StatusOrcamentoCreate(StatusOrcamentoBase):
    """Dados para criar status"""
    pass


class StatusOrcamentoUpdate(BaseModel):
    """Dados para atualizar status"""
    nome: Optional[str] = Field(None, max_length=50)
    descricao: Optional[str] = None
    cor: Optional[str] = Field(None, max_length=7, pattern="^#[0-9A-Fa-f]{6}$")
    ordem: Optional[int] = None
    ativo: Optional[bool] = None


class StatusOrcamentoResponse(StatusOrcamentoBase):
    """Resposta com status completo"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class StatusOrcamentoListResponse(BaseModel):
    """Resposta de listagem"""
    items: list[StatusOrcamentoResponse]
    total: int