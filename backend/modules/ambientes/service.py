"""
Service - Camada de lógica de negócios para ambientes
Responsável por implementar as regras de negócio e validações
"""
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

logger = logging.getLogger(__name__)


class AmbienteService:
    """
    Service responsável pela lógica de negócio dos ambientes
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o service com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.repository = AmbienteRepository(db)
    
    async def listar_ambientes(
        self,
        filtros: Optional[AmbienteFiltros] = None
    ) -> AmbienteListResponse:
        """
        Lista ambientes com filtros e paginação
        
        Args:
            filtros: Filtros para busca com paginação incluída
            
        Returns:
            Lista paginada de ambientes com dados dos clientes
            
        Raises:
            ValidationException: Parâmetros inválidos
            DatabaseException: Erro no banco de dados
        """
        try:
            # Usa filtros padrão se não fornecido
            if not filtros:
                filtros = AmbienteFiltros(page=1, per_page=20)
            
            # Validação dos parâmetros de paginação
            if filtros.page < 1:
                raise ValidationException("Página deve ser maior que 0")
            if filtros.per_page < 1 or filtros.per_page > 100:
                raise ValidationException("Tamanho da página deve estar entre 1 e 100")
            
            logger.info(f"Listando ambientes - Página: {filtros.page}, Tamanho: {filtros.per_page}")
            
            # Converte filtros para dict
            filtros_dict = filtros.model_dump(exclude_unset=True) if hasattr(filtros, 'model_dump') else filtros.dict(exclude_unset=True)
            
            # Busca no repository
            resultado = await self.repository.listar(**filtros_dict)
            
            # Converte items para schemas de resposta
            items = [AmbienteResponse(**item) for item in resultado['items']]
            
            logger.info(f"Encontrados {resultado['total']} ambientes, página {filtros.page}")
            
            return AmbienteListResponse(
                items=items,
                total=resultado['total'],
                page=resultado['page'],
                per_page=resultado['limit'],
                pages=resultado['pages']
            )
            
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Erro ao listar ambientes: {str(e)}")
            raise DatabaseException(f"Erro interno ao listar ambientes: {str(e)}")
    
    async def buscar_ambiente_por_id(
        self, 
        ambiente_id: str,
        incluir_materiais: bool = False
    ) -> AmbienteResponse:
        """
        Busca um ambiente específico por ID
        
        Args:
            ambiente_id: UUID do ambiente
            incluir_materiais: Se deve incluir materiais na resposta
            
        Returns:
            Dados do ambiente com informações do cliente
            
        Raises:
            NotFoundException: Ambiente não encontrado
            ValidationException: ID inválido
            DatabaseException: Erro no banco de dados
        """
        try:
            # Validação do ID
            if not ambiente_id or not ambiente_id.strip():
                raise ValidationException("ID do ambiente é obrigatório")
            
            logger.info(f"Buscando ambiente ID: {ambiente_id}")
            
            # Busca no repository
            ambiente_dict = await self.repository.buscar_por_id(
                ambiente_id=ambiente_id,
                include_materiais=incluir_materiais
            )
            
            if not ambiente_dict:
                raise NotFoundException(f"Ambiente com ID {ambiente_id} não encontrado")
            
            # Converte dict para schema de resposta
            ambiente = AmbienteResponse(**ambiente_dict)
            
            logger.info(f"Ambiente encontrado: {ambiente.nome}")
            return ambiente
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao buscar ambiente: {str(e)}")
    
    async def criar_ambiente(self, dados: AmbienteCreate) -> AmbienteResponse:
        """
        Cria um novo ambiente
        
        Args:
            dados: Dados para criação do ambiente
            
        Returns:
            Ambiente criado com dados do cliente
            
        Raises:
            ValidationException: Dados inválidos
            DatabaseException: Erro no banco de dados
        """
        try:
            logger.info(f"Criando ambiente: {dados.nome} para cliente {dados.cliente_id}")
            
            # Validações de negócio
            await self._validar_dados_ambiente(dados)
            
            # Converte o schema Pydantic para dict
            dados_dict = dados.model_dump() if hasattr(dados, 'model_dump') else dados.dict()
            
            # Criação no repository
            ambiente_dict = await self.repository.criar_ambiente(dados_dict)
            
            # Converte dict para schema de resposta
            ambiente = AmbienteResponse(**ambiente_dict)
            
            logger.info(f"Ambiente criado com sucesso - ID: {ambiente.id}")
            return ambiente
            
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar ambiente: {str(e)}")
            raise DatabaseException(f"Erro interno ao criar ambiente: {str(e)}")
    
    async def atualizar_ambiente(
        self, 
        ambiente_id: str, 
        dados: AmbienteUpdate
    ) -> AmbienteResponse:
        """
        Atualiza um ambiente existente
        
        Args:
            ambiente_id: UUID do ambiente
            dados: Dados para atualização
            
        Returns:
            Ambiente atualizado com dados do cliente
            
        Raises:
            NotFoundException: Ambiente não encontrado
            ValidationException: Dados inválidos
            DatabaseException: Erro no banco de dados
        """
        try:
            # Validação do ID
            if not ambiente_id or not ambiente_id.strip():
                raise ValidationException("ID do ambiente é obrigatório")
            
            logger.info(f"Atualizando ambiente ID: {ambiente_id}")
            
            # Verifica se ambiente existe
            await self.buscar_ambiente_por_id(ambiente_id)
            
            # Validações de negócio (apenas campos que foram informados)
            await self._validar_dados_ambiente_update(dados)
            
            # Converte o schema Pydantic para dict (apenas campos definidos)
            dados_dict = dados.model_dump(exclude_unset=True) if hasattr(dados, 'model_dump') else dados.dict(exclude_unset=True)
            
            # Atualização no repository
            ambiente_dict = await self.repository.atualizar_ambiente(ambiente_id, dados_dict)
            
            # Converte dict para schema de resposta
            ambiente = AmbienteResponse(**ambiente_dict)
            
            logger.info(f"Ambiente atualizado com sucesso - ID: {ambiente_id}")
            return ambiente
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao atualizar ambiente: {str(e)}")
    
    async def excluir_ambiente(self, ambiente_id: str) -> bool:
        """
        Exclui um ambiente (DELETE real)
        
        Args:
            ambiente_id: UUID do ambiente
            
        Returns:
            True se excluído com sucesso
            
        Raises:
            NotFoundException: Ambiente não encontrado
            ValidationException: ID inválido
            DatabaseException: Erro no banco de dados
        """
        try:
            # Validação do ID
            if not ambiente_id or not ambiente_id.strip():
                raise ValidationException("ID do ambiente é obrigatório")
            
            logger.info(f"Excluindo ambiente ID: {ambiente_id}")
            
            # Verifica se ambiente existe
            await self.buscar_ambiente_por_id(ambiente_id)
            
            # Exclusão no repository
            sucesso = await self.repository.excluir_ambiente(ambiente_id)
            
            if sucesso:
                logger.info(f"Ambiente excluído com sucesso - ID: {ambiente_id}")
            else:
                logger.warning(f"Falha ao excluir ambiente - ID: {ambiente_id}")
            
            return sucesso
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao excluir ambiente: {str(e)}")
    
    async def criar_material_ambiente(
        self, 
        ambiente_id: str, 
        dados: AmbienteMaterialCreate
    ) -> AmbienteMaterialResponse:
        """
        Cria/atualiza materiais de um ambiente
        
        Args:
            ambiente_id: UUID do ambiente
            dados: Dados dos materiais em JSON
            
        Returns:
            Materiais criados/atualizados
            
        Raises:
            NotFoundException: Ambiente não encontrado
            ValidationException: Dados inválidos
            DatabaseException: Erro no banco de dados
        """
        try:
            logger.info(f"Criando materiais para ambiente ID: {ambiente_id}")
            
            # Verifica se ambiente existe
            await self.buscar_ambiente_por_id(ambiente_id)
            
            # Validação dos materiais JSON
            if not dados.materiais_json:
                raise ValidationException("Dados de materiais são obrigatórios")
            
            # Criação no repository (UPSERT)
            material = await self.repository.criar_material_ambiente(ambiente_id, dados)
            
            logger.info(f"Materiais criados/atualizados para ambiente: {ambiente_id}")
            return material
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao criar materiais ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao criar materiais: {str(e)}")
    
    async def obter_materiais_ambiente(self, ambiente_id: str) -> Optional[AmbienteMaterialResponse]:
        """
        Obtém materiais de um ambiente
        
        Args:
            ambiente_id: UUID do ambiente
            
        Returns:
            Materiais do ambiente ou None se não existir
            
        Raises:
            NotFoundException: Ambiente não encontrado
            ValidationException: ID inválido
            DatabaseException: Erro no banco de dados
        """
        try:
            logger.info(f"Obtendo materiais do ambiente ID: {ambiente_id}")
            
            # Verifica se ambiente existe
            await self.buscar_ambiente_por_id(ambiente_id)
            
            # Busca materiais no repository
            materiais = await self.repository.obter_materiais_ambiente(ambiente_id)
            
            if materiais:
                logger.info(f"Materiais encontrados para ambiente: {ambiente_id}")
            else:
                logger.info(f"Nenhum material encontrado para ambiente: {ambiente_id}")
            
            return materiais
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error(f"Erro ao obter materiais ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro interno ao obter materiais: {str(e)}")
    
    async def _validar_dados_ambiente(self, dados: AmbienteCreate) -> None:
        """
        Validações de negócio para criação de ambiente
        
        Args:
            dados: Dados do ambiente para validação
            
        Raises:
            ValidationException: Dados inválidos
        """
        # Validação do nome
        if not dados.nome or not dados.nome.strip():
            raise ValidationException("Nome do ambiente é obrigatório")
        
        if len(dados.nome.strip()) < 2:
            raise ValidationException("Nome do ambiente deve ter pelo menos 2 caracteres")
        
        # Validação dos valores monetários
        if dados.valor_custo_fabrica is not None and dados.valor_custo_fabrica < 0:
            raise ValidationException("Valor de custo não pode ser negativo")
        
        if dados.valor_venda is not None and dados.valor_venda < 0:
            raise ValidationException("Valor de venda não pode ser negativo")
        
        # Validação da origem
        if dados.origem not in ['xml', 'manual']:
            raise ValidationException("Origem deve ser 'xml' ou 'manual'")
        
        # Validação de data/hora para origem XML
        if dados.origem == 'xml':
            if not dados.data_importacao:
                raise ValidationException("Data de importação é obrigatória para origem XML")
            if not dados.hora_importacao:
                raise ValidationException("Hora de importação é obrigatória para origem XML")
    
    async def _validar_dados_ambiente_update(self, dados: AmbienteUpdate) -> None:
        """
        Validações de negócio para atualização de ambiente
        
        Args:
            dados: Dados do ambiente para validação
            
        Raises:
            ValidationException: Dados inválidos
        """
        # Validação do nome (se informado)
        if dados.nome is not None:
            if not dados.nome.strip():
                raise ValidationException("Nome do ambiente não pode estar vazio")
            if len(dados.nome.strip()) < 2:
                raise ValidationException("Nome do ambiente deve ter pelo menos 2 caracteres")
        
        # Validação dos valores monetários (se informados)
        if dados.valor_custo_fabrica is not None and dados.valor_custo_fabrica < 0:
            raise ValidationException("Valor de custo não pode ser negativo")
        
        if dados.valor_venda is not None and dados.valor_venda < 0:
            raise ValidationException("Valor de venda não pode ser negativo")
        
        # Validação da origem (se informada)
        if dados.origem is not None and dados.origem not in ['xml', 'manual']:
            raise ValidationException("Origem deve ser 'xml' ou 'manual'") 