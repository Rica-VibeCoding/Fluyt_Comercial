"""
Controller - Endpoints da API para setores
Define todas as rotas HTTP para gerenciar setores
"""
import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException, Request

from core.auth import get_current_user, User
from core.rate_limiter import limiter
from core.dependencies import (
    get_pagination,
    PaginationParams,
    SuccessResponse
)
from core.exceptions import NotFoundException, ConflictException

from .schemas import (
    SetorCreate,
    SetorUpdate,
    SetorResponse,
    SetorListResponse,
    FiltrosSetor
)
from .services import SetorService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/setores", tags=["setores"])

# Instância do serviço
setor_service = SetorService()


@router.get("/", response_model=SetorListResponse)
async def listar_setores(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome ou descrição"),
    ativo: Optional[bool] = Query(None, description="Filtrar por status ativo/inativo"),
    data_inicio: Optional[str] = Query(None, description="Data início (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim (YYYY-MM-DD)"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: User = Depends(get_current_user)
) -> SetorListResponse:
    """
    Lista setores com filtros e paginação
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome e descrição
    - `ativo`: True para ativos, False para inativos, None para todos
    - `data_inicio` e `data_fim`: Período de cadastro
    
    **Paginação:**
    - `page`: Página atual (padrão: 1)
    - `limit`: Itens por página (padrão: 20, máximo: 100)
    
    **Response:**
    ```json
    {
        "items": [...],
        "total": 15,
        "page": 1,
        "limit": 20,
        "pages": 1
    }
    ```
    """
    try:
        # Monta filtros
        filtros = FiltrosSetor(
            busca=busca,
            ativo=ativo
        )
        
        # Se data_inicio e data_fim foram fornecidas, converte para datetime
        if data_inicio:
            from datetime import datetime
            filtros.data_inicio = datetime.fromisoformat(data_inicio)
        
        if data_fim:
            from datetime import datetime
            filtros.data_fim = datetime.fromisoformat(data_fim)
        
        # Chama o serviço
        resultado = await setor_service.listar_setores(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de setores: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar setores: {str(e)}")
        raise


@router.get("/{setor_id}", response_model=SetorResponse)
async def buscar_setor(
    setor_id: str,
    current_user: User = Depends(get_current_user)
) -> SetorResponse:
    """
    Busca um setor específico pelo ID
    
    **Parâmetros:**
    - `setor_id`: UUID do setor
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "Vendas",
        "descricao": "Equipe de vendas",
        "total_funcionarios": 5,
        "ativo": true,
        ...
    }
    ```
    """
    try:
        setor = await setor_service.buscar_setor_por_id(current_user, setor_id)
        
        logger.info(f"Setor consultado: {setor_id} por usuário {current_user.id}")
        
        return setor
    
    except Exception as e:
        logger.error(f"Erro ao buscar setor {setor_id}: {str(e)}")
        raise


@router.post("/", response_model=SetorResponse, status_code=status.HTTP_201_CREATED)
async def criar_setor(
    dados: SetorCreate,
    current_user: User = Depends(get_current_user)
) -> SetorResponse:
    """
    Cria um novo setor
    
    **Body:**
    ```json
    {
        "nome": "Vendas",
        "descricao": "Equipe responsável pelas vendas",
        "ativo": true
    }
    ```
    
    **Regras:**
    - Nome não pode estar duplicado
    - Apenas administradores podem criar setores
    - Apenas nome é obrigatório
    - Descrição é opcional
    """
    try:
        setor = await setor_service.criar_setor(current_user, dados)
        
        logger.info(f"Setor criado: {setor.id} por usuário {current_user.id}")
        
        return setor
    
    except Exception as e:
        logger.error(f"Erro ao criar setor: {str(e)}")
        raise


@router.put("/{setor_id}", response_model=SetorResponse)
async def atualizar_setor(
    setor_id: str,
    dados: SetorUpdate,
    current_user: User = Depends(get_current_user)
) -> SetorResponse:
    """
    Atualiza dados de um setor existente
    
    **Parâmetros:**
    - `setor_id`: UUID do setor
    
    **Body:** (todos os campos são opcionais)
    ```json
    {
        "nome": "Novo Nome do Setor",
        "descricao": "Nova descrição",
        "ativo": false
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - Nome não pode conflitar com outro setor
    - Apenas administradores podem atualizar setores
    """
    try:
        setor = await setor_service.atualizar_setor(current_user, setor_id, dados)
        
        logger.info(f"Setor atualizado: {setor_id} por usuário {current_user.id}")
        
        return setor
    
    except Exception as e:
        logger.error(f"Erro ao atualizar setor {setor_id}: {str(e)}")
        raise


@router.delete("/{setor_id}", response_model=SuccessResponse)
async def excluir_setor(
    setor_id: str,
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Exclui um setor (soft delete)
    
    **Parâmetros:**
    - `setor_id`: UUID do setor
    
    **Regras:**
    - Apenas super administradores podem excluir setores
    - Setor é marcado como inativo, não deletado fisicamente
    - Não é possível excluir setor com funcionários vinculados
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Setor excluído com sucesso"
    }
    ```
    """
    try:
        sucesso = await setor_service.excluir_setor(current_user, setor_id)
        
        if sucesso:
            logger.info(f"Setor excluído: {setor_id} por usuário {current_user.id}")
            return SuccessResponse(message="Setor excluído com sucesso")
        else:
            raise Exception("Falha ao excluir setor")
    
    except Exception as e:
        logger.error(f"Erro ao excluir setor {setor_id}: {str(e)}")
        raise


@router.get("/verificar-nome/{nome}", response_model=dict)
@limiter.limit("10/minute")
async def verificar_nome(
    request: Request,
    nome: str,
    setor_id: Optional[str] = Query(None, description="ID do setor a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um nome de setor está disponível para uso
    
    **Parâmetros:**
    - `nome`: Nome do setor a verificar
    - `setor_id`: UUID do setor a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "nome": "Vendas"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se nome já existe
    - Ignora o próprio setor se `setor_id` for fornecido
    """
    try:
        disponivel = await setor_service.verificar_nome_disponivel(
            nome=nome,
            user=current_user,
            setor_id_ignorar=setor_id
        )
        
        return {
            "disponivel": disponivel,
            "nome": nome
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
        raise 