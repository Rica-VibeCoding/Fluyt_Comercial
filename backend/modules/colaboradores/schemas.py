"""
Schemas (estruturas de dados) para o módulo de colaboradores
Define como os dados de tipos de colaboradores devem ser enviados e recebidos pela API
"""
from typing import Optional, Literal, List
from datetime import datetime, date
from uuid import UUID
from pydantic import BaseModel, field_validator, EmailStr
import re


class TipoColaboradorBase(BaseModel):
    """
    Campos base que todo tipo de colaborador tem
    APENAS NOME, CATEGORIA E TIPO_PERCENTUAL SÃO OBRIGATÓRIOS
    """
    # Dados principais - OBRIGATÓRIOS
    nome: str
    categoria: Literal['FUNCIONARIO', 'PARCEIRO']
    tipo_percentual: Literal['VENDA', 'CUSTO']
    
    # Bases de pagamento - APENAS UMA DEVE SER USADA por tipo
    percentual_valor: float = 0.0  # Percentual (%)
    salario_base: float = 0.0      # Salário Base (R$)
    valor_por_servico: float = 0.0 # Valor por Serviço (R$)
    minimo_garantido: float = 0.0  # Mínimo Garantido (R$)
    
    # Configurações opcionais
    opcional_no_orcamento: bool = False
    ativo: bool = True
    descricao: Optional[str] = None
    
    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: str) -> str:
        """Valida se o nome tem pelo menos 2 caracteres"""
        if not v or len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()
    
    @field_validator('percentual_valor', 'salario_base', 'valor_por_servico', 'minimo_garantido')
    @classmethod
    def validar_valores_positivos(cls, v: float) -> float:
        """Valida se os valores são positivos"""
        if v < 0:
            raise ValueError('Valores devem ser positivos')
        return v
    
    @field_validator('percentual_valor')
    @classmethod
    def validar_percentual(cls, v: float) -> float:
        """Valida se o percentual está entre 0 e 100"""
        if v > 100:
            raise ValueError('Percentual não pode ser maior que 100%')
        return v
    
    @field_validator('descricao')
    def validar_descricao(cls, v):
        """
        Valida descrição - limpa string vazia
        """
        if not v or v.strip() == '':
            return None
        return v.strip()


class TipoColaboradorCreate(TipoColaboradorBase):
    """
    Dados necessários para criar um novo tipo de colaborador
    """
    pass


class TipoColaboradorUpdate(BaseModel):
    """
    Dados para atualizar um tipo de colaborador (todos os campos são opcionais)
    """
    nome: Optional[str] = None
    categoria: Optional[Literal['FUNCIONARIO', 'PARCEIRO']] = None
    tipo_percentual: Optional[Literal['VENDA', 'CUSTO']] = None
    percentual_valor: Optional[float] = None
    salario_base: Optional[float] = None
    valor_por_servico: Optional[float] = None
    minimo_garantido: Optional[float] = None
    opcional_no_orcamento: Optional[bool] = None
    ativo: Optional[bool] = None
    descricao: Optional[str] = None
    
    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: Optional[str]) -> Optional[str]:
        """Valida nome se fornecido"""
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip() if v else v
    
    @field_validator('percentual_valor', 'salario_base', 'valor_por_servico', 'minimo_garantido')
    @classmethod
    def validar_valores_positivos(cls, v: Optional[float]) -> Optional[float]:
        """Valida valores se fornecidos"""
        if v is not None and v < 0:
            raise ValueError('Valores devem ser positivos')
        return v
    
    @field_validator('percentual_valor')
    @classmethod
    def validar_percentual(cls, v: Optional[float]) -> Optional[float]:
        """Valida percentual se fornecido"""
        if v is not None and v > 100:
            raise ValueError('Percentual não pode ser maior que 100%')
        return v


