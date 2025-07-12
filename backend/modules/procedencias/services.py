"""
Services - Lógica de negócio para Procedências
"""
import logging
from typing import List, Optional
from core.exceptions import NotFoundException, ConflictException, BusinessRuleException
from .repository import ProcedenciaRepository
from .schemas import ProcedenciaCreate, ProcedenciaUpdate, ProcedenciaResponse

logger = logging.getLogger(__name__)


class ProcedenciaService:
    """Service para lógica de negócio de procedências"""
    
    def __init__(self, repository: ProcedenciaRepository):
        self.repository = repository
    
    async def listar_todas(self, apenas_ativas: bool = False) -> List[ProcedenciaResponse]:
        """Lista todas as procedências"""
        try:
            procedencias_data = await self.repository.listar_todas(apenas_ativas)
            return [ProcedenciaResponse(**item) for item in procedencias_data]
        
        except Exception as e:
            logger.error(f"Erro no service ao listar procedências: {str(e)}")
            raise
    
    async def buscar_por_id(self, procedencia_id: str) -> ProcedenciaResponse:
        """Busca procedência por ID"""
        try:
            procedencia_data = await self.repository.buscar_por_id(procedencia_id)
            
            if not procedencia_data:
                raise NotFoundException(f"Procedência {procedencia_id} não encontrada")
            
            return ProcedenciaResponse(**procedencia_data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro no service ao buscar procedência: {str(e)}")
            raise
    
    async def criar(self, dados: ProcedenciaCreate) -> ProcedenciaResponse:
        """Cria nova procedência"""
        try:
            # Validar se nome já existe
            if not await self.repository.verificar_nome_disponivel(dados.nome):
                raise ConflictException(f"Já existe uma procedência com o nome '{dados.nome}'")
            
            # Validações de negócio
            await self._validar_dados_criacao(dados)
            
            # Criar procedência
            procedencia_data = await self.repository.criar(dados)
            
            logger.info(f"Procedência criada: {procedencia_data['id']} - {dados.nome}")
            return ProcedenciaResponse(**procedencia_data)
        
        except (ConflictException, BusinessRuleException):
            raise
        except Exception as e:
            logger.error(f"Erro no service ao criar procedência: {str(e)}")
            raise
    
    async def atualizar(self, procedencia_id: str, dados: ProcedenciaUpdate) -> ProcedenciaResponse:
        """Atualiza procedência existente"""
        try:
            # Verificar se procedência existe
            await self.buscar_por_id(procedencia_id)
            
            # Validar nome único se estiver sendo alterado
            if dados.nome and not await self.repository.verificar_nome_disponivel(dados.nome, procedencia_id):
                raise ConflictException(f"Já existe uma procedência com o nome '{dados.nome}'")
            
            # Validações de negócio
            await self._validar_dados_atualizacao(procedencia_id, dados)
            
            # Atualizar
            procedencia_data = await self.repository.atualizar(procedencia_id, dados)
            
            if not procedencia_data:
                raise NotFoundException(f"Procedência {procedencia_id} não encontrada após atualização")
            
            logger.info(f"Procedência atualizada: {procedencia_id}")
            return ProcedenciaResponse(**procedencia_data)
        
        except (NotFoundException, ConflictException, BusinessRuleException):
            raise
        except Exception as e:
            logger.error(f"Erro no service ao atualizar procedência: {str(e)}")
            raise
    
    async def deletar(self, procedencia_id: str) -> bool:
        """Soft delete de procedência"""
        try:
            # Verificar se procedência existe
            await self.buscar_por_id(procedencia_id)
            
            # Validar se pode ser deletada
            await self._validar_pode_deletar(procedencia_id)
            
            # Soft delete
            sucesso = await self.repository.deletar(procedencia_id)
            
            if sucesso:
                logger.info(f"Procedência marcada como inativa: {procedencia_id}")
            
            return sucesso
        
        except (NotFoundException, BusinessRuleException):
            raise
        except Exception as e:
            logger.error(f"Erro no service ao deletar procedência: {str(e)}")
            raise
    
    async def buscar_por_nome(self, termo: str) -> List[ProcedenciaResponse]:
        """Busca procedências por termo no nome"""
        try:
            todas_procedencias = await self.listar_todas()
            termo_lower = termo.lower()
            
            return [
                proc for proc in todas_procedencias 
                if termo_lower in proc.nome.lower()
            ]
        
        except Exception as e:
            logger.error(f"Erro no service ao buscar por nome: {str(e)}")
            raise
    
    async def _validar_dados_criacao(self, dados: ProcedenciaCreate):
        """Validações específicas para criação"""
        # Nome não pode estar vazio após trim
        if not dados.nome.strip():
            raise BusinessRuleException("Nome da procedência não pode estar vazio")
        
        # Nome não pode ser muito genérico
        nomes_proibidos = ["teste", "test", "exemplo", "sample"]
        if dados.nome.lower().strip() in nomes_proibidos:
            raise BusinessRuleException("Nome não permitido para procedência")
    
    async def _validar_dados_atualizacao(self, procedencia_id: str, dados: ProcedenciaUpdate):
        """Validações específicas para atualização"""
        if dados.nome is not None:
            # Nome não pode estar vazio após trim
            if not dados.nome.strip():
                raise BusinessRuleException("Nome da procedência não pode estar vazio")
    
    async def _validar_pode_deletar(self, procedencia_id: str):
        """Valida se procedência pode ser deletada"""
        # Aqui poderia verificar se há clientes vinculados
        # Por enquanto, permite deletar qualquer procedência
        pass