"""
Schemas (estruturas de dados) para o módulo de lojas
Define como os dados de loja devem ser enviados e recebidos pela API
"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
import re


class LojaBase(BaseModel):
    """
    Campos base que toda loja tem
    APENAS NOME É OBRIGATÓRIO - todos os outros são opcionais
    """
    # Dados principais - APENAS NOME OBRIGATÓRIO
    nome: str
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    empresa_id: Optional[str] = None
    gerente_id: Optional[str] = None
    ativo: bool = True
    
    @field_validator('telefone')
    def validar_telefone(cls, v):
        """
        Valida formato do telefone
        """
        if not v or v.strip() == '':  # Se for None, string vazia ou só espaços
            return None
            
        # Remove caracteres especiais
        numeros = re.sub(r'\D', '', v)
        
        # Se não tiver números, retorna None
        if not numeros:
            return None
        
        # Verifica se tem pelo menos 10 dígitos
        if len(numeros) < 10:
            raise ValueError('Telefone deve ter pelo menos 10 dígitos')
        
        return numeros


class LojaCreate(LojaBase):
    """
    Dados necessários para criar uma nova loja
    """
    pass


class LojaUpdate(BaseModel):
    """
    Dados para atualizar uma loja (todos os campos são opcionais)
    """
    nome: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    empresa_id: Optional[str] = None
    gerente_id: Optional[str] = None
    ativo: Optional[bool] = None


class LojaResponse(LojaBase):
    """
    Dados retornados quando consultamos uma loja
    """
    id: str
    
    # Dados relacionados (vem de JOINs)
    empresa: Optional[str] = None
    gerente: Optional[str] = None
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class LojaListResponse(BaseModel):
    """
    Resposta quando listamos várias lojas
    """
    items: list[LojaResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosLoja(BaseModel):
    """
    Filtros disponíveis para buscar lojas
    """
    busca: Optional[str] = None  # Busca por nome, telefone, email
    empresa_id: Optional[str] = None
    gerente_id: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None 