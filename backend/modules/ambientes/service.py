"""Service de ambientes - lógica de negócios e validações"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from decimal import Decimal
from supabase import Client
from core.exceptions import NotFoundException, ValidationException, DatabaseException
from .repository import AmbienteRepository
from .schemas import (
    AmbienteCreate, AmbienteUpdate, AmbienteResponse, 
    AmbienteFiltros, AmbienteListResponse,
    AmbienteMaterialCreate, AmbienteMaterialResponse
)
from .xml_importer import XMLImporter

logger = logging.getLogger(__name__)

class AmbienteService:
    """
    Service responsável pela lógica de negócio dos ambientes.
    
    Responsabilidades:
    - Validação de regras de negócio
    - Coordenação entre repository e importador XML
    - Conversão de tipos de dados
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o service com a conexão do banco.
        
        Args:
            db: Cliente Supabase configurado
        """
        self.repository = AmbienteRepository(db)
        self.xml_importer = XMLImporter(self)
    
    async def listar_ambientes(self, filtros: Optional[AmbienteFiltros] = None, **paginacao) -> AmbienteListResponse:
        """Lista ambientes com filtros e paginação"""
        try:
            if not filtros:
                filtros = AmbienteFiltros()
            
            # Paginação vem como parâmetros separados
            page = paginacao.get('page', 1)
            per_page = paginacao.get('per_page', 20)
            order_by = paginacao.get('order_by', 'created_at')
            order_direction = paginacao.get('order_direction', 'desc')
            incluir_materiais = paginacao.get('incluir_materiais', False)
            
            if page < 1:
                raise ValidationException("Página deve ser maior que 0")
            if per_page < 1 or per_page > 100:
                raise ValidationException("Tamanho da página deve estar entre 1 e 100")
            filtros_dict = filtros.model_dump(exclude_unset=True) if hasattr(filtros, 'model_dump') else filtros.dict(exclude_unset=True)
            
            # Debug log
            logger.info(f"🔍 Service.listar_ambientes: incluir_materiais={incluir_materiais}")
            
            # Adicionar paginação aos filtros
            filtros_dict.update({
                'page': page,
                'per_page': per_page,
                'order_by': order_by,
                'order_direction': order_direction,
                'include_materiais': incluir_materiais
            })
            
            resultado = await self.repository.listar(**filtros_dict)
            items = [AmbienteResponse(**item) for item in resultado['items']]
            return AmbienteListResponse(
                items=items,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Erro ao listar ambientes: {str(e)}")
            raise DatabaseException(f"Erro interno ao listar ambientes: {str(e)}")
    
    async def buscar_ambiente_por_id(self, ambiente_id: str, incluir_materiais: bool = False) -> AmbienteResponse:
        """Busca um ambiente específico por ID"""
        try:
            self._validar_id(ambiente_id)
            ambiente_dict = await self.repository.buscar_por_id(
                ambiente_id=ambiente_id,
                include_materiais=incluir_materiais
            )
            if not ambiente_dict:
                raise NotFoundException(f"Ambiente com ID {ambiente_id} não encontrado")
            return AmbienteResponse(**ambiente_dict)
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao buscar ambiente: {str(e)}")
    
    async def criar_ambiente(self, dados: AmbienteCreate) -> AmbienteResponse:
        """Cria um novo ambiente"""
        try:
            await self._validar_dados_ambiente(dados)
            dados_dict = dados.model_dump() if hasattr(dados, 'model_dump') else dados.dict()
            ambiente_dict = await self.repository.criar_ambiente(dados_dict)
            return AmbienteResponse(**ambiente_dict)
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar ambiente: {str(e)}")
            raise DatabaseException(f"Erro interno ao criar ambiente: {str(e)}")
    
    async def atualizar_ambiente(self, ambiente_id: str, dados: AmbienteUpdate) -> AmbienteResponse:
        """Atualiza um ambiente existente"""
        try:
            self._validar_id(ambiente_id)
            await self.buscar_ambiente_por_id(ambiente_id)
            await self._validar_dados_ambiente_update(dados)
            dados_dict = dados.model_dump(exclude_unset=True) if hasattr(dados, 'model_dump') else dados.dict(exclude_unset=True)
            ambiente_dict = await self.repository.atualizar_ambiente(ambiente_id, dados_dict)
            return AmbienteResponse(**ambiente_dict)
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao atualizar ambiente: {str(e)}")
    
    async def excluir_ambiente(self, ambiente_id: str) -> bool:
        """Exclui um ambiente (DELETE real)"""
        try:
            self._validar_id(ambiente_id)
            await self.buscar_ambiente_por_id(ambiente_id)
            return await self.repository.excluir_ambiente(ambiente_id)
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao excluir ambiente: {str(e)}")
    
    async def criar_material_ambiente(self, ambiente_id: str, dados: AmbienteMaterialCreate) -> AmbienteMaterialResponse:
        """Cria/atualiza materiais de um ambiente"""
        try:
            await self.buscar_ambiente_por_id(ambiente_id)
            if not dados.materiais_json:
                raise ValidationException("Dados de materiais são obrigatórios")
            dados_dict = dados.model_dump() if hasattr(dados, 'model_dump') else dados.dict()
            return await self.repository.criar_material_ambiente(dados_dict)
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao criar materiais ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao criar materiais: {str(e)}")
    
    async def obter_materiais_ambiente(self, ambiente_id: str) -> Optional[AmbienteMaterialResponse]:
        """Obtém materiais de um ambiente"""
        try:
            await self.buscar_ambiente_por_id(ambiente_id)
            return await self.repository.obter_materiais_ambiente(ambiente_id)
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao obter materiais ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao obter materiais: {str(e)}")
    
    def _validar_id(self, ambiente_id: str) -> None:
        if not ambiente_id or not ambiente_id.strip():
            raise ValidationException("ID do ambiente é obrigatório")
    
    def _validar_nome(self, nome: Optional[str], obrigatorio: bool = True) -> None:
        if obrigatorio and (not nome or not nome.strip()):
            raise ValidationException("Nome do ambiente é obrigatório")
        if nome is not None and nome.strip() and len(nome.strip()) < 2:
            raise ValidationException("Nome do ambiente deve ter pelo menos 2 caracteres")
    
    def _validar_valores_monetarios(self, valor_custo: Optional[float], valor_venda: Optional[float]) -> None:
        if valor_custo is not None and valor_custo < 0:
            raise ValidationException("Valor de custo não pode ser negativo")
        if valor_venda is not None and valor_venda < 0:
            raise ValidationException("Valor de venda não pode ser negativo")
    
    def _validar_origem(self, origem: Optional[str], obrigatorio: bool = True) -> None:
        origens_validas = ['xml', 'manual']
        if obrigatorio and origem not in origens_validas:
            raise ValidationException("Origem deve ser 'xml' ou 'manual'")
        if not obrigatorio and origem is not None and origem not in origens_validas:
            raise ValidationException("Origem deve ser 'xml' ou 'manual'")
    
    async def _validar_dados_ambiente(self, dados: AmbienteCreate) -> None:
        self._validar_nome(dados.nome)
        self._validar_valores_monetarios(dados.valor_custo_fabrica, dados.valor_venda)
        self._validar_origem(dados.origem)
        if dados.origem == 'xml':
            if not dados.data_importacao:
                raise ValidationException("Data de importação é obrigatória para origem XML")
            if not dados.hora_importacao:
                raise ValidationException("Hora de importação é obrigatória para origem XML")
    
    async def _validar_dados_ambiente_update(self, dados: AmbienteUpdate) -> None:
        self._validar_nome(dados.nome, obrigatorio=False)
        self._validar_valores_monetarios(dados.valor_custo_fabrica, dados.valor_venda)
        self._validar_origem(dados.origem, obrigatorio=False)
    async def importar_xml_ambiente(self, cliente_id: str, conteudo_xml: str, nome_arquivo: str) -> AmbienteResponse:
        """Importa ambiente a partir de XML do Promob"""
        return await self.xml_importer.importar_xml(cliente_id, conteudo_xml, nome_arquivo)