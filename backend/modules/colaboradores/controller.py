"""
Controller - Endpoints da API para tipos de colaboradores
Define todas as rotas HTTP para gerenciar tipos de colaboradores
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
    TipoColaboradorCreate,
    TipoColaboradorUpdate,
    TipoColaboradorResponse,
    TipoColaboradorListResponse,
    FiltrosTipoColaborador,
    ColaboradorCreate,
    ColaboradorUpdate,
    ColaboradorResponse,
    ColaboradorListResponse,
    FiltrosColaborador
)
from .services import TipoColaboradorService, ColaboradorService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/tipos-colaborador", tags=["tipos-colaborador"])

# Instância do serviço
tipo_colaborador_service = TipoColaboradorService()


@router.get("/", response_model=TipoColaboradorListResponse)
async def listar_tipos_colaborador(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome ou descrição"),
    categoria: Optional[str] = Query(None, description="Categoria: FUNCIONARIO ou PARCEIRO"),
    tipo_percentual: Optional[str] = Query(None, description="Tipo: VENDA ou CUSTO"),
    ativo: Optional[bool] = Query(None, description="Filtro por status ativo/inativo"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: User = Depends(get_current_user)
) -> TipoColaboradorListResponse:
    """
    Lista tipos de colaboradores do sistema com filtros e paginação
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome e descrição
    - `categoria`: FUNCIONARIO ou PARCEIRO
    - `tipo_percentual`: VENDA ou CUSTO
    - `ativo`: true/false para filtrar por status
    
    **Paginação:**
    - `page`: Página atual (padrão: 1)
    - `limit`: Itens por página (padrão: 20, máximo: 100)
    
    **Response:**
    ```json
    {
        "items": [
            {
                "id": "uuid",
                "nome": "Vendedor Senior",
                "categoria": "FUNCIONARIO",
                "tipo_percentual": "VENDA",
                "percentual_valor": 5.0,
                "salario_base": 0.0,
                "valor_por_servico": 0.0,
                "minimo_garantido": 0.0,
                "ativo": true,
                "created_at": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 15,
        "page": 1,
        "limit": 20,
        "pages": 1
    }
    ```
    """
    try:
        # Monta filtros
        filtros = FiltrosTipoColaborador(
            busca=busca,
            categoria=categoria,
            tipo_percentual=tipo_percentual,
            ativo=ativo
        )
        
        # Chama o serviço
        resultado = await tipo_colaborador_service.listar_tipos_colaborador(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de tipos de colaboradores: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar tipos de colaboradores: {str(e)}")
        raise


@router.get("/{tipo_id}", response_model=TipoColaboradorResponse)
async def buscar_tipo_colaborador(
    tipo_id: str,
    current_user: User = Depends(get_current_user)
) -> TipoColaboradorResponse:
    """
    Busca um tipo de colaborador específico pelo ID
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `tipo_id`: UUID do tipo de colaborador
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "Vendedor Senior",
        "categoria": "FUNCIONARIO",
        "tipo_percentual": "VENDA",
        "percentual_valor": 5.0,
        "salario_base": 0.0,
        "valor_por_servico": 0.0,
        "minimo_garantido": 0.0,
        "descricao": "Vendedor com experiência",
        "opcional_no_orcamento": false,
        "ativo": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
    ```
    """
    try:
        tipo = await tipo_colaborador_service.buscar_tipo_colaborador(tipo_id, current_user)
        
        logger.info(f"Tipo de colaborador consultado: {tipo_id} por usuário {current_user.id}")
        
        return tipo
    
    except Exception as e:
        logger.error(f"Erro ao buscar tipo de colaborador {tipo_id}: {str(e)}")
        raise


@router.post("/", response_model=TipoColaboradorResponse, status_code=status.HTTP_201_CREATED)
async def criar_tipo_colaborador(
    dados: TipoColaboradorCreate,
    current_user: User = Depends(get_current_user)
) -> TipoColaboradorResponse:
    """
    Cria um novo tipo de colaborador
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Body:**
    ```json
    {
        "nome": "Vendedor Senior",
        "categoria": "FUNCIONARIO",
        "tipo_percentual": "VENDA",
        "percentual_valor": 5.0,
        "descricao": "Vendedor com experiência",
        "opcional_no_orcamento": false
    }
    ```
    
    **Regras:**
    - Nome não pode estar duplicado no sistema
    - Apenas UMA base de pagamento pode ser definida:
      * percentual_valor (%)
      * salario_base (R$)
      * valor_por_servico (R$)
      * minimo_garantido (R$)
    - Categoria: FUNCIONARIO ou PARCEIRO
    - Tipo percentual: VENDA ou CUSTO
    """
    try:
        tipo = await tipo_colaborador_service.criar_tipo_colaborador(dados, current_user)
        
        logger.info(f"Tipo de colaborador criado: {tipo.id} por usuário {current_user.id}")
        
        return tipo
    
    except Exception as e:
        logger.error(f"Erro ao criar tipo de colaborador: {str(e)}")
        raise


@router.put("/{tipo_id}", response_model=TipoColaboradorResponse)
async def atualizar_tipo_colaborador(
    tipo_id: str,
    dados: TipoColaboradorUpdate,
    current_user: User = Depends(get_current_user)
) -> TipoColaboradorResponse:
    """
    Atualiza dados de um tipo de colaborador existente
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Parâmetros:**
    - `tipo_id`: UUID do tipo de colaborador
    
    **Body:** (todos os campos são opcionais)
    ```json
    {
        "nome": "Vendedor Pleno",
        "percentual_valor": 4.0,
        "descricao": "Vendedor com experiência média"
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - Nome não pode conflitar com outro tipo
    - Se alterar base de pagamento, apenas UMA pode estar definida
    """
    try:
        tipo = await tipo_colaborador_service.atualizar_tipo_colaborador(tipo_id, dados, current_user)
        
        logger.info(f"Tipo de colaborador atualizado: {tipo_id} por usuário {current_user.id}")
        
        return tipo
    
    except Exception as e:
        logger.error(f"Erro ao atualizar tipo de colaborador {tipo_id}: {str(e)}")
        raise


@router.delete("/{tipo_id}", response_model=SuccessResponse)
async def excluir_tipo_colaborador(
    tipo_id: str,
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Desativa um tipo de colaborador (soft delete - marca como inativo)
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Parâmetros:**
    - `tipo_id`: UUID do tipo de colaborador
    
    **Regras:**
    - Apenas SUPER_ADMIN pode desativar tipos
    - Tipo é marcado como inativo, NÃO deletado fisicamente
    - Dados são preservados para auditoria e possível reativação
    - Histórico é mantido
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Tipo de colaborador desativado com sucesso"
    }
    ```
    """
    try:
        # Usa o método de soft delete (desativar)
        sucesso = await tipo_colaborador_service.desativar_tipo_colaborador(tipo_id, current_user)
        
        if sucesso:
            logger.info(f"Tipo de colaborador desativado (soft delete): {tipo_id} por usuário {current_user.id}")
            return SuccessResponse(message="Tipo de colaborador desativado com sucesso")
        else:
            raise Exception("Falha ao desativar tipo de colaborador")
    
    except Exception as e:
        logger.error(f"Erro ao desativar tipo de colaborador {tipo_id}: {str(e)}")
        raise


@router.get("/verificar-nome/{nome}", response_model=dict)
@limiter.limit("10/minute")  # Máximo 10 verificações por minuto
async def verificar_nome(
    request: Request,  # Obrigatório para o rate limiter
    nome: str,
    tipo_id: Optional[str] = Query(None, description="ID do tipo a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um nome de tipo está disponível para uso
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `nome`: Nome a verificar
    - `tipo_id`: UUID do tipo a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "nome": "Vendedor Senior"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se nome já existe
    - Ignora o próprio tipo se `tipo_id` for fornecido
    """
    try:
        # Importar aqui para evitar dependência circular
        from .services import TipoColaboradorService
        service = TipoColaboradorService()
        
        disponivel = await service.verificar_nome_disponivel(
            nome=nome,
            user=current_user,
            tipo_id_ignorar=tipo_id
        )
        
        return {
            "disponivel": disponivel,
            "nome": nome
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
        raise


# ========================================
# ROUTER PARA COLABORADORES INDIVIDUAIS
# ========================================

# Router separado para colaboradores individuais
colaboradores_router = APIRouter(prefix="/colaboradores", tags=["colaboradores"])

# Instância do serviço
colaborador_service = ColaboradorService()


@colaboradores_router.get("/", response_model=ColaboradorListResponse)
async def listar_colaboradores(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome, email ou CPF"),
    tipo_colaborador_id: Optional[str] = Query(None, description="ID do tipo de colaborador"),
    categoria: Optional[str] = Query(None, description="Categoria: FUNCIONARIO ou PARCEIRO"),
    ativo: Optional[bool] = Query(None, description="Filtro por status ativo/inativo"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: User = Depends(get_current_user)
) -> ColaboradorListResponse:
    """
    Lista colaboradores do sistema com filtros e paginação
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome, email e CPF
    - `tipo_colaborador_id`: Filtra por tipo específico
    - `categoria`: FUNCIONARIO ou PARCEIRO
    - `ativo`: true/false para filtrar por status
    
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
                "tipo_colaborador_id": "uuid",
                "tipo_colaborador_nome": "Vendedor Senior",
                "tipo_colaborador_categoria": "FUNCIONARIO",
                "cpf": "12345678901",
                "telefone": "11999999999",
                "email": "joao@empresa.com",
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
        filtros = FiltrosColaborador(
            busca=busca,
            tipo_colaborador_id=tipo_colaborador_id,
            categoria=categoria,
            ativo=ativo
        )
        
        # Chama o serviço
        resultado = await colaborador_service.listar_colaboradores(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de colaboradores: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar colaboradores: {str(e)}")
        raise


@colaboradores_router.get("/{colaborador_id}", response_model=ColaboradorResponse)
async def buscar_colaborador(
    colaborador_id: str,
    current_user: User = Depends(get_current_user)
) -> ColaboradorResponse:
    """
    Busca um colaborador específico pelo ID
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `colaborador_id`: UUID do colaborador
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "João Silva",
        "tipo_colaborador_id": "uuid",
        "tipo_colaborador_nome": "Vendedor Senior",
        "tipo_colaborador_categoria": "FUNCIONARIO",
        "cpf": "12345678901",
        "telefone": "11999999999",
        "email": "joao@empresa.com",
        "endereco": "Rua das Flores, 123",
        "data_admissao": "2024-01-01",
        "observacoes": "Colaborador experiente",
        "ativo": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }
    ```
    """
    try:
        colaborador = await colaborador_service.buscar_colaborador(colaborador_id, current_user)
        
        logger.info(f"Colaborador consultado: {colaborador_id} por usuário {current_user.id}")
        
        return colaborador
    
    except Exception as e:
        logger.error(f"Erro ao buscar colaborador {colaborador_id}: {str(e)}")
        raise


@colaboradores_router.post("/", response_model=ColaboradorResponse, status_code=status.HTTP_201_CREATED)
async def criar_colaborador(
    dados: ColaboradorCreate,
    current_user: User = Depends(get_current_user)
) -> ColaboradorResponse:
    """
    Cria um novo colaborador
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Body:**
    ```json
    {
        "nome": "João Silva",
        "tipo_colaborador_id": "uuid",
        "cpf": "12345678901",
        "telefone": "11999999999",
        "email": "joao@empresa.com",
        "endereco": "Rua das Flores, 123",
        "data_admissao": "2024-01-01",
        "observacoes": "Colaborador experiente"
    }
    ```
    
    **Regras:**
    - Nome e tipo_colaborador_id são obrigatórios
    - CPF deve ser válido e único (se fornecido)
    - Email deve ser válido e único (se fornecido)
    - Telefone deve ter 10-11 dígitos (se fornecido)
    - Data admissão não pode ser futura
    - Tipo de colaborador deve existir e estar ativo
    """
    try:
        colaborador = await colaborador_service.criar_colaborador(dados, current_user)
        
        logger.info(f"Colaborador criado: {colaborador.id} por usuário {current_user.id}")
        
        return colaborador
    
    except Exception as e:
        logger.error(f"Erro ao criar colaborador: {str(e)}")
        raise


@colaboradores_router.put("/{colaborador_id}", response_model=ColaboradorResponse)
async def atualizar_colaborador(
    colaborador_id: str,
    dados: ColaboradorUpdate,
    current_user: User = Depends(get_current_user)
) -> ColaboradorResponse:
    """
    Atualiza dados de um colaborador existente
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Parâmetros:**
    - `colaborador_id`: UUID do colaborador
    
    **Body:** (todos os campos são opcionais)
    ```json
    {
        "nome": "João Santos Silva",
        "telefone": "11888888888",
        "endereco": "Nova Rua, 456"
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - CPF não pode conflitar com outro colaborador
    - Email não pode conflitar com outro colaborador
    - Tipo deve existir se alterado
    """
    try:
        colaborador = await colaborador_service.atualizar_colaborador(colaborador_id, dados, current_user)
        
        logger.info(f"Colaborador atualizado: {colaborador_id} por usuário {current_user.id}")
        
        return colaborador
    
    except Exception as e:
        logger.error(f"Erro ao atualizar colaborador {colaborador_id}: {str(e)}")
        raise


@colaboradores_router.delete("/{colaborador_id}", response_model=SuccessResponse)
async def excluir_colaborador(
    colaborador_id: str,
    current_user: User = Depends(get_current_user)
) -> SuccessResponse:
    """
    Desativa um colaborador (soft delete - marca como inativo)
    
    **Acesso:** Apenas SUPER_ADMIN
    
    **Parâmetros:**
    - `colaborador_id`: UUID do colaborador
    
    **Regras:**
    - Apenas SUPER_ADMIN pode desativar colaboradores
    - Colaborador é marcado como inativo, NÃO deletado fisicamente
    - Dados são preservados para auditoria e possível reativação
    - Histórico é mantido
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Colaborador desativado com sucesso"
    }
    ```
    """
    try:
        # Usa o método de soft delete (desativar)
        sucesso = await colaborador_service.desativar_colaborador(colaborador_id, current_user)
        
        if sucesso:
            logger.info(f"Colaborador desativado (soft delete): {colaborador_id} por usuário {current_user.id}")
            return SuccessResponse(message="Colaborador desativado com sucesso")
        else:
            raise Exception("Falha ao desativar colaborador")
    
    except Exception as e:
        logger.error(f"Erro ao desativar colaborador {colaborador_id}: {str(e)}")
        raise


@colaboradores_router.get("/verificar-cpf/{cpf}", response_model=dict)
@limiter.limit("10/minute")  # Máximo 10 verificações por minuto
async def verificar_cpf(
    request: Request,  # Obrigatório para o rate limiter
    cpf: str,
    colaborador_id: Optional[str] = Query(None, description="ID do colaborador a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um CPF está disponível para uso
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `cpf`: CPF a verificar (apenas números ou formatado)
    - `colaborador_id`: UUID do colaborador a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "cpf": "12345678901"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se CPF já existe
    - Ignora o próprio colaborador se `colaborador_id` for fornecido
    """
    try:
        # Importar aqui para evitar dependência circular
        from .services import ColaboradorService
        service = ColaboradorService()
        
        disponivel = await service.verificar_cpf_disponivel(
            cpf=cpf,
            user=current_user,
            colaborador_id_ignorar=colaborador_id
        )
        
        return {
            "disponivel": disponivel,
            "cpf": cpf
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar CPF {cpf}: {str(e)}")
        raise


@colaboradores_router.get("/verificar-email/{email}", response_model=dict)
@limiter.limit("10/minute")  # Máximo 10 verificações por minuto
async def verificar_email(
    request: Request,  # Obrigatório para o rate limiter
    email: str,
    colaborador_id: Optional[str] = Query(None, description="ID do colaborador a ignorar (para edição)"),
    current_user: User = Depends(get_current_user)
) -> dict:
    """
    Verifica se um email está disponível para uso
    
    **Acesso:** Apenas SUPER_ADMIN e ADMIN
    
    **Parâmetros:**
    - `email`: Email a verificar
    - `colaborador_id`: UUID do colaborador a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "email": "joao@empresa.com"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se email já existe
    - Ignora o próprio colaborador se `colaborador_id` for fornecido
    """
    try:
        # Importar aqui para evitar dependência circular
        from .services import ColaboradorService
        service = ColaboradorService()
        
        disponivel = await service.verificar_email_disponivel(
            email=email,
            user=current_user,
            colaborador_id_ignorar=colaborador_id
        )
        
        return {
            "disponivel": disponivel,
            "email": email
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar email {email}: {str(e)}")
        raise 