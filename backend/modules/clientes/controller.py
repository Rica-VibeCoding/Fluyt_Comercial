"""
Controller - Endpoints da API para clientes
Define todas as rotas HTTP para gerenciar clientes
"""
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, Query, status, HTTPException, Request

from core.dependencies import get_current_user
from core.rate_limiter import limiter
from core.dependencies import (
    get_pagination,
    PaginationParams,
    SuccessResponse
)
from core.exceptions import NotFoundException, ConflictException

from .schemas import (
    ClienteCreate,
    ClienteUpdate,
    ClienteResponse,
    ClienteListResponse,
    FiltrosCliente
)
from .services import ClienteService

logger = logging.getLogger(__name__)

# Router do módulo
router = APIRouter(prefix="/clientes", tags=["clientes"])

# Instância do serviço
cliente_service = ClienteService()


@router.get("/", response_model=ClienteListResponse)
async def listar_clientes(
    # Filtros opcionais
    busca: Optional[str] = Query(None, description="Busca por nome, CPF/CNPJ ou telefone"),
    tipo_venda: Optional[str] = Query(None, description="Tipo de venda: NORMAL ou FUTURA"),
    vendedor_id: Optional[str] = Query(None, description="ID do vendedor"),
    procedencia_id: Optional[str] = Query(None, description="ID da procedência"),
    data_inicio: Optional[str] = Query(None, description="Data início (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim (YYYY-MM-DD)"),
    
    # Paginação
    pagination: PaginationParams = Depends(get_pagination),
    
    # Usuário logado
    current_user: dict = Depends(get_current_user)
) -> ClienteListResponse:
    """
    Lista clientes da loja do usuário com filtros e paginação
    
    **Filtros disponíveis:**
    - `busca`: Procura em nome, CPF/CNPJ e telefone
    - `tipo_venda`: NORMAL ou FUTURA
    - `vendedor_id`: UUID do vendedor
    - `procedencia_id`: UUID da procedência
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
        filtros = FiltrosCliente(
            busca=busca,
            tipo_venda=tipo_venda,
            vendedor_id=vendedor_id,
            procedencia_id=procedencia_id
        )
        
        # Se data_inicio e data_fim foram fornecidas, converte para datetime
        if data_inicio:
            filtros.data_inicio = datetime.fromisoformat(data_inicio)
        
        if data_fim:
            filtros.data_fim = datetime.fromisoformat(data_fim)
        
        # Chama o serviço
        resultado = await cliente_service.listar_clientes(
            user=current_user,
            filtros=filtros,
            pagination=pagination
        )
        
        logger.info(
            f"Listagem de clientes: {len(resultado.items)} itens "
            f"(página {pagination.page}) para usuário {current_user.id}"
        )
        
        return resultado
    
    except Exception as e:
        logger.error(f"Erro ao listar clientes: {str(e)}")
        raise


@router.get("/{cliente_id}", response_model=ClienteResponse)
async def buscar_cliente(
    cliente_id: str,
    current_user: dict = Depends(get_current_user)
) -> ClienteResponse:
    """
    Busca um cliente específico pelo ID
    
    **Parâmetros:**
    - `cliente_id`: UUID do cliente
    
    **Response:**
    ```json
    {
        "id": "uuid",
        "nome": "João Silva",
        "cpf_cnpj": "12345678901",
        "telefone": "11999999999",
        "vendedor_nome": "Maria Santos",
        "procedencia": "Facebook",
        ...
    }
    ```
    """
    try:
        cliente = await cliente_service.buscar_cliente(cliente_id, current_user)
        
        logger.info(f"Cliente consultado: {cliente_id} por usuário {current_user.id}")
        
        return cliente
    
    except Exception as e:
        logger.error(f"Erro ao buscar cliente {cliente_id}: {str(e)}")
        raise


@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
async def criar_cliente(
    dados: ClienteCreate,
    current_user: dict = Depends(get_current_user)
) -> ClienteResponse:
    """
    Cria um novo cliente
    
    **Body:**
    ```json
    {
        "nome": "João Silva",
        "cpf_cnpj": "12345678901",
        "telefone": "11999999999",
        "email": "joao@email.com",
        "tipo_venda": "NORMAL",
        "logradouro": "Rua das Flores, 123",
        "bairro": "Centro",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "01234567",
        "vendedor_id": "uuid-vendedor",
        "procedencia_id": "uuid-procedencia"
    }
    ```
    
    **Regras:**
    - CPF/CNPJ não pode estar duplicado na mesma loja
    - Se vendedor_id não for informado, usa o usuário atual (se for vendedor)
    - Todos os campos de endereço são opcionais
    - Email é opcional mas deve ser válido se informado
    """
    try:
        cliente = await cliente_service.criar_cliente(dados, current_user)
        
        logger.info(f"Cliente criado: {cliente.id} por usuário {current_user.id}")
        
        return cliente
    
    except Exception as e:
        logger.error(f"Erro ao criar cliente: {str(e)}")
        raise


@router.put("/{cliente_id}", response_model=ClienteResponse)
async def atualizar_cliente(
    cliente_id: str,
    dados: ClienteUpdate,
    current_user: dict = Depends(get_current_user)
) -> ClienteResponse:
    """
    Atualiza dados de um cliente existente
    
    **Parâmetros:**
    - `cliente_id`: UUID do cliente
    
    **Body:** (todos os campos são opcionais)
    ```json
    {
        "nome": "João Silva Santos",
        "telefone": "11888888888",
        "endereco": "Nova Rua, 456"
    }
    ```
    
    **Regras:**
    - Apenas campos fornecidos serão atualizados
    - CPF/CNPJ não pode conflitar com outro cliente
    - Usuário deve ter acesso ao cliente (mesma loja)
    """
    try:
        cliente = await cliente_service.atualizar_cliente(cliente_id, dados, current_user)
        
        logger.info(f"Cliente atualizado: {cliente_id} por usuário {current_user.id}")
        
        return cliente
    
    except Exception as e:
        logger.error(f"Erro ao atualizar cliente {cliente_id}: {str(e)}")
        raise


@router.get("/{cliente_id}/dados-relacionados", response_model=dict)
async def contar_dados_relacionados(
    cliente_id: str,
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Conta dados relacionados ao cliente antes da exclusão
    
    **Parâmetros:**
    - `cliente_id`: UUID do cliente
    
    **Retorna:**
    ```json
    {
        "ambientes": 3,
        "orcamentos": 1, 
        "materiais": 15
    }
    ```
    """
    try:
        contadores = await cliente_service.contar_dados_relacionados(cliente_id, current_user)
        return contadores
    
    except Exception as e:
        logger.error(f"Erro ao contar dados relacionados do cliente {cliente_id}: {str(e)}")
        raise


