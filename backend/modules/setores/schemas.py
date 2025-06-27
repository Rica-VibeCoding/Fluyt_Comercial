"""
Schemas (estruturas de dados) para o módulo de setores
Define como os dados de setor devem ser enviados e recebidos pela API
"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, field_validator


class SetorBase(BaseModel):
    """
    Campos base que todo setor tem
    APENAS NOME É OBRIGATÓRIO - descrição é opcional
    """
    # Dados principais - APENAS NOME OBRIGATÓRIO
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True
    
    @field_validator('nome')
    def validar_nome(cls, v):
        """
        Valida se o nome do setor não está vazio
        """
        if not v or v.strip() == '':
            raise ValueError('Nome do setor é obrigatório')
        
        # Remove espaços extras no início e fim
        return v.strip()


class SetorCreate(SetorBase):
    """
    Dados necessários para criar um novo setor
    """
    pass


class SetorUpdate(BaseModel):
    """
    Dados para atualizar um setor (todos os campos são opcionais)
    """
    nome: Optional[str] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None
    
    @field_validator('nome')
    def validar_nome_update(cls, v):
        """
        Valida nome apenas se foi fornecido
        """
        if v is not None and (not v or v.strip() == ''):
            raise ValueError('Nome do setor não pode estar vazio')
        
        if v is not None:
            return v.strip()
        
        return v


class SetorResponse(SetorBase):
    """
    Dados retornados quando consultamos um setor
    """
    id: str
    
    # Dados relacionados (contagem de funcionários)
    total_funcionarios: int = 0
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SetorListResponse(BaseModel):
    """
    Resposta quando listamos vários setores
    """
    items: list[SetorResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosSetor(BaseModel):
    """
    Filtros disponíveis para buscar setores
    """
    busca: Optional[str] = None  # Busca por nome ou descrição
    ativo: Optional[bool] = None  # Filtrar por status ativo/inativo
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None 