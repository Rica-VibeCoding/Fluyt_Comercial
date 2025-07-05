"""
Schemas para configurações de loja
Define estruturas de dados para configurações operacionais por loja
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID


class ConfigLojaBase(BaseModel):
    """Base para configurações de loja"""
    # Limites de desconto (percentuais)
    discount_limit_vendor: float = Field(
        ..., 
        ge=0, 
        le=100,
        description="Limite de desconto para vendedor (%)"
    )
    discount_limit_manager: float = Field(
        ..., 
        ge=0, 
        le=100,
        description="Limite de desconto para gerente (%)"
    )
    discount_limit_admin_master: float = Field(
        ..., 
        ge=0, 
        le=100,
        description="Limite de desconto para admin master (%)"
    )
    
    # Valores operacionais
    default_measurement_value: float = Field(
        ..., 
        gt=0,
        description="Valor padrão para medição (R$)"
    )
    freight_percentage: float = Field(
        ..., 
        ge=0, 
        le=100,
        description="Percentual de frete sobre valor de venda (%)"
    )
    assembly_percentage: float = Field(
        ..., 
        ge=0, 
        le=100,
        description="Percentual de montagem (%)"
    )
    executive_project_percentage: float = Field(
        ..., 
        ge=0, 
        le=100,
        description="Percentual de projeto executivo (%)"
    )
    
    # Configurações de numeração
    initial_number: int = Field(
        ..., 
        gt=0,
        description="Número inicial para orçamentos"
    )
    number_format: str = Field(
        ...,
        max_length=50,
        description="Formato da numeração (ex: YYYY-NNNNNN)"
    )
    number_prefix: str = Field(
        ...,
        max_length=10,
        description="Prefixo para numeração (ex: ORC)"
    )
    
    model_config = ConfigDict(from_attributes=True)


class ConfigLojaCreate(ConfigLojaBase):
    """Schema para criação de configuração"""
    store_id: UUID = Field(..., description="ID da loja")


class ConfigLojaUpdate(BaseModel):
    """Schema para atualização parcial de configuração"""
    # Todos os campos são opcionais para update parcial
    discount_limit_vendor: Optional[float] = Field(None, ge=0, le=100)
    discount_limit_manager: Optional[float] = Field(None, ge=0, le=100)
    discount_limit_admin_master: Optional[float] = Field(None, ge=0, le=100)
    default_measurement_value: Optional[float] = Field(None, gt=0)
    freight_percentage: Optional[float] = Field(None, ge=0, le=100)
    assembly_percentage: Optional[float] = Field(None, ge=0, le=100)
    executive_project_percentage: Optional[float] = Field(None, ge=0, le=100)
    initial_number: Optional[int] = Field(None, gt=0)
    number_format: Optional[str] = Field(None, max_length=50)
    number_prefix: Optional[str] = Field(None, max_length=10)
    
    model_config = ConfigDict(from_attributes=True)


class ConfigLojaResponse(ConfigLojaBase):
    """Schema de resposta com dados completos"""
    id: UUID
    store_id: UUID
    store_name: Optional[str] = None  # Preenchido via JOIN
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ConfigLojaValidation(BaseModel):
    """Schema para validações customizadas"""
    @staticmethod
    def validar_hierarquia_descontos(
        vendor: float, 
        manager: float, 
        admin_master: float
    ) -> list[str]:
        """Valida se a hierarquia de descontos está correta"""
        erros = []
        
        if vendor > manager:
            erros.append("Limite do vendedor não pode ser maior que do gerente")
        
        if manager > admin_master:
            erros.append("Limite do gerente não pode ser maior que do admin master")
            
        return erros