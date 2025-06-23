"""
Controller - Endpoints da API para funcionários
Define todas as rotas HTTP para gerenciar funcionários
"""
import logging
from typing import Optional
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
    FuncionarioCreate,
    FuncionarioUpdate,
    FuncionarioResponse,
    FuncionarioListResponse,
    FiltrosFuncionario
)
from .services import FuncionarioService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/funcionarios", tags=["funcionarios"])

# Instância do serviço
funcionario_service = FuncionarioService()


@router.get("/", response_model=FuncionarioListResponse)
async def listar_funcionarios(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome ou email"),
    perfil: Optional[str] = Query(None, description="Filtrar por perfil"),
    setor_id: Optional[str] = Query(None, description="ID do setor"),
    data_inicio: Optional[str] = Query(None, description="Data início admissão (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim admissão (YYYY-MM-DD)"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: User = Depends(get_current_user)
) -> FuncionarioListResponse:
    """
    Lista funcionários com filtros e paginação
    
    **Acesso:** Todos os usuários (veem apenas da sua loja, exceto ADMIN_MASTER)
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome e email
    - `perfil`: VENDEDOR, GERENTE, MEDIDOR, ADMIN_MASTER (filtro interno - backend)
    - `setor_id`: UUID do setor
    - `data_inicio` e `data_fim`: Período de admissão
    
    **Paginação:**
    - `page`: Página atual (padrão: 1)
    - `limit`: Itens por página (padrão: 20, máximo: 100)
    
    **Response:**
    ```json
    {
        "items": [
            {
                "id": "uuid",
                "nome": "João Silva",
                "email": "joao@fluyt.com",
                "telefone": "11999999999",
                "perfil": "VENDEDOR",
                "nivel_acesso": "USUARIO",
                "loja_id": "uuid-loja",
                "loja_nome": "Loja Centro",
                "setor_id": "uuid-setor", 
                "setor_nome": "Vendas",
                "ativo": true,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 25,
        "page": 1,
        "limit": 20,
        "pages": 2
    }
    ```
    """
    try:
        # Monta filtros
        filtros = FiltrosFuncionario(
            busca=busca,
            perfil=perfil,
            setor_id=setor_id
        )
        
        # Se data_inicio e data_fim foram fornecidas, converte para datetime
        if data_inicio:
            from datetime import datetime
            filtros.data_inicio = datetime.fromisoformat(data_inicio)
        
        if data_fim:
            from datetime import datetime
            filtros.data_fim = datetime.fromisoformat(data_fim)
        
        # Chama o serviço
        resultado = await funcionario_service.listar_funcionarios(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de funcionários: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar funcionários: {str(e)}")
        raise


@router.get("/{funcionario_id}", response_model=FuncionarioResponse)
async def buscar_funcionario(
    funcionario_id: str,
    current_user: User = Depends(get_current_user)
) -> FuncionarioResponse:
    """
    Busca um funcionário específico pelo ID
    
    **Acesso:** Todos os usuários (apenas da sua loja, exceto ADMIN_MASTER)
    
    **Parâmetros:**
    - `funcionario_id`: UUID do funcionário
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "João Silva",
        "email": "joao@fluyt.com",
        "telefone": "11999999999",
        "perfil": "VENDEDOR",
        "nivel_acesso": "USUARIO",
        "loja_id": "uuid-loja",
        "loja_nome": "Loja Centro",
        "setor_id": "uuid-setor",
        "setor_nome": "Vendas",
        "salario": 3500.00,
        "data_admissao": "2024-01-15",
        "ativo": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
    ```
    """
    try:
        funcionario = await funcionario_service.buscar_funcionario(funcionario_id, current_user)
        
        logger.info(f"Funcionário consultado: {funcionario_id} por usuário {current_user.id}")
        
        return funcionario
    
    except Exception as e:
        logger.error(f"Erro ao buscar funcionário {funcionario_id}: {str(e)}")
        raise


@router.post("/", response_model=FuncionarioResponse, status_code=status.HTTP_201_CREATED)
async def criar_funcionario(
    dados: FuncionarioCreate,
    current_user: User = Depends(get_current_user)
) -> FuncionarioResponse:
    """
    Cria um novo funcionário
    
    **Acesso:** Apenas ADMIN_MASTER, ADMIN e GERENTE
    
    **Body:**
    ```json
    {
        "nome": "João Silva",
        "email": "joao@fluyt.com",
        "telefone": "(11) 99999-9999",
        "perfil": "VENDEDOR",
        "nivel_acesso": "USUARIO",
        "loja_id": "uuid-loja",
        "setor_id": "uuid-setor",
        "salario": 3500.00,
        "data_admissao": "2024-01-15"
    }
    ```
    
    **Regras:**
    - Nome é obrigatório e único
    - Email pode repetir (apenas log de auditoria)
    - Todos outros campos são opcionais
    - Se loja_id não informada, usa loja do usuário
    - Loja e setor devem existir se informados
    """
    try:
        funcionario = await funcionario_service.criar_funcionario(dados, current_user)
        
        logger.info(f"Funcionário criado: {funcionario.id} por usuário {current_user.id}")
        
        return funcionario
    
    except Exception as e:
        logger.error(f"Erro ao criar funcionário: {str(e)}")
        raise


@router.put("/{funcionario_id}", response_model=FuncionarioResponse)
async def atualizar_funcionario(
    funcionario_id: str,
    dados: FuncionarioUpdate,
    current_user: User = Depends(get_current_user)
) -> FuncionarioResponse:
    """
    Atualiza dados de um funcionário existente
    
    **Acesso:** Apenas ADMIN_MASTER, ADMIN e GERENTE
    
    **Parâmetros:**
    - `funcionario_id`: UUID do funcionário
    
    **Body:** (todos campos opcionais)
    ```json
    {
        "nome": "João Silva Santos",
        "telefone": "(11) 88888-8888",
        "perfil": "GERENTE",
        "salario": 4500.00
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - Nome não pode conflitar com outro funcionário
    - Email pode repetir (apenas log de auditoria)
    - Loja e setor devem existir se alterados
    """
    try:
        funcionario = await funcionario_service.atualizar_funcionario(funcionario_id, dados, current_user)
        
        logger.info(f"Funcionário atualizado: {funcionario_id} por usuário {current_user.id}")
        
        return funcionario
    
    except Exception as e:
        logger.error(f"Erro ao atualizar funcionário {funcionario_id}: {str(e)}")
        raise


@router.delete("/{funcionario_id}", response_model=SuccessResponse)
async def excluir_funcionario(
    funcionario_id: str,
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Exclui um funcionário (soft delete - marca como inativo)
    
    **Acesso:** Apenas ADMIN_MASTER, SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `funcionario_id`: UUID do funcionário
    
    **Regras:**
    - Apenas administradores podem excluir funcionários
    - Funcionário é marcado como inativo, NÃO deletado fisicamente
    - Dados são preservados para auditoria
    - Histórico é mantido
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Funcionário excluído com sucesso"
    }
    ```
    """
    try:
        sucesso = await funcionario_service.excluir_funcionario(funcionario_id, current_user)
        
        if sucesso:
            logger.info(f"Funcionário excluído (soft delete): {funcionario_id} por usuário {current_user.id}")
            return SuccessResponse(message="Funcionário excluído com sucesso")
        else:
            raise Exception("Falha ao excluir funcionário")
    
    except Exception as e:
        logger.error(f"Erro ao excluir funcionário {funcionario_id}: {str(e)}")
        raise


@router.get("/verificar-nome/{nome}", response_model=dict)
@limiter.limit("10/minute")  # Máximo 10 verificações por minuto
async def verificar_nome(
    request: Request,  # Obrigatório para o rate limiter
    nome: str,
    funcionario_id: Optional[str] = Query(None, description="ID do funcionário a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um nome de funcionário está disponível para uso
    
    **Acesso:** Todos os usuários autenticados
    
    **Parâmetros:**
    - `nome`: Nome a verificar
    - `funcionario_id`: UUID do funcionário a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "nome": "João Silva"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se nome já existe
    - Ignora o próprio funcionário se `funcionario_id` for fornecido
    """
    try:
        disponivel = await funcionario_service.verificar_nome_disponivel(
            nome=nome,
            user=current_user,
            funcionario_id_ignorar=funcionario_id
        )
        
        return {
            "disponivel": disponivel,
            "nome": nome
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
        raise 