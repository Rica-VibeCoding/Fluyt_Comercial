"""
Services - Lógica de negócio para tipos de colaboradores
Camada intermediária entre os controllers e o repository
"""
import logging
from typing import Dict, Any, Optional

from core.database import get_database
from core.auth import User
from core.dependencies import PaginationParams
from core.exceptions import ValidationException, NotFoundException

from .repository import TipoColaboradorRepository, ColaboradorRepository
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

logger = logging.getLogger(__name__)


class TipoColaboradorService:
    """
    Serviço principal para operações com tipos de colaboradores
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    async def listar_tipos_colaborador(
        self,
        user: User,
        filtros: FiltrosTipoColaborador,
        pagination: PaginationParams
    ) -> TipoColaboradorListResponse:
        """
        Lista tipos de colaboradores com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de tipos de colaboradores
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN podem listar tipos de colaboradores
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado: apenas administradores podem listar tipos de colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = TipoColaboradorRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.categoria:
                filtros_dict['categoria'] = filtros.categoria
            if filtros.tipo_percentual:
                filtros_dict['tipo_percentual'] = filtros.tipo_percentual
            if filtros.ativo is not None:
                filtros_dict['ativo'] = filtros.ativo
            
            # Busca no repository - passa perfil do usuário para controle de hierarquia
            resultado = await repository.listar(
                filtros=filtros_dict,
                page=pagination.page,
                limit=pagination.limit,
                user_perfil=user.perfil
            )
            
            # Converte para response model
            tipos = [TipoColaboradorResponse(**item) for item in resultado['items']]
            
            return TipoColaboradorListResponse(
                items=tipos,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar tipos de colaboradores: {str(e)}")
            raise
    
    async def buscar_tipo_colaborador(self, tipo_id: str, user: User) -> TipoColaboradorResponse:
        """
        Busca um tipo de colaborador específico
        
        Args:
            tipo_id: ID do tipo de colaborador
            user: Usuário logado
            
        Returns:
            Dados completos do tipo de colaborador
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN podem buscar tipos de colaboradores
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado")
            
            # Conecta com o banco
            db = get_database()
            repository = TipoColaboradorRepository(db)
            
            # Busca o tipo - passa perfil do usuário
            tipo_data = await repository.buscar_por_id(tipo_id, user.perfil)
            
            return TipoColaboradorResponse(**tipo_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar tipo de colaborador {tipo_id}: {str(e)}")
            raise
    
    async def criar_tipo_colaborador(self, dados: TipoColaboradorCreate, user: User) -> TipoColaboradorResponse:
        """
        Cria um novo tipo de colaborador
        
        Args:
            dados: Dados do tipo a ser criado
            user: Usuário logado (admin)
            
        Returns:
            Tipo de colaborador criado
        """
        try:
            # Apenas SUPER_ADMIN pode criar tipos de colaboradores
            if user.perfil not in ["SUPER_ADMIN"]:
                raise ValidationException("Apenas SUPER_ADMIN pode criar tipos de colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = TipoColaboradorRepository(db)
            
            # Valida se apenas uma base de pagamento foi definida
            bases_definidas = 0
            if dados.percentual_valor > 0:
                bases_definidas += 1
            if dados.salario_base > 0:
                bases_definidas += 1
            if dados.valor_por_servico > 0:
                bases_definidas += 1
            if dados.minimo_garantido > 0:
                bases_definidas += 1
            
            if bases_definidas == 0:
                raise ValidationException("Pelo menos uma base de pagamento deve ser definida")
            if bases_definidas > 1:
                raise ValidationException("Apenas uma base de pagamento pode ser definida por tipo")
            
            # Converte dados para dicionário
            dados_tipo = dados.model_dump(mode='json', exclude_unset=True)
            
            # Cria o tipo
            tipo_criado = await repository.criar(dados_tipo)
            
            # Busca o tipo completo
            tipo_completo = await repository.buscar_por_id(tipo_criado['id'], user.perfil)
            
            logger.info(f"Tipo de colaborador criado: {tipo_completo['id']}")
            
            return TipoColaboradorResponse(**tipo_completo)
        
        except Exception as e:
            logger.error(f"Erro ao criar tipo de colaborador: {str(e)}")
            raise
    
    async def atualizar_tipo_colaborador(
        self,
        tipo_id: str,
        dados: TipoColaboradorUpdate,
        user: User
    ) -> TipoColaboradorResponse:
        """
        Atualiza dados de um tipo de colaborador
        
        Args:
            tipo_id: ID do tipo
            dados: Dados a atualizar
            user: Usuário logado
            
        Returns:
            Tipo de colaborador atualizado
        """
        try:
            # Apenas SUPER_ADMIN pode atualizar tipos de colaboradores
            if user.perfil not in ["SUPER_ADMIN"]:
                raise ValidationException("Apenas SUPER_ADMIN pode atualizar tipos de colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = TipoColaboradorRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(mode='json', exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Se alguma base de pagamento foi informada, valida se apenas uma está definida
            if any(campo in dados_atualizacao for campo in ['percentual_valor', 'salario_base', 'valor_por_servico', 'minimo_garantido']):
                # Busca dados atuais
                tipo_atual = await repository.buscar_por_id(tipo_id, user.perfil)
                
                # Aplica as mudanças aos dados atuais
                dados_finais = {**tipo_atual, **dados_atualizacao}
                
                # Conta quantas bases estão definidas
                bases_definidas = 0
                if dados_finais.get('percentual_valor', 0) > 0:
                    bases_definidas += 1
                if dados_finais.get('salario_base', 0) > 0:
                    bases_definidas += 1
                if dados_finais.get('valor_por_servico', 0) > 0:
                    bases_definidas += 1
                if dados_finais.get('minimo_garantido', 0) > 0:
                    bases_definidas += 1
                
                if bases_definidas == 0:
                    raise ValidationException("Pelo menos uma base de pagamento deve ser definida")
                if bases_definidas > 1:
                    raise ValidationException("Apenas uma base de pagamento pode ser definida por tipo")
            
            # Atualiza o tipo
            await repository.atualizar(tipo_id, dados_atualizacao)
            
            # Busca o tipo atualizado
            tipo_atualizado = await repository.buscar_por_id(tipo_id, user.perfil)
            
            logger.info(f"Tipo de colaborador atualizado: {tipo_id}")
            
            return TipoColaboradorResponse(**tipo_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar tipo de colaborador {tipo_id}: {str(e)}")
            raise
    
    async def desativar_tipo_colaborador(self, tipo_id: str, user: User) -> bool:
        """
        Desativa um tipo de colaborador (soft delete - apenas marca como inativo)
        
        Args:
            tipo_id: ID do tipo
            user: Usuário logado
            
        Returns:
            True se desativado com sucesso
        """
        try:
            # Apenas SUPER_ADMIN pode desativar tipos de colaboradores
            if user.perfil not in ["SUPER_ADMIN"]:
                raise ValidationException("Apenas SUPER_ADMIN pode desativar tipos de colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = TipoColaboradorRepository(db)
            
            # Desativa o tipo (soft delete)
            sucesso = await repository.desativar(tipo_id)
            
            if sucesso:
                logger.info(f"Tipo de colaborador desativado: {tipo_id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao desativar tipo de colaborador {tipo_id}: {str(e)}")
            raise
    
    async def verificar_nome_disponivel(
        self,
        nome: str,
        user: User,
        tipo_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um nome de tipo está disponível para uso
        
        Args:
            nome: Nome a verificar
            user: Usuário logado
            tipo_id_ignorar: ID do tipo a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se nome está vazio, não está disponível
            if not nome or nome.strip() == '':
                return False
                
            # Apenas admins podem verificar nome
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado: apenas administradores podem verificar nomes")
            
            # Conecta com o banco
            db = get_database()
            repository = TipoColaboradorRepository(db)
            
            # Busca tipo com esse nome (busca em todos os tipos para verificação completa)
            tipo_existente = await repository.buscar_por_nome(nome.strip(), "SUPER_ADMIN")
            
            # Se não encontrou, está disponível
            if not tipo_existente:
                return True
            
            # Se encontrou mas é o mesmo tipo que está sendo editado, está disponível
            if tipo_id_ignorar and tipo_existente['id'] == tipo_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar nome {nome}: {str(e)}")
            raise


# ========================================
# SERVICE PARA COLABORADORES INDIVIDUAIS
# ========================================

class ColaboradorService:
    """
    Serviço principal para operações com colaboradores individuais
    """
    
    def __init__(self):
        """
        Inicializa o serviço
        """
        pass
    
    async def listar_colaboradores(
        self,
        user: User,
        filtros: FiltrosColaborador,
        pagination: PaginationParams
    ) -> ColaboradorListResponse:
        """
        Lista colaboradores com filtros e paginação
        
        Args:
            user: Usuário logado
            filtros: Filtros a aplicar
            pagination: Parâmetros de paginação
            
        Returns:
            Lista paginada de colaboradores
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN podem listar colaboradores
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado: apenas administradores podem listar colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Converte filtros para dicionário
            filtros_dict = {}
            if filtros.busca:
                filtros_dict['busca'] = filtros.busca
            if filtros.tipo_colaborador_id:
                filtros_dict['tipo_colaborador_id'] = str(filtros.tipo_colaborador_id)
            if filtros.categoria:
                filtros_dict['categoria'] = filtros.categoria
            if filtros.ativo is not None:
                filtros_dict['ativo'] = filtros.ativo
            
            # Busca no repository - passa perfil do usuário para controle de hierarquia
            resultado = await repository.listar(
                filtros=filtros_dict,
                page=pagination.page,
                limit=pagination.limit,
                user_perfil=user.perfil
            )
            
            # Converte para response model
            colaboradores = [ColaboradorResponse(**item) for item in resultado['items']]
            
            return ColaboradorListResponse(
                items=colaboradores,
                total=resultado['total'],
                page=resultado['page'],
                limit=resultado['limit'],
                pages=resultado['pages']
            )
        
        except Exception as e:
            logger.error(f"Erro ao listar colaboradores: {str(e)}")
            raise
    
    async def buscar_colaborador(self, colaborador_id: str, user: User) -> ColaboradorResponse:
        """
        Busca um colaborador específico
        
        Args:
            colaborador_id: ID do colaborador
            user: Usuário logado
            
        Returns:
            Dados completos do colaborador
        """
        try:
            # Apenas SUPER_ADMIN e ADMIN podem buscar colaboradores
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Busca o colaborador - passa perfil do usuário
            colaborador_data = await repository.buscar_por_id(colaborador_id, user.perfil)
            
            return ColaboradorResponse(**colaborador_data)
        
        except Exception as e:
            logger.error(f"Erro ao buscar colaborador {colaborador_id}: {str(e)}")
            raise
    
    async def criar_colaborador(self, dados: ColaboradorCreate, user: User) -> ColaboradorResponse:
        """
        Cria um novo colaborador
        
        Args:
            dados: Dados do colaborador a ser criado
            user: Usuário logado (admin)
            
        Returns:
            Colaborador criado
        """
        try:
            # Apenas SUPER_ADMIN pode criar colaboradores
            if user.perfil not in ["SUPER_ADMIN"]:
                raise ValidationException("Apenas SUPER_ADMIN pode criar colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Converte dados para dicionário
            dados_colaborador = dados.model_dump(mode='json', exclude_unset=True)
            
            # Cria o colaborador
            colaborador_criado = await repository.criar(dados_colaborador)
            
            # Busca o colaborador completo (com dados relacionados)
            colaborador_completo = await repository.buscar_por_id(colaborador_criado['id'], user.perfil)
            
            logger.info(f"Colaborador criado: {colaborador_completo['id']}")
            
            return ColaboradorResponse(**colaborador_completo)
        
        except Exception as e:
            logger.error(f"Erro ao criar colaborador: {str(e)}")
            raise
    
    async def atualizar_colaborador(
        self,
        colaborador_id: str,
        dados: ColaboradorUpdate,
        user: User
    ) -> ColaboradorResponse:
        """
        Atualiza dados de um colaborador
        
        Args:
            colaborador_id: ID do colaborador
            dados: Dados a atualizar
            user: Usuário logado
            
        Returns:
            Colaborador atualizado
        """
        try:
            # Apenas SUPER_ADMIN pode atualizar colaboradores
            if user.perfil not in ["SUPER_ADMIN"]:
                raise ValidationException("Apenas SUPER_ADMIN pode atualizar colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Converte dados para dicionário (apenas campos não None)
            dados_atualizacao = dados.model_dump(mode='json', exclude_unset=True, exclude_none=True)
            
            if not dados_atualizacao:
                raise ValidationException("Nenhum dado fornecido para atualização")
            
            # Atualiza o colaborador
            await repository.atualizar(colaborador_id, dados_atualizacao)
            
            # Busca o colaborador atualizado
            colaborador_atualizado = await repository.buscar_por_id(colaborador_id, user.perfil)
            
            logger.info(f"Colaborador atualizado: {colaborador_id}")
            
            return ColaboradorResponse(**colaborador_atualizado)
        
        except Exception as e:
            logger.error(f"Erro ao atualizar colaborador {colaborador_id}: {str(e)}")
            raise
    
    async def desativar_colaborador(self, colaborador_id: str, user: User) -> bool:
        """
        Desativa um colaborador (soft delete - apenas marca como inativo)
        
        Args:
            colaborador_id: ID do colaborador
            user: Usuário logado
            
        Returns:
            True se desativado com sucesso
        """
        try:
            # Apenas SUPER_ADMIN pode desativar colaboradores
            if user.perfil not in ["SUPER_ADMIN"]:
                raise ValidationException("Apenas SUPER_ADMIN pode desativar colaboradores")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Desativa o colaborador (soft delete)
            sucesso = await repository.desativar(colaborador_id)
            
            if sucesso:
                logger.info(f"Colaborador desativado: {colaborador_id}")
            
            return sucesso
        
        except Exception as e:
            logger.error(f"Erro ao desativar colaborador {colaborador_id}: {str(e)}")
            raise
    
    async def verificar_cpf_disponivel(
        self,
        cpf: str,
        user: User,
        colaborador_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um CPF está disponível para uso
        
        Args:
            cpf: CPF a verificar
            user: Usuário logado
            colaborador_id_ignorar: ID do colaborador a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se CPF está vazio, está sempre disponível
            if not cpf or cpf.strip() == '':
                return True
                
            # Apenas admins podem verificar CPF
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado: apenas administradores podem verificar CPF")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Busca colaborador com esse CPF (busca em todos para verificação completa)
            colaborador_existente = await repository.buscar_por_cpf(cpf, "SUPER_ADMIN")
            
            # Se não encontrou, está disponível
            if not colaborador_existente:
                return True
            
            # Se encontrou mas é o mesmo colaborador que está sendo editado, está disponível
            if colaborador_id_ignorar and colaborador_existente['id'] == colaborador_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar CPF {cpf}: {str(e)}")
            raise
    
    async def verificar_email_disponivel(
        self,
        email: str,
        user: User,
        colaborador_id_ignorar: Optional[str] = None
    ) -> bool:
        """
        Verifica se um email está disponível para uso
        
        Args:
            email: Email a verificar
            user: Usuário logado
            colaborador_id_ignorar: ID do colaborador a ignorar (para edição)
            
        Returns:
            True se disponível, False se já existe
        """
        try:
            # Se email está vazio, está sempre disponível
            if not email or email.strip() == '':
                return True
                
            # Apenas admins podem verificar email
            if user.perfil not in ["SUPER_ADMIN", "ADMIN"]:
                raise ValidationException("Acesso negado: apenas administradores podem verificar email")
            
            # Conecta com o banco
            db = get_database()
            repository = ColaboradorRepository(db)
            
            # Busca colaborador com esse email (busca em todos para verificação completa)
            colaborador_existente = await repository.buscar_por_email(email.strip(), "SUPER_ADMIN")
            
            # Se não encontrou, está disponível
            if not colaborador_existente:
                return True
            
            # Se encontrou mas é o mesmo colaborador que está sendo editado, está disponível
            if colaborador_id_ignorar and colaborador_existente['id'] == colaborador_id_ignorar:
                return True
            
            # Senão, já está em uso
            return False
        
        except Exception as e:
            logger.error(f"Erro ao verificar email {email}: {str(e)}")
            raise 