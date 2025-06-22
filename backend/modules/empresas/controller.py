"""
Controller - Endpoints da API para empresas
Define todas as rotas HTTP para gerenciar empresas
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
    EmpresaCreate,
    EmpresaUpdate,
    EmpresaResponse,
    EmpresaListResponse,
    FiltrosEmpresa
)
from .services import EmpresaService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/empresas", tags=["empresas"])

# Instância do serviço
empresa_service = EmpresaService()


@router.get("/", response_model=EmpresaListResponse)
async def listar_empresas(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome, CNPJ ou email"),
    data_inicio: Optional[str] = Query(None, description="Data início (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim (YYYY-MM-DD)"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: User = Depends(get_current_user)
) -> EmpresaListResponse:
    """
    Lista empresas do sistema com filtros e paginação
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome, CNPJ e email
    - `data_inicio` e `data_fim`: Período de cadastro
    
    **Paginação:**
    - `page`: Página atual (padrão: 1)
    - `limit`: Itens por página (padrão: 20, máximo: 100)
    
    **Response:**
    ```json
    {
        "items": [
            {
                "id": "uuid",
                "nome": "Fluyt Móveis LTDA",
                "cnpj": "12.345.678/0001-90",
                "email": "contato@fluyt.com",
                "total_lojas": 3,
                "lojas_ativas": 2,
                "ativo": true,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 150,
        "page": 1,
        "limit": 20,
        "pages": 8
    }
    ```
    """
    try:
        # Monta filtros
        filtros = FiltrosEmpresa(busca=busca)
        
        # Se data_inicio e data_fim foram fornecidas, converte para datetime
        if data_inicio:
            from datetime import datetime
            filtros.data_inicio = datetime.fromisoformat(data_inicio)
        
        if data_fim:
            from datetime import datetime
            filtros.data_fim = datetime.fromisoformat(data_fim)
        
        # Chama o serviço
        resultado = await empresa_service.listar_empresas(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de empresas: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar empresas: {str(e)}")
        raise


@router.get("/{empresa_id}", response_model=EmpresaResponse)
async def buscar_empresa(
    empresa_id: str,
    current_user: User = Depends(get_current_user)
) -> EmpresaResponse:
    """
    Busca uma empresa específica pelo ID
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `empresa_id`: UUID da empresa
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "Fluyt Móveis LTDA",
        "cnpj": "12.345.678/0001-90",
        "email": "contato@fluyt.com",
        "telefone": "(11) 99999-9999",
        "endereco": "Rua das Flores, 123",
        "total_lojas": 3,
        "lojas_ativas": 2,
        "ativo": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
    ```
    """
    try:
        empresa = await empresa_service.buscar_empresa(empresa_id, current_user)
        
        logger.info(f"Empresa consultada: {empresa_id} por usuário {current_user.id}")
        
        return empresa
    
    except Exception as e:
        logger.error(f"Erro ao buscar empresa {empresa_id}: {str(e)}")
        raise


@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
async def criar_empresa(
    dados: EmpresaCreate,
    current_user: User = Depends(get_current_user)
) -> EmpresaResponse:
    """
    Cria uma nova empresa
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Body:**
    ```json
    {
        "nome": "Fluyt Móveis LTDA",
        "cnpj": "12.345.678/0001-90",
        "email": "contato@fluyt.com",
        "telefone": "(11) 99999-9999",
        "endereco": "Rua das Flores, 123"
    }
    ```
    
    **Regras:**
    - CNPJ não pode estar duplicado no sistema
    - Nome não pode estar duplicado no sistema
    - Todos os campos exceto nome são opcionais
    - CNPJ deve ter 14 dígitos (formatação é removida automaticamente)
    - Email deve ser válido se informado
    """
    try:
        empresa = await empresa_service.criar_empresa(dados, current_user)
        
        logger.info(f"Empresa criada: {empresa.id} por usuário {current_user.id}")
        
        return empresa
    
    except Exception as e:
        logger.error(f"Erro ao criar empresa: {str(e)}")
        raise


@router.put("/{empresa_id}", response_model=EmpresaResponse)
async def atualizar_empresa(
    empresa_id: str,
    dados: EmpresaUpdate,
    current_user: User = Depends(get_current_user)
) -> EmpresaResponse:
    """
    Atualiza dados de uma empresa existente
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Parâmetros:**
    - `empresa_id`: UUID da empresa
    
    **Body:** (todos os campos são opcionais)
    ```json
    {
        "nome": "Fluyt Móveis e Decorações LTDA",
        "telefone": "(11) 88888-8888",
        "endereco": "Nova Rua, 456"
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - CNPJ não pode conflitar com outra empresa
    - Nome não pode conflitar com outra empresa
    """
    try:
        empresa = await empresa_service.atualizar_empresa(empresa_id, dados, current_user)
        
        logger.info(f"Empresa atualizada: {empresa_id} por usuário {current_user.id}")
        
        return empresa
    
    except Exception as e:
        logger.error(f"Erro ao atualizar empresa {empresa_id}: {str(e)}")
        raise


@router.delete("/{empresa_id}", response_model=SuccessResponse)
async def excluir_empresa(
    empresa_id: str,
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Desativa uma empresa (soft delete - marca como inativa)
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN_MASTER
    
    **Parâmetros:**
    - `empresa_id`: UUID da empresa
    
    **Regras:**
    - Apenas SUPER_ADMIN e ADMIN_MASTER podem desativar empresas
    - Empresa é marcada como inativa, NÃO deletada fisicamente
    - Dados são preservados para auditoria e possível reativação
    - Histórico é mantido
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Empresa desativada com sucesso"
    }
    ```
    """
    try:
        # Usa o método de soft delete (desativar)
        sucesso = await empresa_service.desativar_empresa(empresa_id, current_user)
        
        if sucesso:
            logger.info(f"Empresa desativada (soft delete): {empresa_id} por usuário {current_user.id}")
            return SuccessResponse(message="Empresa desativada com sucesso")
        else:
            raise Exception("Falha ao desativar empresa")
    
    except Exception as e:
        logger.error(f"Erro ao desativar empresa {empresa_id}: {str(e)}")
        raise


@router.get("/verificar-cnpj/{cnpj}", response_model=dict)
@limiter.limit("10/minute")  # Máximo 10 verificações por minuto
async def verificar_cnpj(
    request: Request,  # Obrigatório para o rate limiter
    cnpj: str,
    empresa_id: Optional[str] = Query(None, description="ID da empresa a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um CNPJ está disponível para uso
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `cnpj`: CNPJ a verificar (apenas números ou formatado)
    - `empresa_id`: UUID da empresa a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "cnpj": "12345678000190"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se CNPJ já existe
    - Ignora a própria empresa se `empresa_id` for fornecido
    """
    try:
        # Importar aqui para evitar dependência circular
        from .services import EmpresaService
        service = EmpresaService()
        
        disponivel = await service.verificar_cnpj_disponivel(
            cnpj=cnpj,
            user=current_user,
            empresa_id_ignorar=empresa_id
        )
        
        return {
            "disponivel": disponivel,
            "cnpj": cnpj
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar CNPJ {cnpj}: {str(e)}")
        raise


@router.get("/verificar-nome/{nome}", response_model=dict)
@limiter.limit("10/minute")  # Máximo 10 verificações por minuto
async def verificar_nome(
    request: Request,  # Obrigatório para o rate limiter
    nome: str,
    empresa_id: Optional[str] = Query(None, description="ID da empresa a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um nome de empresa está disponível para uso
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `nome`: Nome a verificar
    - `empresa_id`: UUID da empresa a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "nome": "Fluyt Móveis LTDA"
    }
    ```
    """
    try:
        # Importar aqui para evitar dependência circular
        from .services import EmpresaService
        service = EmpresaService()
        
        disponivel = await service.verificar_nome_disponivel(
            nome=nome,
            user=current_user,
            empresa_id_ignorar=empresa_id
        )
        
        return {
            "disponivel": disponivel,
            "nome": nome
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
        raise


# ENDPOINT DE TESTE PÚBLICO REMOVIDO POR SEGURANÇA
# Use endpoints autenticados para verificar conectividade 