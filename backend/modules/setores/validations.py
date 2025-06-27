"""
Validations - Regras de validação centralizadas para setores
Evita duplicação de código e centraliza lógica de negócio
"""
from core.auth import User
from core.exceptions import ForbiddenException, ValidationException


def validar_permissao_admin(user: User, acao: str = "realizar esta ação"):
    """
    Valida se o usuário tem permissão de administrador
    
    Args:
        user: Usuário autenticado
        acao: Descrição da ação (para mensagem de erro)
        
    Raises:
        ForbiddenException: Se não for admin
    """
    if not user.is_admin:
        raise ForbiddenException(
            f"Apenas administradores podem {acao}"
        )


def validar_permissao_super_admin(user: User, acao: str = "realizar esta ação"):
    """
    Valida se o usuário tem permissão de super administrador
    
    Args:
        user: Usuário autenticado
        acao: Descrição da ação (para mensagem de erro)
        
    Raises:
        ForbiddenException: Se não for super admin
    """
    if not user.is_super_admin:
        raise ForbiddenException(
            f"Apenas super administradores podem {acao}"
        )


def validar_setor_com_funcionarios(total_funcionarios: int, nome_setor: str):
    """
    Valida se um setor pode ser excluído baseado no número de funcionários
    
    Args:
        total_funcionarios: Número de funcionários no setor
        nome_setor: Nome do setor (para mensagem de erro)
        
    Raises:
        ValidationException: Se tiver funcionários vinculados
    """
    if total_funcionarios > 0:
        raise ValidationException(
            f"Não é possível excluir o setor '{nome_setor}' pois existem "
            f"{total_funcionarios} funcionário(s) vinculado(s). "
            f"Transfira os funcionários para outro setor antes de excluir."
        )


def validar_dados_setor(dados: dict):
    """
    Valida dados básicos de um setor
    
    Args:
        dados: Dicionário com dados do setor
        
    Raises:
        ValidationException: Se dados inválidos
    """
    # Nome é obrigatório e não pode ser vazio
    if 'nome' in dados:
        nome = dados.get('nome', '').strip()
        if not nome:
            raise ValidationException("Nome do setor não pode ser vazio")
        
        # Limite de tamanho
        if len(nome) > 100:
            raise ValidationException("Nome do setor não pode ter mais de 100 caracteres")
    
    # Descrição é opcional, mas tem limite
    if 'descricao' in dados and dados['descricao']:
        descricao = dados['descricao'].strip()
        if len(descricao) > 500:
            raise ValidationException("Descrição não pode ter mais de 500 caracteres") 