class TipoColaboradorResponse(TipoColaboradorBase):
    """
    Dados retornados quando consultamos um tipo de colaborador
    """
    id: UUID
    
    # Controle do sistema
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TipoColaboradorListResponse(BaseModel):
    """
    Resposta quando listamos vários tipos de colaboradores
    """
    items: List[TipoColaboradorResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosTipoColaborador(BaseModel):
    """
    Filtros disponíveis para buscar tipos de colaboradores
    """
    busca: Optional[str] = None  # Busca por nome ou descrição
    categoria: Optional[Literal['FUNCIONARIO', 'PARCEIRO']] = None  # Filtrar por categoria
    tipo_percentual: Optional[Literal['VENDA', 'CUSTO']] = None  # Filtrar por tipo percentual
    ativo: Optional[bool] = None  # Filtrar por status ativo/inativo
    opcional_no_orcamento: Optional[bool] = None  # Filtrar por opcionalidade no orçamento
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None 


# ========================================
# SCHEMAS PARA COLABORADORES INDIVIDUAIS
# ========================================

class ColaboradorBase(BaseModel):
    """
    Campos base para colaboradores individuais
    APENAS NOME E TIPO_COLABORADOR_ID SÃO OBRIGATÓRIOS
    """
    # Dados principais - OBRIGATÓRIOS
    nome: str
    tipo_colaborador_id: UUID
    
    # Dados pessoais - OPCIONAIS
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    endereco: Optional[str] = None
    data_admissao: Optional[date] = None
    observacoes: Optional[str] = None
    
    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: str) -> str:
        """Valida se o nome tem pelo menos 2 caracteres"""
        if not v or len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip()
    
    @field_validator('cpf')
    @classmethod
    def validar_cpf(cls, v: Optional[str]) -> Optional[str]:
        """Valida formato do CPF se fornecido"""
        if not v:
            return None
        
        # Remove formatação
        cpf_limpo = re.sub(r'[^0-9]', '', v)
        
        # Verifica se tem 11 dígitos
        if len(cpf_limpo) != 11:
            raise ValueError('CPF deve ter 11 dígitos')
        
        # Verifica se não são todos números iguais
        if cpf_limpo == cpf_limpo[0] * 11:
            raise ValueError('CPF inválido')
        
        # Validação do dígito verificador
        def calcular_digito(cpf_parcial: str, peso_inicial: int) -> str:
            soma = sum(int(cpf_parcial[i]) * (peso_inicial - i) for i in range(len(cpf_parcial)))
            resto = soma % 11
            return '0' if resto < 2 else str(11 - resto)
        
        # Verifica primeiro dígito
        if cpf_limpo[9] != calcular_digito(cpf_limpo[:9], 10):
            raise ValueError('CPF inválido')
        
        # Verifica segundo dígito
        if cpf_limpo[10] != calcular_digito(cpf_limpo[:10], 11):
            raise ValueError('CPF inválido')
        
        return cpf_limpo
    
    @field_validator('telefone')
    @classmethod
    def validar_telefone(cls, v: Optional[str]) -> Optional[str]:
        """Valida formato do telefone se fornecido"""
        if not v:
            return None
        
        # Remove formatação
        telefone_limpo = re.sub(r'[^0-9]', '', v)
        
        # Verifica se tem entre 10 e 11 dígitos (com DDD)
        if len(telefone_limpo) not in [10, 11]:
            raise ValueError('Telefone deve ter 10 ou 11 dígitos com DDD')
        
        return telefone_limpo
    
    @field_validator('data_admissao')
    @classmethod
    def validar_data_admissao(cls, v: Optional[date]) -> Optional[date]:
        """Valida se a data de admissão não é futura"""
        if v and v > date.today():
            raise ValueError('Data de admissão não pode ser futura')
        return v


class ColaboradorCreate(ColaboradorBase):
    """Schema para criar novo colaborador"""
    pass


class ColaboradorUpdate(BaseModel):
    """Schema para atualizar colaborador - todos os campos opcionais"""
    nome: Optional[str] = None
    tipo_colaborador_id: Optional[UUID] = None
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    endereco: Optional[str] = None
    data_admissao: Optional[date] = None
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None
    
    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v: Optional[str]) -> Optional[str]:
        """Valida nome se fornecido"""
        if v is not None and len(v.strip()) < 2:
            raise ValueError('Nome deve ter pelo menos 2 caracteres')
        return v.strip() if v else v
    
    @field_validator('cpf')
    @classmethod
    def validar_cpf(cls, v: Optional[str]) -> Optional[str]:
        """Aplica mesma validação do ColaboradorBase"""
        return ColaboradorBase.validar_cpf(v)
    
    @field_validator('telefone')
    @classmethod
    def validar_telefone(cls, v: Optional[str]) -> Optional[str]:
        """Aplica mesma validação do ColaboradorBase"""
        return ColaboradorBase.validar_telefone(v)
    
    @field_validator('data_admissao')
    @classmethod
    def validar_data_admissao(cls, v: Optional[date]) -> Optional[date]:
        """Aplica mesma validação do ColaboradorBase"""
        return ColaboradorBase.validar_data_admissao(v)


class ColaboradorResponse(ColaboradorBase):
    """Schema de resposta com dados completos do colaborador"""
    id: UUID
    ativo: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # Dados do tipo relacionado (via JOIN)
    tipo_colaborador_nome: Optional[str] = None
    tipo_colaborador_categoria: Optional[Literal['FUNCIONARIO', 'PARCEIRO']] = None


class ColaboradorListResponse(BaseModel):
    """Schema para lista paginada de colaboradores"""
    items: List[ColaboradorResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosColaborador(BaseModel):
    """Schema para filtros de busca de colaboradores"""
    busca: Optional[str] = None
    tipo_colaborador_id: Optional[UUID] = None
    categoria: Optional[Literal['FUNCIONARIO', 'PARCEIRO']] = None
    ativo: Optional[bool] = None 