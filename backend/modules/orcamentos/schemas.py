"""
Schemas - Modelos de dados para orçamentos
Define estrutura de entrada/saída da API
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


# ========== SCHEMAS DE FORMAS DE PAGAMENTO ==========

class FormaPagamentoBase(BaseModel):
    """Dados base de forma de pagamento"""
    tipo: str = Field(..., pattern="^(a-vista|boleto|cartao|financeira)$")
    valor: Decimal = Field(..., ge=0)
    valor_presente: Decimal = Field(..., ge=0)
    parcelas: int = Field(default=1, ge=1)
    dados: Optional[Dict[str, Any]] = None
    travada: bool = False


class FormaPagamentoCreate(FormaPagamentoBase):
    """Dados para criar forma de pagamento"""
    orcamento_id: UUID


class FormaPagamentoUpdate(BaseModel):
    """Dados para atualizar forma de pagamento"""
    valor: Optional[Decimal] = Field(None, ge=0)
    valor_presente: Optional[Decimal] = Field(None, ge=0)
    parcelas: Optional[int] = Field(None, ge=1)
    dados: Optional[Dict[str, Any]] = None
    travada: Optional[bool] = None


class FormaPagamentoResponse(FormaPagamentoBase):
    """Resposta com forma de pagamento completa"""
    id: UUID
    orcamento_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ========== SCHEMAS DE ORÇAMENTO ==========

class OrcamentoBase(BaseModel):
    """Dados base do orçamento"""
    numero: Optional[str] = None
    cliente_id: UUID
    loja_id: UUID
    vendedor_id: UUID
    aprovador_id: Optional[UUID] = None
    medidor_selecionado_id: Optional[UUID] = None
    montador_selecionado_id: Optional[UUID] = None
    transportadora_selecionada_id: Optional[UUID] = None
    
    # Valores
    valor_ambientes: Decimal = Field(default=Decimal('0'), ge=0)
    desconto_percentual: Decimal = Field(default=Decimal('0'), ge=0, le=100)
    valor_final: Decimal = Field(default=Decimal('0'), ge=0)
    
    # Custos - OPCIONAIS (para futura seção de Lucratividade)
    # Orçamento foca apenas na venda, campos de custo serão usados em relatórios
    custo_fabrica: Optional[Decimal] = Field(default=None, ge=0)
    comissao_vendedor: Optional[Decimal] = Field(default=None, ge=0)
    comissao_gerente: Optional[Decimal] = Field(default=None, ge=0)
    custo_medidor: Optional[Decimal] = Field(default=None, ge=0)
    custo_montador: Optional[Decimal] = Field(default=None, ge=0)
    custo_frete: Optional[Decimal] = Field(default=None, ge=0)
    margem_lucro: Optional[Decimal] = Field(default=None)
    
    # Controle
    necessita_aprovacao: bool = False
    data_aprovacao: Optional[datetime] = None
    status_id: Optional[UUID] = None
    observacoes: Optional[str] = None


class OrcamentoCreate(OrcamentoBase):
    """Dados para criar orçamento"""
    pass


class OrcamentoUpdate(BaseModel):
    """Dados para atualizar orçamento"""
    # Todos os campos são opcionais na atualização
    aprovador_id: Optional[UUID] = None
    medidor_selecionado_id: Optional[UUID] = None
    montador_selecionado_id: Optional[UUID] = None
    transportadora_selecionada_id: Optional[UUID] = None
    
    valor_ambientes: Optional[Decimal] = Field(None, ge=0)
    desconto_percentual: Optional[Decimal] = Field(None, ge=0, le=100)
    valor_final: Optional[Decimal] = Field(None, ge=0)
    
    # Custos - OPCIONAIS (para futura seção de Lucratividade)
    custo_fabrica: Optional[Decimal] = Field(None, ge=0)
    comissao_vendedor: Optional[Decimal] = Field(None, ge=0)
    comissao_gerente: Optional[Decimal] = Field(None, ge=0)
    custo_medidor: Optional[Decimal] = Field(None, ge=0)
    custo_montador: Optional[Decimal] = Field(None, ge=0)
    custo_frete: Optional[Decimal] = Field(None, ge=0)
    margem_lucro: Optional[Decimal] = Field(None)
    
    necessita_aprovacao: Optional[bool] = None
    data_aprovacao: Optional[datetime] = None
    status_id: Optional[UUID] = None
    observacoes: Optional[str] = None


class OrcamentoResponse(OrcamentoBase):
    """Resposta com orçamento completo"""
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by: Optional[UUID] = None
    
    # Relacionamentos opcionais
    formas_pagamento: Optional[List[FormaPagamentoResponse]] = []
    status: Optional[Dict[str, Any]] = None
    cliente: Optional[Dict[str, Any]] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrcamentoListResponse(BaseModel):
    """Resposta de listagem paginada"""
    items: List[OrcamentoResponse]
    total: int
    page: int
    limit: int
    pages: int