@router.delete("/{cliente_id}", response_model=SuccessResponse)
async def excluir_cliente(
    cliente_id: str,
    current_user: dict = Depends(get_current_user)
) -> SuccessResponse:
    """
    Exclui um cliente (soft delete)
    
    **Parâmetros:**
    - `cliente_id`: UUID do cliente
    
    **Regras:**
    - Apenas administradores podem excluir clientes
    - Cliente é marcado com status "Rejeitado", não deletado fisicamente
    - Histórico de orçamentos/contratos é preservado
    
    **Response:**
    ```json
    {
        "success": true,
        "message": "Cliente excluído com sucesso"
    }
    ```
    """
    try:
        sucesso = await cliente_service.excluir_cliente(cliente_id, current_user)
        
        if sucesso:
            logger.info(f"Cliente excluído: {cliente_id} por usuário {current_user.id}")
            return SuccessResponse(message="Cliente excluído com sucesso")
        else:
            raise Exception("Falha ao excluir cliente")
    
    except Exception as e:
        logger.error(f"Erro ao excluir cliente {cliente_id}: {str(e)}")
        raise


@router.get("/verificar-cpf-cnpj/{cpf_cnpj}", response_model=dict)
@limiter.limit("10/minute")
async def verificar_cpf_cnpj(
    request: Request,
    cpf_cnpj: str,
    cliente_id: Optional[str] = Query(None, description="ID do cliente a ignorar (para edição)"),
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Verifica se um CPF/CNPJ está disponível para uso
    
    **Parâmetros:**
    - `cpf_cnpj`: CPF ou CNPJ a verificar (apenas números)
    - `cliente_id`: UUID do cliente a ignorar (opcional, para edição)
    
    **Response:**
    ```json
    {
        "disponivel": true,
        "cpf_cnpj": "12345678901"
    }
    ```
    
    **Uso:**
    - Para validação em tempo real durante cadastro/edição
    - Retorna `disponivel: false` se CPF/CNPJ já existe
    - Ignora o próprio cliente se `cliente_id` for fornecido
    """
    try:
        disponivel = await cliente_service.verificar_cpf_cnpj_disponivel(
            cpf_cnpj=cpf_cnpj,
            user=current_user,
            cliente_id_ignorar=cliente_id
        )
        
        return {
            "disponivel": disponivel,
            "cpf_cnpj": cpf_cnpj
        }
    
    except Exception as e:
        logger.error(f"Erro ao verificar CPF/CNPJ {cpf_cnpj}: {str(e)}")
        raise






@router.get("/procedencias-public", response_model=List[dict])
async def listar_procedencias_publico() -> List[dict]:
    """
    Endpoint PÚBLICO para buscar procedências (sem autenticação)
    Lista todas as procedências ativas sem necessidade de token
    """
    try:
        # Busca procedências usando cliente admin (bypassa RLS)
        from core.database import get_admin_database
        supabase = get_admin_database()
        
        result = supabase.table('c_procedencias').select('*').eq('ativo', True).order('nome').execute()
        
        return result.data
    
    except Exception as e:
        logger.error(f"Erro ao listar procedências público: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar procedências"
        )


@router.get("/procedencias", response_model=List[dict])
async def listar_procedencias() -> List[dict]:
    """
    Lista todas as procedências ativas
    
    **Retorna:**
    ```json
    [
        {
            "id": "uuid",
            "nome": "Facebook",
            "ativo": true
        }
    ]
    ```
    """
    try:
        # Busca procedências usando cliente admin (bypassa RLS)
        from core.database import get_admin_database
        supabase = get_admin_database()
        
        result = supabase.table('c_procedencias').select('*').eq('ativo', True).order('nome').execute()
        
        return result.data
    
    except Exception as e:
        logger.error(f"Erro ao listar procedências: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao buscar procedências"
        )




