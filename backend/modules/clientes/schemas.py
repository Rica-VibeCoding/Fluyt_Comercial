"""
Schemas (estruturas de dados) para o módulo de clientes
Define como os dados de cliente devem ser enviados e recebidos pela API
"""
from typing import Optional, Literal, Dict, Any
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, field_validator
import re


class ClienteBase(BaseModel):
    """
    Campos base que todo cliente tem
    APENAS NOME É OBRIGATÓRIO - todos os outros são opcionais
    """
    # Dados principais - APENAS NOME OBRIGATÓRIO
    nome: str
    
    @field_validator('nome')
    def validar_nome(cls, v):
        """
        Valida se o nome não está vazio
        """
        if not v or not v.strip():
            raise ValueError('Nome do cliente é obrigatório')
        return v.strip()
    cpf_cnpj: Optional[str] = None
    rg_ie: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    tipo_venda: Literal['NORMAL', 'FUTURA'] = 'NORMAL'
    ativo: bool = True
    
    # Endereço - todos opcionais
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    cep: Optional[str] = None
    
    # Informações comerciais - todos opcionais
    procedencia_id: Optional[str] = None
    vendedor_id: Optional[str] = None
    status_id: Optional[str] = None
    observacoes: Optional[str] = None

    @field_validator('procedencia_id', 'vendedor_id', 'status_id', mode='before')
    def anular_campos_uuid_vazios(cls, v):
        """
        Converte strings vazias para None para campos que são chaves estrangeiras (UUIDs).
        Isso evita erros no banco de dados ao tentar inserir um UUID inválido.
        """
        if isinstance(v, str) and not v.strip():
            return None
        return v
    
    @field_validator('cpf_cnpj')
    def validar_cpf_cnpj(cls, v):
        """
        Valida se o CPF ou CNPJ tem formato correto
        Remove caracteres especiais e verifica tamanho
        """
        if not v or v.strip() == '':  # Se for None, string vazia ou só espaços
            return None
            
        # Remove tudo que não for número
        numeros = re.sub(r'\D', '', v)
        
        # Se não tiver números, retorna None
        if not numeros:
            return None
        
        # Verifica se tem 11 dígitos (CPF) ou 14 (CNPJ)
        if len(numeros) not in [11, 14]:
            raise ValueError('CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos')
        
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
    
    @field_validator('cep')
    def validar_cep(cls, v):
        """
        Valida formato do CEP
        """
        if not v or v.strip() == '':  # Se for None, string vazia ou só espaços
            return None
            
        # Remove caracteres especiais
        numeros = re.sub(r'\D', '', v)
        
        # Se não tiver números, retorna None
        if not numeros:
            return None
        
        # CEP deve ter 8 dígitos
        if len(numeros) != 8:
            raise ValueError('CEP deve ter 8 dígitos')
        
        return numeros
    
    @field_validator('uf')
    def validar_uf(cls, v):
        """
        Valida se o estado é válido
        """
        if not v or v.strip() == '':  # Se for None, string vazia ou só espaços
            return None
            
        estados_validos = [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ]
        
        if v.upper() not in estados_validos:
            raise ValueError(f'UF inválida. Use uma das: {", ".join(estados_validos)}')
        
        return v.upper()


class ClienteCreate(ClienteBase):
    """
    Dados necessários para criar um novo cliente
    """
    pass


class ClienteUpdate(BaseModel):
    """
    Dados para atualizar um cliente (todos os campos são opcionais)
    """
    # Dados principais
    nome: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    rg_ie: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    tipo_venda: Optional[Literal['NORMAL', 'FUTURA']] = None
    ativo: Optional[bool] = None
    
    # Endereço
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    cep: Optional[str] = None
    
    # Informações comerciais
    procedencia_id: Optional[str] = None
    vendedor_id: Optional[str] = None
    status_id: Optional[str] = None
    observacoes: Optional[str] = None

    @field_validator('procedencia_id', 'vendedor_id', 'status_id', mode='before')
    def anular_campos_uuid_vazios_update(cls, v):
        """
        Converte strings vazias para None para campos que são chaves estrangeiras (UUIDs).
        Isso evita erros no banco de dados ao tentar inserir um UUID inválido.
        """
        if isinstance(v, str) and not v.strip():
            return None
        return v


class ClienteResponse(ClienteBase):
    """
    Dados retornados quando consultamos um cliente
    """
    id: str
    loja_id: Optional[str] = None
    status_id: Optional[str] = None
    
    # Dados relacionados (vem de JOINs)
    vendedor_nome: Optional[str] = None
    procedencia: Optional[str] = None
    
    # Dados do status (quando incluído)
    status: Optional[Dict[str, Any]] = None
    
    # Controle do sistema
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ClienteListResponse(BaseModel):
    """
    Resposta quando listamos vários clientes
    """
    items: list[ClienteResponse]
    total: int
    page: int
    limit: int
    pages: int


class FiltrosCliente(BaseModel):
    """
    Filtros disponíveis para buscar clientes
    """
    busca: Optional[str] = None  # Busca por nome, CPF/CNPJ, telefone
    tipo_venda: Optional[Literal['NORMAL', 'FUTURA']] = None
    procedencia_id: Optional[str] = None
    vendedor_id: Optional[str] = None
    data_inicio: Optional[datetime] = None
    data_fim: Optional[datetime] = None