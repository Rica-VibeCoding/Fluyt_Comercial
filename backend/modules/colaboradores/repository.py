"""
Repository - Camada de acesso ao banco de dados para tipos de colaboradores
Responsável por todas as operações com o Supabase
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class TipoColaboradorRepository:
    """
    Classe responsável por acessar a tabela de tipos de colaboradores no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'c_tipo_de_colaborador'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20,
        user_perfil: str = "ADMIN"
    ) -> Dict[str, Any]:
        """
        Lista tipos de colaboradores com filtros e paginação
        
        Args:
            filtros: Dicionário com filtros (busca, categoria, tipo_percentual, ativo)
            page: Página atual (inicia em 1)
            limit: Quantidade de itens por página
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dicionário com items, total, page, limit, pages
        """
        try:
            # Query base
            query = self.db.table(self.table).select("*")
            
            # Controle de hierarquia - ADMIN só vê ativos, SUPER_ADMIN vê tudo
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            # Aplicar filtros se fornecidos
            if filtros:
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.or_(f"nome.ilike.{busca},descricao.ilike.{busca}")
                
                if filtros.get('categoria'):
                    query = query.eq("categoria", filtros['categoria'])
                
                if filtros.get('tipo_percentual'):
                    query = query.eq("tipo_percentual", filtros['tipo_percentual'])
                
                if filtros.get('ativo') is not None:
                    query = query.eq("ativo", filtros['ativo'])
            
            # Ordenação padrão
            query = query.order("nome")
            
            # Calcular offset para paginação
            offset = (page - 1) * limit
            
            # Buscar total de registros (sem paginação)
            count_response = await query.execute()
            total = len(count_response.data) if count_response.data else 0
            
            # Aplicar paginação
            paginated_query = query.range(offset, offset + limit - 1)
            
            # Executar query paginada
            response = await paginated_query.execute()
            
            if not response.data:
                response.data = []
            
            # Calcular total de páginas
            pages = (total + limit - 1) // limit if total > 0 else 1
            
            return {
                'items': response.data,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': pages
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar tipos de colaboradores: {str(e)}")
            raise DatabaseException(f"Erro ao listar tipos de colaboradores: {str(e)}")
    
    async def buscar_por_id(self, tipo_id: str, user_perfil: str = "ADMIN") -> Dict[str, Any]:
        """
        Busca um tipo de colaborador específico pelo ID
        
        Args:
            tipo_id: UUID do tipo
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dados completos do tipo
        """
        try:
            query = self.db.table(self.table).select("*").eq("id", tipo_id)
            
            # Controle de hierarquia
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            response = await query.execute()
            
            if not response.data:
                raise NotFoundException(f"Tipo de colaborador não encontrado: {tipo_id}")
            
            return response.data[0]
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar tipo {tipo_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar tipo de colaborador: {str(e)}")
    
    async def buscar_por_nome(self, nome: str, user_perfil: str = "ADMIN") -> Optional[Dict[str, Any]]:
        """
        Busca tipo por nome exato (para validação de duplicidade)
        
        Args:
            nome: Nome do tipo
            user_perfil: Perfil do usuário
            
        Returns:
            Dados do tipo se encontrado, None caso contrário
        """
        try:
            query = self.db.table(self.table).select("*").eq("nome", nome.strip())
            
            # SUPER_ADMIN pode ver inativos para validação completa
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            response = await query.execute()
            
            return response.data[0] if response.data else None
        
        except Exception as e:
            logger.error(f"Erro ao buscar tipo por nome {nome}: {str(e)}")
            raise DatabaseException(f"Erro ao verificar nome: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo tipo de colaborador
        
        Args:
            dados: Dados do tipo a ser criado
            
        Returns:
            Tipo criado com ID gerado
        """
        try:
            # Verificar se nome já existe
            tipo_existente = await self.buscar_por_nome(dados['nome'], "SUPER_ADMIN")
            if tipo_existente:
                raise ConflictException(f"Já existe um tipo com o nome '{dados['nome']}'")
            
            # Inserir no banco
            response = await self.db.table(self.table).insert(dados).execute()
            
            if not response.data:
                raise DatabaseException("Erro ao criar tipo de colaborador")
            
            return response.data[0]
        
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar tipo: {str(e)}")
            raise DatabaseException(f"Erro ao criar tipo de colaborador: {str(e)}")
    
    async def atualizar(self, tipo_id: str, dados: Dict[str, Any]) -> bool:
        """
        Atualiza um tipo de colaborador existente
        
        Args:
            tipo_id: UUID do tipo
            dados: Dados a serem atualizados
            
        Returns:
            True se atualizado com sucesso
        """
        try:
            # Se está alterando o nome, verificar duplicidade
            if 'nome' in dados:
                tipo_existente = await self.buscar_por_nome(dados['nome'], "SUPER_ADMIN")
                if tipo_existente and tipo_existente['id'] != tipo_id:
                    raise ConflictException(f"Já existe um tipo com o nome '{dados['nome']}'")
            
            # Adicionar timestamp de atualização
            dados['updated_at'] = datetime.utcnow().isoformat()
            
            # Atualizar no banco
            response = await self.db.table(self.table).update(dados).eq("id", tipo_id).execute()
            
            if not response.data:
                raise NotFoundException(f"Tipo de colaborador não encontrado: {tipo_id}")
            
            return True
        
        except (ConflictException, NotFoundException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar tipo {tipo_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar tipo de colaborador: {str(e)}")
    
    async def desativar(self, tipo_id: str) -> bool:
        """
        Desativa um tipo de colaborador (soft delete)
        
        Args:
            tipo_id: UUID do tipo
            
        Returns:
            True se desativado com sucesso
        """
        try:
            dados_atualizacao = {
                'ativo': False,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            response = await self.db.table(self.table).update(dados_atualizacao).eq("id", tipo_id).execute()
            
            if not response.data:
                raise NotFoundException(f"Tipo de colaborador não encontrado: {tipo_id}")
            
            return True
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao desativar tipo {tipo_id}: {str(e)}")
            raise DatabaseException(f"Erro ao desativar tipo de colaborador: {str(e)}")


# ========================================
# REPOSITORY PARA COLABORADORES INDIVIDUAIS
# ========================================

class ColaboradorRepository:
    """
    Classe responsável por acessar a tabela de colaboradores individuais no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'c_colaboradores'
        self.table_tipos = 'c_tipo_de_colaborador'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20,
        user_perfil: str = "ADMIN"
    ) -> Dict[str, Any]:
        """
        Lista colaboradores com filtros e paginação, incluindo dados do tipo
        
        Args:
            filtros: Dicionário com filtros
            page: Página atual (inicia em 1)
            limit: Quantidade de itens por página
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dicionário com items, total, page, limit, pages
        """
        try:
            # Query com JOIN para buscar dados do tipo
            query = self.db.table(self.table).select("""
                *,
                tipo_colaborador:tipo_colaborador_id (
                    id,
                    nome,
                    categoria,
                    tipo_percentual
                )
            """)
            
            # Controle de hierarquia - ADMIN só vê ativos
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            # Aplicar filtros se fornecidos
            if filtros:
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.or_(f"nome.ilike.{busca},email.ilike.{busca},cpf.ilike.{busca}")
                
                if filtros.get('tipo_colaborador_id'):
                    query = query.eq("tipo_colaborador_id", filtros['tipo_colaborador_id'])
                
                if filtros.get('categoria'):
                    # Filtro por categoria do tipo - necessário subconsulta
                    query = query.eq("tipo_colaborador.categoria", filtros['categoria'])
                
                if filtros.get('ativo') is not None:
                    query = query.eq("ativo", filtros['ativo'])
            
            # Ordenação padrão
            query = query.order("nome")
            
            # Calcular offset para paginação
            offset = (page - 1) * limit
            
            # Buscar total de registros (sem paginação)
            count_response = await query.execute()
            total = len(count_response.data) if count_response.data else 0
            
            # Aplicar paginação
            paginated_query = query.range(offset, offset + limit - 1)
            
            # Executar query paginada
            response = await paginated_query.execute()
            
            if not response.data:
                response.data = []
            
            # Processar dados para incluir informações do tipo no nível principal
            items_processados = []
            for item in response.data:
                colaborador = item.copy()
                
                # Extrair dados do tipo relacionado
                if item.get('tipo_colaborador'):
                    tipo_data = item['tipo_colaborador']
                    colaborador['tipo_colaborador_nome'] = tipo_data.get('nome')
                    colaborador['tipo_colaborador_categoria'] = tipo_data.get('categoria')
                
                # Remover objeto aninhado
                colaborador.pop('tipo_colaborador', None)
                
                items_processados.append(colaborador)
            
            # Calcular total de páginas
            pages = (total + limit - 1) // limit if total > 0 else 1
            
            return {
                'items': items_processados,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': pages
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar colaboradores: {str(e)}")
            raise DatabaseException(f"Erro ao listar colaboradores: {str(e)}")
    
    async def buscar_por_id(self, colaborador_id: str, user_perfil: str = "ADMIN") -> Dict[str, Any]:
        """
        Busca um colaborador específico pelo ID, incluindo dados do tipo
        
        Args:
            colaborador_id: UUID do colaborador
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dados completos do colaborador
        """
        try:
            query = self.db.table(self.table).select("""
                *,
                tipo_colaborador:tipo_colaborador_id (
                    id,
                    nome,
                    categoria,
                    tipo_percentual,
                    percentual_valor,
                    salario_base,
                    valor_por_servico,
                    minimo_garantido
                )
            """).eq("id", colaborador_id)
            
            # Controle de hierarquia
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            response = await query.execute()
            
            if not response.data:
                raise NotFoundException(f"Colaborador não encontrado: {colaborador_id}")
            
            colaborador = response.data[0].copy()
            
            # Processar dados do tipo relacionado
            if colaborador.get('tipo_colaborador'):
                tipo_data = colaborador['tipo_colaborador']
                colaborador['tipo_colaborador_nome'] = tipo_data.get('nome')
                colaborador['tipo_colaborador_categoria'] = tipo_data.get('categoria')
            
            # Remover objeto aninhado
            colaborador.pop('tipo_colaborador', None)
            
            return colaborador
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar colaborador {colaborador_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar colaborador: {str(e)}")
    
    async def buscar_por_cpf(self, cpf: str, user_perfil: str = "ADMIN") -> Optional[Dict[str, Any]]:
        """
        Busca colaborador por CPF (para validação de duplicidade)
        
        Args:
            cpf: CPF limpo (apenas números)
            user_perfil: Perfil do usuário
            
        Returns:
            Dados do colaborador se encontrado, None caso contrário
        """
        try:
            query = self.db.table(self.table).select("*").eq("cpf", cpf)
            
            # SUPER_ADMIN pode ver inativos para validação completa
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            response = await query.execute()
            
            return response.data[0] if response.data else None
        
        except Exception as e:
            logger.error(f"Erro ao buscar colaborador por CPF {cpf}: {str(e)}")
            raise DatabaseException(f"Erro ao verificar CPF: {str(e)}")
    
    async def buscar_por_email(self, email: str, user_perfil: str = "ADMIN") -> Optional[Dict[str, Any]]:
        """
        Busca colaborador por email (para validação de duplicidade)
        
        Args:
            email: Email do colaborador
            user_perfil: Perfil do usuário
            
        Returns:
            Dados do colaborador se encontrado, None caso contrário
        """
        try:
            query = self.db.table(self.table).select("*").eq("email", email.lower().strip())
            
            # SUPER_ADMIN pode ver inativos para validação completa
            if user_perfil == "ADMIN":
                query = query.eq("ativo", True)
            
            response = await query.execute()
            
            return response.data[0] if response.data else None
        
        except Exception as e:
            logger.error(f"Erro ao buscar colaborador por email {email}: {str(e)}")
            raise DatabaseException(f"Erro ao verificar email: {str(e)}")
    
    async def verificar_tipo_existe(self, tipo_colaborador_id: str) -> bool:
        """
        Verifica se um tipo de colaborador existe e está ativo
        
        Args:
            tipo_colaborador_id: UUID do tipo
            
        Returns:
            True se existe e está ativo
        """
        try:
            response = await self.db.table(self.table_tipos).select("id").eq("id", tipo_colaborador_id).eq("ativo", True).execute()
            
            return len(response.data) > 0
        
        except Exception as e:
            logger.error(f"Erro ao verificar tipo {tipo_colaborador_id}: {str(e)}")
            raise DatabaseException(f"Erro ao verificar tipo de colaborador: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo colaborador
        
        Args:
            dados: Dados do colaborador a ser criado
            
        Returns:
            Colaborador criado com ID gerado
        """
        try:
            # Verificar se tipo de colaborador existe
            if not await self.verificar_tipo_existe(dados['tipo_colaborador_id']):
                raise NotFoundException(f"Tipo de colaborador não encontrado: {dados['tipo_colaborador_id']}")
            
            # Verificar duplicidade de CPF se fornecido
            if dados.get('cpf'):
                colaborador_existente = await self.buscar_por_cpf(dados['cpf'], "SUPER_ADMIN")
                if colaborador_existente:
                    raise ConflictException(f"Já existe um colaborador com o CPF '{dados['cpf']}'")
            
            # Verificar duplicidade de email se fornecido
            if dados.get('email'):
                colaborador_existente = await self.buscar_por_email(dados['email'], "SUPER_ADMIN")
                if colaborador_existente:
                    raise ConflictException(f"Já existe um colaborador com o email '{dados['email']}'")
            
            # Normalizar email para lowercase
            if dados.get('email'):
                dados['email'] = dados['email'].lower().strip()
            
            # Inserir no banco
            response = await self.db.table(self.table).insert(dados).execute()
            
            if not response.data:
                raise DatabaseException("Erro ao criar colaborador")
            
            return response.data[0]
        
        except (ConflictException, NotFoundException):
            raise
        except Exception as e:
            logger.error(f"Erro ao criar colaborador: {str(e)}")
            raise DatabaseException(f"Erro ao criar colaborador: {str(e)}")
    
    async def atualizar(self, colaborador_id: str, dados: Dict[str, Any]) -> bool:
        """
        Atualiza um colaborador existente
        
        Args:
            colaborador_id: UUID do colaborador
            dados: Dados a serem atualizados
            
        Returns:
            True se atualizado com sucesso
        """
        try:
            # Verificar se tipo existe se está sendo alterado
            if dados.get('tipo_colaborador_id'):
                if not await self.verificar_tipo_existe(dados['tipo_colaborador_id']):
                    raise NotFoundException(f"Tipo de colaborador não encontrado: {dados['tipo_colaborador_id']}")
            
            # Verificar duplicidade de CPF se alterado
            if dados.get('cpf'):
                colaborador_existente = await self.buscar_por_cpf(dados['cpf'], "SUPER_ADMIN")
                if colaborador_existente and colaborador_existente['id'] != colaborador_id:
                    raise ConflictException(f"Já existe um colaborador com o CPF '{dados['cpf']}'")
            
            # Verificar duplicidade de email se alterado
            if dados.get('email'):
                dados['email'] = dados['email'].lower().strip()
                colaborador_existente = await self.buscar_por_email(dados['email'], "SUPER_ADMIN")
                if colaborador_existente and colaborador_existente['id'] != colaborador_id:
                    raise ConflictException(f"Já existe um colaborador com o email '{dados['email']}'")
            
            # Adicionar timestamp de atualização
            dados['updated_at'] = datetime.utcnow().isoformat()
            
            # Atualizar no banco
            response = await self.db.table(self.table).update(dados).eq("id", colaborador_id).execute()
            
            if not response.data:
                raise NotFoundException(f"Colaborador não encontrado: {colaborador_id}")
            
            return True
        
        except (ConflictException, NotFoundException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar colaborador {colaborador_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar colaborador: {str(e)}")
    
    async def desativar(self, colaborador_id: str) -> bool:
        """
        Desativa um colaborador (soft delete)
        
        Args:
            colaborador_id: UUID do colaborador
            
        Returns:
            True se desativado com sucesso
        """
        try:
            dados_atualizacao = {
                'ativo': False,
                'updated_at': datetime.utcnow().isoformat()
            }
            
            response = await self.db.table(self.table).update(dados_atualizacao).eq("id", colaborador_id).execute()
            
            if not response.data:
                raise NotFoundException(f"Colaborador não encontrado: {colaborador_id}")
            
            return True
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao desativar colaborador {colaborador_id}: {str(e)}")
            raise DatabaseException(f"Erro ao desativar colaborador: {str(e)}") 