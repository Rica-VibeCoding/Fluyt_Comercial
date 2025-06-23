"""
Schemas (estruturas de dados) para o módulo de equipe
Define como os dados de funcionário devem ser enviados e recebidos pela API
"""
from typing import Optional, Literal
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
import re


class FuncionarioBase(BaseModel):
    """
    Campos base que todo funcionário tem
    APENAS NOME É OBRIGATÓRIO - todos os outros são opcionais
    """
    # Dados principais - APENAS NOME OBRIGATÓRIO
    nome: str
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    perfil: Optional[Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']] = None
    nivel_acesso: Optional[Literal['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN']] = None
    loja_id: Optional[UUID] = None
    setor_id: Optional[UUID] = None
    ativo: bool = True
    
    # Campos financeiros - todos opcionais
    salario: Optional[float] = None
    data_admissao: Optional[date] = None
    limite_desconto: Optional[float] = None
    comissao_percentual_vendedor: Optional[float] = None
    comissao_percentual_gerente: Optional[float] = None
    tem_minimo_garantido: Optional[bool] = False
    valor_minimo_garantido: Optional[float] = None
    valor_medicao: Optional[float] = None
    override_comissao: Optional[float] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,  # CRÍTICO: Converte UUID para string
            date: lambda v: v.isoformat() if v else None
        }
    
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
    
    @field_validator('telefone')
    def validar_telefone(cls, v):
        """
        Valida formato do telefone
        """
        if not v or v.strip() == '':
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


class FuncionarioCreate(FuncionarioBase):
    """
    Dados necessários para criar um novo funcionário
    """
    pass


class FuncionarioUpdate(BaseModel):
    """
    Dados para atualizar um funcionário (todos os campos são opcionais)
    """
    nome: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    perfil: Optional[Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']] = None
    nivel_acesso: Optional[Literal['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN']] = None
    loja_id: Optional[UUID] = None
    setor_id: Optional[UUID] = None
    ativo: Optional[bool] = None
    
    # Campos financeiros
    salario: Optional[float] = None
    data_admissao: Optional[date] = None
    limite_desconto: Optional[float] = None
    comissao_percentual_vendedor: Optional[float] = None
    comissao_percentual_gerente: Optional[float] = None
    tem_minimo_garantido: Optional[bool] = None
    valor_minimo_garantido: Optional[float] = None
    valor_medicao: Optional[float] = None
    override_comissao: Optional[float] = None
    
    class Config:
        json_encoders = {
            UUID: str,
            date: lambda v: v.isoformat() if v else None
        }
    
    # Aplicar os mesmos validadores
    @field_validator('email')
    def validar_email(cls, v):
        if not v or v.strip() == '':
            return None
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v.strip()):
            raise ValueError('Email inválido')
        return v.strip()
    
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


class FuncionarioResponse(FuncionarioBase):
    """
    Dados retornados quando consultamos um funcionário
    """
    id: str
    
    # Dados relacionados (vem de JOINs)
    loja_nome: Optional[str] = None
    setor_nome: Optional[str] = None
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,
            datetime: lambda v: v.isoformat() if v else None,
            date: lambda v: v.isoformat() if v else None
        }


class FuncionarioListResponse(BaseModel):
    """
    Resposta quando listamos vários funcionários
    """
    items: list[FuncionarioResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosFuncionario(BaseModel):
    """
    Filtros disponíveis para buscar funcionários
    """
    busca: Optional[str] = None  # Busca por nome, email
    perfil: Optional[Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']] = None
    loja_id: Optional[UUID] = None
    setor_id: Optional[UUID] = None
    ativo: Optional[bool] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None 