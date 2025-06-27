"""
Repository - Camada de acesso ao banco de dados para setores
MODELO CORRETO: SETORES SÃO GLOBAIS (não por loja)
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class SetorRepository:
    """
    Classe responsável por acessar a tabela de setores no Supabase
    SETORES SÃO GLOBAIS - compartilhados entre todas as lojas
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'cad_setores'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Lista setores com filtros e paginação
        SETORES SÃO GLOBAIS - visíveis para todas as lojas
        
        Args:
            filtros: Dicionário com filtros opcionais
            page: Página atual
            limit: Itens por página
            
        Returns:
            Dicionário com items e informações de paginação
        """
        try:
            # Query simplificada - contagem será feita separadamente
            # devido a limitação do cliente Python do Supabase com subqueries
            query = self.db.table(self.table).select('*')
            
            # Aplica filtros
            if filtros:
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.or_(
                        f"nome.ilike.{busca},"
                        f"descricao.ilike.{busca}"
                    )
                
                if filtros.get('ativo') is not None:
                    query = query.eq('ativo', filtros['ativo'])
                else:
                    query = query.eq('ativo', True)
                
                if filtros.get('data_inicio'):
                    query = query.gte('created_at', filtros['data_inicio'].isoformat())
                
                if filtros.get('data_fim'):
                    query = query.lte('created_at', filtros['data_fim'].isoformat())
            else:
                query = query.eq('ativo', True)
            
            # Conta total (sem paginação)
            count_query = self.db.table(self.table).select('id', count='exact')
            if not filtros or filtros.get('ativo') is None:
                count_query = count_query.eq('ativo', True)
            
            # Aplica mesmos filtros na contagem
            if filtros and filtros.get('busca'):
                busca = f"%{filtros['busca']}%"
                count_query = count_query.or_(
                    f"nome.ilike.{busca},"
                    f"descricao.ilike.{busca}"
                )
            
            count_result = count_query.execute()
            total = count_result.count or 0
            
            # Ordenação e paginação
            query = query.order('nome', desc=False)
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            # Executa query
            result = query.execute()
            
            # Adiciona contagem de funcionários para cada setor
            items = []
            for setor in result.data:
                # Conta funcionários ativos deste setor
                count_result = self.db.table('cad_equipe').select(
                    'id', count='exact'
                ).eq('setor_id', setor['id']).eq('ativo', True).execute()
                
                setor['total_funcionarios'] = count_result.count or 0
                items.append(setor)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar setores: {str(e)}")
            raise DatabaseException(f"Erro ao listar setores: {str(e)}")
    
    async def buscar_por_id(self, setor_id: str) -> Dict[str, Any]:
        """
        Busca um setor específico pelo ID
        SETORES SÃO GLOBAIS - qualquer usuário pode ver qualquer setor
        
        Args:
            setor_id: ID do setor
            
        Returns:
            Dados completos do setor
            
        Raises:
            NotFoundException: Se o setor não for encontrado
        """
        try:
            # Query simplificada
            query = self.db.table(self.table).select('*').eq('id', setor_id).eq('ativo', True)
            result = query.execute()
            
            if not result.data:
                raise NotFoundException(f"Setor não encontrado: {setor_id}")
            
            setor = result.data[0]
            
            # Adiciona contagem de funcionários
            count_result = self.db.table('cad_equipe').select(
                'id', count='exact'
            ).eq('setor_id', setor_id).eq('ativo', True).execute()
            
            setor['total_funcionarios'] = count_result.count or 0
            
            return setor
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar setor {setor_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar setor: {str(e)}")
    
    async def buscar_por_nome(self, nome: str) -> Optional[Dict[str, Any]]:
        """
        Busca setor pelo nome exato
        SETORES SÃO GLOBAIS - nomes únicos globalmente
        
        Args:
            nome: Nome do setor
            
        Returns:
            Dados do setor ou None se não encontrado
        """
        try:
            query = self.db.table(self.table).select('*').eq('nome', nome).eq('ativo', True)
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
            raise DatabaseException(f"Erro ao buscar setor: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo setor GLOBAL
        
        Args:
            dados: Dados do setor
            
        Returns:
            Setor criado com ID
            
        Raises:
            ConflictException: Se nome já existe GLOBALMENTE
        """
        try:
            # Verifica se nome já existe globalmente
            existe_nome = await self.buscar_por_nome(dados['nome'])
            if existe_nome:
                raise ConflictException(
                    f"Setor com nome '{dados['nome']}' já existe"
                )
            
            # Adiciona timestamps se não existirem
            now = datetime.now(timezone.utc).isoformat()
            if 'created_at' not in dados:
                dados['created_at'] = now
            if 'updated_at' not in dados:
                dados['updated_at'] = now
            
            # Cria o setor
            result = self.db.table(self.table).insert(dados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar setor")
            
            setor = result.data[0]
            
            # Adiciona contagem inicial (zero)
            setor['total_funcionarios'] = 0
            
            logger.info(f"Setor global criado: {setor['id']} - {setor['nome']}")
            
            return setor
        
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar setor: {str(e)}")
            raise DatabaseException(f"Erro ao criar setor: {str(e)}")
    
    async def atualizar(
        self,
        setor_id: str,
        dados: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza dados de um setor GLOBAL
        
        Args:
            setor_id: ID do setor
            dados: Dados a atualizar
            
        Returns:
            Setor atualizado
            
        Raises:
            NotFoundException: Se setor não encontrado
            ConflictException: Se nome já existe em outro setor
        """
        try:
            # Verifica se setor existe
            setor_atual = await self.buscar_por_id(setor_id)
            
            # Se está mudando o nome, verifica duplicidade global
            if 'nome' in dados and dados['nome'] != setor_atual['nome']:
                existe_nome = await self.buscar_por_nome(dados['nome'])
                if existe_nome:
                    raise ConflictException(
                        f"Setor com nome '{dados['nome']}' já existe"
                    )
            
            # Adiciona timestamp de atualização
            dados['updated_at'] = datetime.now(timezone.utc).isoformat()
            
            # Atualiza apenas campos fornecidos
            query = self.db.table(self.table).update(dados).eq('id', setor_id)
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar setor")
            
            setor = result.data[0]
            
            # Adiciona contagem de funcionários
            setor['total_funcionarios'] = await self.contar_funcionarios(setor_id)
            
            logger.info(f"Setor global atualizado: {setor_id}")
            
            return setor
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar setor {setor_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar setor: {str(e)}")
    
    async def excluir(self, setor_id: str) -> bool:
        """
        Exclui um setor GLOBAL (soft delete)
        
        Args:
            setor_id: ID do setor
            
        Returns:
            True se excluído com sucesso
            
        Raises:
            NotFoundException: Se setor não encontrado
        """
        try:
            # Verifica se existe
            await self.buscar_por_id(setor_id)
            
            # Marca como inativo em vez de deletar fisicamente
            query = self.db.table(self.table).update({'ativo': False}).eq('id', setor_id)
            result = query.execute()
            
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir setor {setor_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir setor: {str(e)}")
    
    async def contar_funcionarios(self, setor_id: str) -> int:
        """
        Conta quantos funcionários estão vinculados a um setor
        CONTA FUNCIONÁRIOS DE TODAS AS LOJAS
        
        Args:
            setor_id: ID do setor
            
        Returns:
            Número total de funcionários no setor (todas as lojas)
        """
        try:
            result = self.db.table('cad_equipe').select(
                'id', count='exact'
            ).eq('setor_id', setor_id).eq('ativo', True).execute()
            
            return result.count or 0
        
        except Exception as e:
            logger.error(f"Erro ao contar funcionários do setor {setor_id}: {str(e)}")
            return 0 