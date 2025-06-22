"""
Schemas (estruturas de dados) para o módulo de empresas
Define como os dados de empresa devem ser enviados e recebidos pela API
"""
from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, field_validator
import re


class EmpresaBase(BaseModel):
    """
    Campos base que toda empresa tem
    APENAS NOME É OBRIGATÓRIO - todos os outros são opcionais
    """
    # Dados principais - APENAS NOME OBRIGATÓRIO
    nome: str
    cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    ativo: bool = True
    
    @field_validator('cnpj')
    def validar_cnpj(cls, v):
        """
        Valida se o CNPJ tem formato correto
        Remove caracteres especiais e verifica se tem 14 dígitos
        """
        if not v or v.strip() == '':  # Se for None, string vazia ou só espaços
            return None
            
        # Remove tudo que não for número
        numeros = re.sub(r'\D', '', v)
        
        # Se não tiver números, retorna None
        if not numeros:
            return None
        
        # CNPJ deve ter 14 dígitos
        if len(numeros) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        
        return numeros
    
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
    
    @field_validator('email')
    def validar_email(cls, v):
        """
        Valida email - aceita string vazia e valida formato se fornecido
        """
        if not v or v.strip() == '':
            return None
        
        # Validação básica de email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v.strip()):
            raise ValueError('Email inválido')
        
        return v.strip()
    
    @field_validator('endereco')
    def validar_endereco(cls, v):
        """
        Valida endereço - apenas limpa string vazia
        """
        if not v or v.strip() == '':
            return None
        return v.strip()


class EmpresaCreate(EmpresaBase):
    """
    Dados necessários para criar uma nova empresa
    """
    pass


class EmpresaUpdate(BaseModel):
    """
    Dados para atualizar uma empresa (todos os campos são opcionais)
    """
    nome: Optional[str] = None
    cnpj: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    ativo: Optional[bool] = None
    
    # Aplicar os mesmos validadores
    @field_validator('cnpj')
    def validar_cnpj(cls, v):
        if not v or v.strip() == '':
            return None
        numeros = re.sub(r'\D', '', v)
        if not numeros:
            return None
        if len(numeros) != 14:
            raise ValueError('CNPJ deve ter 14 dígitos')
        return numeros
    
    @field_validator('telefone')
    def validar_telefone(cls, v):
        if not v or v.strip() == '':
            return None
        numeros = re.sub(r'\D', '', v)
        if not numeros:
            return None
        if len(numeros) < 10:
            raise ValueError('Telefone deve ter pelo menos 10 dígitos')
        return numeros
    
    @field_validator('email')
    def validar_email(cls, v):
        if not v or v.strip() == '':
            return None
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v.strip()):
            raise ValueError('Email inválido')
        return v.strip()
    
    @field_validator('endereco')
    def validar_endereco(cls, v):
        if not v or v.strip() == '':
            return None
        return v.strip()


class EmpresaResponse(EmpresaBase):
    """
    Dados retornados quando consultamos uma empresa
    """
    id: str
    
    # Campos calculados
    total_lojas: Optional[int] = 0
    funcionarios: Optional[int] = 0
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class EmpresaListResponse(BaseModel):
    """
    Resposta quando listamos várias empresas
    """
    items: list[EmpresaResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosEmpresa(BaseModel):
    """
    Filtros disponíveis para buscar empresas
    """
    busca: Optional[str] = None  # Busca por nome, CNPJ, email
    ativo: Optional[bool] = None  # Filtrar por status ativo/inativo
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None 