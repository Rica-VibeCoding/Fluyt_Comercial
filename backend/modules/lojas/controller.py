"""
Controller - Endpoints da API para lojas
Define todas as rotas HTTP para gerenciar lojas
"""
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException

from core.auth import get_current_user, User
from core.dependencies import (
    get_pagination,
    PaginationParams,
    SuccessResponse
)
from core.exceptions import NotFoundException, ConflictException

from .schemas import (
    LojaCreate,
    LojaUpdate,
    LojaResponse,
    LojaListResponse,
    FiltrosLoja
)
from .services import LojaService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/lojas", tags=["lojas"])

# Instância do serviço
loja_service = LojaService()


@router.get("/", response_model=LojaListResponse)
async def listar_lojas(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome, telefone ou email"),
    empresa_id: Optional[str] = Query(None, description="ID da empresa"),
    gerente_id: Optional[str] = Query(None, description="ID do gerente"),
    data_inicio: Optional[str] = Query(None, description="Data início (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim (YYYY-MM-DD)"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: User = Depends(get_current_user)
) -> LojaListResponse:
    """
    Lista lojas com filtros e paginação
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome, telefone e email
    - `empresa_id`: UUID da empresa
    - `gerente_id`: UUID do gerente
    - `data_inicio` e `data_fim`: Período de cadastro
    
    **Paginação:**
    - `page`: Página atual (padrão: 1)
    - `limit`: Itens por página (padrão: 20, máximo: 100)
    
    **Response:**
    ```json
    {
        "items": [...],
        "total": 150,
        "page": 1,
        "limit": 20,
        "pages": 8
    }
    ```
    """
    try:
        # Monta filtros
        filtros = FiltrosLoja(
            busca=busca,
            empresa_id=empresa_id,
            gerente_id=gerente_id
        )
        
        # Se data_inicio e data_fim foram fornecidas, converte para datetime
        if data_inicio:
            from datetime import datetime
            filtros.data_inicio = datetime.fromisoformat(data_inicio)
        
        if data_fim:
            from datetime import datetime
            filtros.data_fim = datetime.fromisoformat(data_fim)
        
        # Chama o serviço
        resultado = await loja_service.listar_lojas(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de lojas: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar lojas: {str(e)}")
        raise


@router.get("/{loja_id}", response_model=LojaResponse)
async def buscar_loja(
    loja_id: str,
    current_user: User = Depends(get_current_user)
) -> LojaResponse:
    """
    Busca uma loja específica pelo ID
    
    **Parâmetros:**
    - `loja_id`: UUID da loja
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "Loja Centro",
        "endereco": "Rua Principal, 123",
        "telefone": "11999999999",
        "empresa": "Empresa ABC",
        "gerente": "João Silva",
        ...
    }
    ```
    """
    try:
        loja = await loja_service.buscar_loja_por_id(current_user, loja_id)
        
        logger.info(f"Loja consultada: {loja_id} por usuário {current_user.id}")
        
        return loja
    
    except Exception as e:
        logger.error(f"Erro ao buscar loja {loja_id}: {str(e)}")
        raise


@router.post("/", response_model=LojaResponse, status_code=status.HTTP_201_CREATED)
async def criar_loja(
    dados: LojaCreate,
    current_user: User = Depends(get_current_user)
) -> LojaResponse:
    """
    Cria uma nova loja
    
    **Body:**
    ```json
    {
        "nome": "Loja Centro",
        "endereco": "Rua Principal, 123",
        "telefone": "11999999999",
        "email": "loja@empresa.com",
        "empresa_id": "uuid-empresa",
        "gerente_id": "uuid-gerente"
    }
    ```
    
    **Regras:**
    - Nome não pode estar duplicado
    - Apenas administradores podem criar lojas
    - Todos os campos exceto nome são opcionais
    - Email deve ser válido se informado
    """
    try:
        loja = await loja_service.criar_loja(current_user, dados)
        
        logger.info(f"Loja criada: {loja.id} por usuário {current_user.id}")
        
        return loja
    
    except Exception as e:
        logger.error(f"Erro ao criar loja: {str(e)}")
        raise


@router.put("/{loja_id}", response_model=LojaResponse)
async def atualizar_loja(
    loja_id: str,
    dados: LojaUpdate,
    current_user: User = Depends(get_current_user)
) -> LojaResponse:
    """
    Atualiza dados de uma loja existente
    
    **Parâmetros:**
    - `loja_id`: UUID da loja
    
    **Body:** (todos os campos são opcionais)
    ```json
    {
        "nome": "Novo Nome da Loja",
        "telefone": "11888888888",
        "endereco": "Nova Rua, 456"
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - Nome não pode conflitar com outra loja
    - Apenas administradores podem atualizar lojas
    """
    try:
        loja = await loja_service.atualizar_loja(current_user, loja_id, dados)
        
        logger.info(f"Loja atualizada: {loja_id} por usuário {current_user.id}")
        
        return loja
    
    except Exception as e:
        logger.error(f"Erro ao atualizar loja {loja_id}: {str(e)}")
        raise


@router.delete("/{loja_id}", response_model=SuccessResponse)
async def excluir_loja(
    loja_id: str,
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Exclui uma loja (soft delete)
    
    **Parâmetros:**
    - `loja_id`: UUID da loja
    
    **Regras:**
    - Apenas super administradores podem excluir lojas
    - Loja é marcada como inativa, não deletada fisicamente
    - Histórico de clientes/orçamentos é preservado
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Loja excluída com sucesso"
    }
    ```
    """
    try:
        sucesso = await loja_service.excluir_loja(current_user, loja_id)
        
        if sucesso:
            logger.info(f"Loja excluída: {loja_id} por usuário {current_user.id}")
            return SuccessResponse(message="Loja excluída com sucesso")
        else:
            raise Exception("Falha ao excluir loja")
    
    except Exception as e:
        logger.error(f"Erro ao excluir loja {loja_id}: {str(e)}")
        raise


@router.get("/verificar-nome/{nome}", response_model=dict)
async def verificar_nome(
    nome: str,
    loja_id: Optional[str] = Query(None, description="ID da loja a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um nome de loja está disponível para uso
    
    **Parâmetros:**
    - `nome`: Nome da loja a verificar
    - `loja_id`: UUID da loja a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "nome": "Loja Centro"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se nome já existe
    - Ignora a própria loja se `loja_id` for fornecido
    """
    try:
        disponivel = await loja_service.verificar_nome_disponivel(
            nome=nome,
            user=current_user,
            loja_id_ignorar=loja_id
        )
        
        return {
            "disponivel": disponivel,
            "nome": nome
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
        raise


@router.get("/test/public", response_model=dict, include_in_schema=False)
async def test_lojas_publico() -> dict:
    """
    Endpoint público para teste de conectividade
    
    **APENAS PARA DESENVOLVIMENTO**
    Permite testar se a API está funcionando sem necessidade de autenticação
    """
    from core.config import settings
    if not settings.is_development:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Endpoint não encontrado")
    try:
        # Teste básico de conectividade com o serviço
        from .repository import LojaRepository
        from core.database import get_database
        
        db = get_database()
        repo = LojaRepository(db)
        # Contagem básica de lojas
        total = await repo.contar_total_publico()
        
        logger.info("Teste público de conectividade da API de lojas executado")
        
        return {
            "success": True,
            "message": "API de lojas funcionando",
            "total_lojas": total,
            "ambiente": "development"
        }
    
    except Exception as e:
        logger.error(f"Erro no teste público: {str(e)}")
        return {
            "success": False,
            "message": f"Erro na API: {str(e)}",
            "total_lojas": 0,
            "ambiente": "development"
        } 