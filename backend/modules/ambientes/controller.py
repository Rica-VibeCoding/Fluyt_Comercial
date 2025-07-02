"""
Controller - Endpoints da API para o módulo de ambientes
Define todas as rotas HTTP e suas validações
"""
import logging
import os
import xml.etree.ElementTree as ET
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile
from fastapi.responses import JSONResponse

from core.auth import get_current_user
from core.database import get_database
from core.exceptions import NotFoundException, ValidationException, DatabaseException
from core.error_handler import handle_exceptions

from .service import AmbienteService
from .schemas import (
    AmbienteCreate, AmbienteUpdate, AmbienteResponse, 
    AmbienteFiltros, AmbienteListResponse,
    AmbienteMaterialCreate, AmbienteMaterialResponse
)

logger = logging.getLogger(__name__)

# Router do módulo ambientes
router = APIRouter(prefix="/ambientes", tags=["Ambientes"])


def get_ambiente_service(db=Depends(get_database)) -> AmbienteService:
    """
    Dependency injection para o service de ambientes
    """
    return AmbienteService(db)


@router.get("/", response_model=AmbienteListResponse)
@handle_exceptions
async def listar_ambientes(
    # Filtros de busca (aceita tanto snake_case quanto camelCase)
    cliente_id: Optional[str] = Query(None, description="UUID do cliente"),
    clienteId: Optional[str] = Query(None, description="UUID do cliente (camelCase)"),
    nome: Optional[str] = Query(None, description="Nome do ambiente (busca parcial)"),
    origem: Optional[str] = Query(None, description="Origem: 'xml' ou 'manual'"),
    valor_min: Optional[float] = Query(None, description="Valor mínimo de venda"),
    valor_max: Optional[float] = Query(None, description="Valor máximo de venda"),
    data_inicio: Optional[str] = Query(None, description="Data início (YYYY-MM-DD)"),
    data_fim: Optional[str] = Query(None, description="Data fim (YYYY-MM-DD)"),
    
    # Incluir materiais
    incluir_materiais: bool = Query(False, description="Incluir dados de materiais na resposta"),
    
    # Paginação
    page: int = Query(1, ge=1, description="Número da página"),
    per_page: int = Query(20, ge=1, le=100, description="Itens por página"),
    
    # Ordenação
    order_by: str = Query("created_at", description="Campo para ordenação"),
    order_direction: str = Query("desc", regex="^(asc|desc)$", description="Direção da ordenação"),
    
    # Dependencies
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Lista ambientes com filtros, paginação e ordenação
    
    **Filtros disponíveis:**
    - cliente_id: Filtra por cliente específico
    - nome: Busca parcial no nome do ambiente
    - origem: Filtra por origem ('xml' ou 'manual')
    - valor_min/valor_max: Faixa de valores de venda
    - data_inicio/data_fim: Período de importação
    
    **Retorna:** Lista paginada com dados do cliente via JOIN
    """
    logger.info(f"Listando ambientes - Usuário: {current_user.id}")
    
    # Prioriza clienteId (camelCase) se fornecido, senão usa cliente_id
    cliente_final = clienteId or cliente_id
    
    # Monta filtros (só campos que existem no schema)
    filtros = AmbienteFiltros(
        cliente_id=cliente_final,
        busca=nome,  # usa busca ao invés de nome
        origem=origem,
        valor_min=valor_min,
        valor_max=valor_max,
        data_inicio=data_inicio,
        data_fim=data_fim
    )
    
    # Paginação e ordenação tratadas separadamente
    paginacao = {
        'page': page,
        'per_page': per_page,
        'order_by': order_by,
        'order_direction': order_direction,
        'incluir_materiais': incluir_materiais  # Adicionar parâmetro
    }
    
    # Busca no service
    resultado = await service.listar_ambientes(filtros, **paginacao)
    
    logger.info(f"Ambientes listados com sucesso - Total: {resultado.total}")
    return resultado


@router.get("/{ambiente_id}", response_model=AmbienteResponse)
@handle_exceptions
async def buscar_ambiente(
    ambiente_id: str,
    incluir_materiais: bool = Query(True, description="Incluir materiais do ambiente"),
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Busca ambiente específico por ID
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    - incluir_materiais: Se deve incluir os materiais na resposta
    
    **Retorna:** Dados completos do ambiente com cliente via JOIN
    """
    logger.info(f"Buscando ambiente {ambiente_id} - Usuário: {current_user.id}")
    
    ambiente = await service.buscar_ambiente_por_id(ambiente_id, incluir_materiais)
    
    logger.info(f"Ambiente {ambiente_id} encontrado com sucesso")
    return ambiente


@router.post("/", response_model=AmbienteResponse, status_code=status.HTTP_201_CREATED)
@handle_exceptions
async def criar_ambiente(
    ambiente_data: AmbienteCreate,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Cria novo ambiente
    
    **Campos obrigatórios:**
    - cliente_id: UUID do cliente
    - nome: Nome do ambiente
    
    **Campos opcionais:**
    - valor_custo_fabrica: Custo de fábrica
    - valor_venda: Valor de venda
    - data_importacao: Data de importação
    - hora_importacao: Hora de importação
    - origem: 'xml' ou 'manual' (padrão: 'manual')
    
    **Retorna:** Dados do ambiente criado
    """
    logger.info(f"Criando ambiente - Usuário: {current_user.id}")
    
    ambiente = await service.criar_ambiente(ambiente_data)
    
    logger.info(f"Ambiente {ambiente.id} criado com sucesso")
    return ambiente


@router.put("/{ambiente_id}", response_model=AmbienteResponse)
@handle_exceptions
async def atualizar_ambiente(
    ambiente_id: str,
    ambiente_data: AmbienteUpdate,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Atualiza ambiente existente
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    - ambiente_data: Dados para atualização (todos opcionais)
    
    **Retorna:** Dados atualizados do ambiente
    """
    logger.info(f"Atualizando ambiente {ambiente_id} - Usuário: {current_user.id}")
    
    ambiente = await service.atualizar_ambiente(ambiente_id, ambiente_data)
    
    logger.info(f"Ambiente {ambiente_id} atualizado com sucesso")
    return ambiente


@router.delete("/{ambiente_id}")
@handle_exceptions
async def excluir_ambiente(
    ambiente_id: str,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Exclui ambiente permanentemente
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    
    **Retorna:** Confirmação da exclusão
    """
    logger.info(f"Excluindo ambiente {ambiente_id} - Usuário: {current_user.id}")
    
    await service.excluir_ambiente(ambiente_id)
    
    logger.info(f"Ambiente {ambiente_id} excluído com sucesso")
    return JSONResponse(
        content={"message": "Ambiente excluído com sucesso"},
        status_code=200
    )


@router.post("/{ambiente_id}/materiais", response_model=AmbienteMaterialResponse, status_code=status.HTTP_201_CREATED)
@handle_exceptions
async def criar_material_ambiente(
    ambiente_id: str,
    material_data: AmbienteMaterialCreate,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Cria ou atualiza material de um ambiente (UPSERT)
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    - material_data: Dados do material em formato JSON
    
    **Retorna:** Dados do material criado/atualizado
    """
    logger.info(f"Criando material para ambiente {ambiente_id} - Usuário: {current_user.id}")
    
    material = await service.criar_material_ambiente(ambiente_id, material_data)
    
    logger.info(f"Material criado para ambiente {ambiente_id}")
    return material


@router.get("/{ambiente_id}/materiais", response_model=List[AmbienteMaterialResponse])
@handle_exceptions
async def obter_materiais_ambiente(
    ambiente_id: str,
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Obtém todos os materiais de um ambiente
    
    **Parâmetros:**
    - ambiente_id: UUID do ambiente
    
    **Retorna:** Lista de materiais do ambiente
    """
    logger.info(f"Buscando materiais do ambiente {ambiente_id} - Usuário: {current_user.id}")
    
    materiais = await service.obter_materiais_ambiente(ambiente_id)
    
    logger.info(f"Materiais do ambiente {ambiente_id} obtidos - Total: {len(materiais)}")
    return materiais


@router.post("/importar-xml")
@handle_exceptions
async def importar_xml(
    cliente_id: str = Query(..., description="UUID do cliente"),
    arquivo: UploadFile = File(..., description="Arquivo XML do Promob"),
    current_user = Depends(get_current_user),
    service: AmbienteService = Depends(get_ambiente_service)
):
    """
    Importa ambiente a partir de arquivo XML do Promob
    
    **Parâmetros:**
    - cliente_id: UUID do cliente para associar o ambiente
    - arquivo: Arquivo XML (multipart/form-data)
    
    **Retorna:** Dados do ambiente criado
    """
    # Validações de segurança aprimoradas
    
    # 1. Validar nome do arquivo - previne path traversal
    filename_clean = os.path.basename(arquivo.filename)
    if not filename_clean or filename_clean != arquivo.filename:
        raise HTTPException(
            status_code=400,
            detail="Nome de arquivo inválido"
        )
    
    # 2. Validar extensão - mais restritivo
    if not filename_clean.lower().endswith('.xml'):
        raise HTTPException(
            status_code=400,
            detail="Apenas arquivos .xml são permitidos"
        )
    
    # 3. Validar content-type
    allowed_content_types = [
        'application/xml',
        'text/xml',
        'application/octet-stream'  # Alguns browsers enviam isso para XML
    ]
    if arquivo.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo inválido: {arquivo.content_type}"
        )
    
    # 4. Validar tamanho (máximo 10MB)
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    if arquivo.size and arquivo.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Arquivo muito grande (máximo 10MB)"
        )
    
    logger.info(f"Importando XML '{arquivo.filename}' - Cliente: {cliente_id} - Usuário: {current_user.id}")
    
    # Ler conteúdo do arquivo
    conteudo_xml = await arquivo.read()
    
    # 5. Validar que não está vazio
    if not conteudo_xml:
        raise HTTPException(
            status_code=400,
            detail="Arquivo XML está vazio"
        )
    
    # 6. Decodificar e validar estrutura básica do XML
    try:
        conteudo_str = conteudo_xml.decode('utf-8')
    except UnicodeDecodeError:
        try:
            # Tentar latin-1 como fallback
            conteudo_str = conteudo_xml.decode('latin-1')
        except:
            raise HTTPException(
                status_code=400,
                detail="Erro ao decodificar arquivo - encoding inválido"
            )
    
    # 7. Validar estrutura XML básica
    try:
        # Parse básico para verificar se é XML válido
        root = ET.fromstring(conteudo_str)
    except ET.ParseError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo XML inválido: {str(e)}"
        )
    
    # Chamar o service para processar o XML
    try:
        ambiente_criado = await service.importar_xml_ambiente(
            cliente_id=cliente_id,
            conteudo_xml=conteudo_str,
            nome_arquivo=arquivo.filename
        )
        
        logger.info(f"Ambiente {ambiente_criado.id} criado via XML com sucesso")
        
        return ambiente_criado
    except ValidationException as e:
        logger.error(f"Erro de validação ao importar XML: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado ao importar XML: {type(e).__name__}: {str(e)}")
        raise
 
