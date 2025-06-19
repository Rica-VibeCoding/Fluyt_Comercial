"""
Exceções customizadas do sistema
"""
from typing import Optional, Dict, Any
from fastapi import HTTPException, status


class FlytException(HTTPException):
    """Exceção base do sistema Fluyt"""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        headers: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class NotFoundException(FlytException):
    """Recurso não encontrado"""
    
    def __init__(self, resource: str = "Recurso", identifier: Optional[str] = None):
        detail = f"{resource} não encontrado"
        if identifier:
            detail += f": {identifier}"
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code="NOT_FOUND"
        )


class ValidationException(FlytException):
    """Erro de validação"""
    
    def __init__(self, detail: str, field: Optional[str] = None):
        if field:
            detail = f"Erro no campo '{field}': {detail}"
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code="VALIDATION_ERROR"
        )


class UnauthorizedException(FlytException):
    """Não autorizado"""
    
    def __init__(self, detail: str = "Não autorizado"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
            error_code="UNAUTHORIZED"
        )


class ForbiddenException(FlytException):
    """Acesso negado"""
    
    def __init__(self, detail: str = "Acesso negado"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code="FORBIDDEN"
        )


class ConflictException(FlytException):
    """Conflito de dados"""
    
    def __init__(self, detail: str, resource: Optional[str] = None):
        if resource:
            detail = f"Conflito em {resource}: {detail}"
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code="CONFLICT"
        )


class BusinessRuleException(FlytException):
    """Violação de regra de negócio"""
    
    def __init__(self, detail: str, rule: Optional[str] = None):
        if rule:
            detail = f"Regra violada ({rule}): {detail}"
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code="BUSINESS_RULE_VIOLATION"
        )


class LimitExceededException(FlytException):
    """Limite excedido"""
    
    def __init__(self, detail: str, limit: Optional[Any] = None):
        if limit:
            detail += f" (limite: {limit})"
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail,
            error_code="LIMIT_EXCEEDED"
        )


class ExternalServiceException(FlytException):
    """Erro em serviço externo"""
    
    def __init__(self, service: str, detail: str):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Erro no serviço {service}: {detail}",
            error_code="EXTERNAL_SERVICE_ERROR"
        )


class DatabaseException(FlytException):
    """Erro de banco de dados"""
    
    def __init__(self, detail: str = "Erro ao acessar banco de dados"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail,
            error_code="DATABASE_ERROR"
        )


# Funções auxiliares para tratamento de erros
def handle_supabase_error(error: Exception) -> FlytException:
    """Converte erros do Supabase em exceções do sistema"""
    error_str = str(error).lower()
    
    if "not found" in error_str:
        return NotFoundException()
    elif "duplicate" in error_str or "unique" in error_str:
        return ConflictException("Registro duplicado")
    elif "foreign key" in error_str:
        return ValidationException("Referência inválida")
    elif "permission" in error_str or "rls" in error_str:
        return ForbiddenException("Sem permissão para esta operação")
    else:
        return DatabaseException(str(error))


def validate_required_fields(data: Dict[str, Any], required_fields: list):
    """Valida campos obrigatórios"""
    missing = []
    for field in required_fields:
        if field not in data or data[field] is None:
            missing.append(field)
    
    if missing:
        raise ValidationException(
            f"Campos obrigatórios ausentes: {', '.join(missing)}"
        )


def validate_field_length(
    value: str,
    field_name: str,
    min_length: Optional[int] = None,
    max_length: Optional[int] = None
):
    """Valida comprimento de campo"""
    if min_length and len(value) < min_length:
        raise ValidationException(
            f"Deve ter no mínimo {min_length} caracteres",
            field_name
        )
    
    if max_length and len(value) > max_length:
        raise ValidationException(
            f"Deve ter no máximo {max_length} caracteres",
            field_name
        )