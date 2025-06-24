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
    ⚠️ ATENÇÃO: Baseado na análise real da tabela cad_equipe,
    vários campos são obrigatórios (NOT NULL constraints)
    """
    # Dados principais - OBRIGATÓRIOS CONFORME BANCO
    nome: str                                                                    # ✅ Obrigatório
    email: EmailStr                                                             # ⚠️ Obrigatório no banco
    telefone: str                                                               # ⚠️ Obrigatório no banco
    perfil: Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']          # ⚠️ Obrigatório no banco
    nivel_acesso: Literal['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN']         # ⚠️ Obrigatório no banco
    loja_id: UUID                                                               # ⚠️ Obrigatório no banco
    setor_id: UUID                                                              # ⚠️ Obrigatório no banco
    
    # Campos financeiros - OBRIGATÓRIOS CONFORME BANCO
    salario: float                                                              # ⚠️ Obrigatório no banco
    data_admissao: date                                                         # ⚠️ Obrigatório no banco
    limite_desconto: float = 0.0                                               # ⚠️ Obrigatório no banco (default 0.0)
    tem_minimo_garantido: bool = True                                           # ⚠️ Obrigatório no banco (default True)
    valor_minimo_garantido: float = 0.0                                         # ⚠️ Obrigatório no banco (default 0.0)
    
    # Campos opcionais (podem ser NULL)
    comissao_percentual_vendedor: Optional[float] = None
    comissao_percentual_gerente: Optional[float] = None
    valor_medicao: Optional[float] = None
    override_comissao: Optional[float] = None
    ativo: bool = True
    
    class Config:
        from_attributes = True
        json_encoders = {
            UUID: str,  # CRÍTICO: Converte UUID para string
            date: lambda v: v.isoformat() if v else None
        }
    
    @field_validator('email')
    def validar_email(cls, v):
        """
        Valida email - OBRIGATÓRIO no banco
        """
        if not v or v.strip() == '':
            raise ValueError('Email é obrigatório')
        
        # Validação básica de email
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v.strip()):
            raise ValueError('Email inválido')
        
        return v.strip()
    
    @field_validator('telefone')
    def validar_telefone(cls, v):
        """
        Valida formato do telefone - OBRIGATÓRIO no banco
        """
        if not v or v.strip() == '':
            raise ValueError('Telefone é obrigatório')
            
        # Remove caracteres especiais
        numeros = re.sub(r'\D', '', v)
        
        # Se não tiver números, erro
        if not numeros:
            raise ValueError('Telefone deve conter números')
        
        # Verifica se tem pelo menos 10 dígitos
        if len(numeros) < 10:
            raise ValueError('Telefone deve ter pelo menos 10 dígitos')
        
        return numeros


class FuncionarioCreate(FuncionarioBase):
    """
    Dados necessários para criar um novo funcionário
    ⚠️ TODOS os campos do FuncionarioBase são obrigatórios para criação
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


class FuncionarioResponse(BaseModel):
    """
    Dados retornados quando consultamos um funcionário
    ⚠️ IMPORTANTE: Response permite None para compatibilidade com dados existentes no banco
    """
    # Identificação
    id: str
    
    # Dados principais - TOLERANTES A NULL PARA COMPATIBILIDADE
    nome: str
    email: Optional[str] = None  # ✅ Pode ser NULL no banco
    telefone: Optional[str] = None  # ✅ Pode ser NULL no banco
    perfil: Optional[Literal['VENDEDOR', 'GERENTE', 'MEDIDOR', 'ADMIN_MASTER']] = None  # ✅ Tolerante
    nivel_acesso: Optional[Literal['USUARIO', 'SUPERVISOR', 'GERENTE', 'ADMIN']] = None  # ✅ Pode ser NULL
    loja_id: Optional[str] = None  # ✅ Pode ser NULL no banco
    setor_id: Optional[str] = None  # ✅ Pode ser NULL no banco
    
    # Campos financeiros - TOLERANTES A NULL
    salario: Optional[float] = None
    data_admissao: Optional[date] = None
    limite_desconto: Optional[float] = 0.0
    tem_minimo_garantido: Optional[bool] = True
    valor_minimo_garantido: Optional[float] = 0.0  # ✅ CORRIGIDO: aceita None
    
    # Campos opcionais
    comissao_percentual_vendedor: Optional[float] = None
    comissao_percentual_gerente: Optional[float] = None
    valor_medicao: Optional[float] = None
    override_comissao: Optional[float] = None
    ativo: Optional[bool] = True
    
    # Dados relacionados (vem de JOINs)
    loja_nome: Optional[str] = None
    setor_nome: Optional[str] = None
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        json_encoders = {
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