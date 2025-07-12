"""
Schemas Pydantic para Procedências
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, field_validator
from uuid import UUID


class ProcedenciaBase(BaseModel):
    """Schema base para procedência"""
    nome: str = Field(..., min_length=1, max_length=100, description="Nome da procedência")
    descricao: Optional[str] = Field(None, max_length=255, description="Descrição da procedência")
    ativo: bool = Field(True, description="Se a procedência está ativa")


class ProcedenciaCreate(ProcedenciaBase):
    """Schema para criação de procedência"""
    pass


class ProcedenciaUpdate(BaseModel):
    """Schema para atualização de procedência"""
    nome: Optional[str] = Field(None, min_length=1, max_length=100)
    descricao: Optional[str] = Field(None, max_length=255)
    ativo: Optional[bool] = None


class ProcedenciaResponse(ProcedenciaBase):
    """Schema de resposta para procedência"""
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None  # Campo opcional para compatibilidade

    class Config:
        from_attributes = True
        
    @field_validator('ativo', mode='before')
    @classmethod
    def parse_ativo(cls, v):
        """Converte string 'true'/'false' para boolean"""
        if isinstance(v, str):
            return v.lower() == 'true'
        return bool(v)


class ProcedenciaListResponse(BaseModel):
    """Schema de resposta para lista de procedências"""
    items: List[ProcedenciaResponse]
    total: int