"""
Repository - Camada de acesso ao banco de dados para lojas
Responsável por todas as operações com o Supabase
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class LojaRepository:
    """
    Classe responsável por acessar a tabela de lojas no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'c_lojas'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Lista lojas com filtros e paginação
        
        Args:
            filtros: Dicionário com filtros opcionais
            page: Página atual
            limit: Itens por página
            
        Returns:
            Dicionário com items e informações de paginação
        """
        try:
            # Inicia a query base com JOINs
            query = self.db.table(self.table).select(
                """
                *,
                empresa:cad_empresas!empresa_id(id, nome),
                gerente:cad_equipe!gerente_id(id, nome)
                """
            ).eq('ativo', True)  # Filtrar apenas lojas ativas (soft delete)
            
            # Aplica filtros opcionais
            if filtros:
                # Busca textual (nome, telefone, email)
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.or_(
                        f"nome.ilike.{busca},"
                        f"telefone.ilike.{busca},"
                        f"email.ilike.{busca}"
                    )
                
                # Empresa
                if filtros.get('empresa_id'):
                    query = query.eq('empresa_id', filtros['empresa_id'])
                
                # Gerente
                if filtros.get('gerente_id'):
                    query = query.eq('gerente_id', filtros['gerente_id'])
                
                # Período de cadastro
                if filtros.get('data_inicio'):
                    query = query.gte('created_at', filtros['data_inicio'].isoformat())
                
                if filtros.get('data_fim'):
                    query = query.lte('created_at', filtros['data_fim'].isoformat())
            
            # Conta total de registros (sem paginação)
            count_query = self.db.table(self.table).select('id', count='exact').eq('ativo', True)
            count_result = count_query.execute()
            
            total = count_result.count or 0
            
            # Aplica ordenação (mais recentes primeiro)
            query = query.order('created_at', desc=True)
            
            # Aplica paginação
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            # Executa a query
            result = query.execute()
            
            # Processa os dados retornados
            items = []
            for item in result.data:
                # Extrai dados da empresa
                if item.get('empresa'):
                    item['empresa'] = item['empresa'].get('nome')
                
                # Extrai dados do gerente
                if item.get('gerente'):
                    item['gerente'] = item['gerente'].get('nome')
                
                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar lojas: {str(e)}")
            raise DatabaseException(f"Erro ao listar lojas: {str(e)}")
    
    async def buscar_por_id(self, loja_id: str) -> Dict[str, Any]:
        """
        Busca uma loja específica pelo ID
        
        Args:
            loja_id: ID da loja
            
        Returns:
            Dados completos da loja
            
        Raises:
            NotFoundException: Se a loja não for encontrada
        """
        try:
            query = self.db.table(self.table).select(
                """
                *,
                empresa:cad_empresas!empresa_id(id, nome),
                gerente:cad_equipe!gerente_id(id, nome)
                """
            ).eq('id', loja_id).eq('ativo', True)  # Filtrar apenas lojas ativas
                
            result = query.execute()
            
            if not result.data:
                raise NotFoundException(f"Loja não encontrada: {loja_id}")
            
            loja = result.data[0]
            
            # Processa dados relacionados
            if loja.get('empresa'):
                loja['empresa'] = loja['empresa'].get('nome')
            
            if loja.get('gerente'):
                loja['gerente'] = loja['gerente'].get('nome')
            
            return loja
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar loja {loja_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar loja: {str(e)}")
    
    async def buscar_por_nome(self, nome: str) -> Optional[Dict[str, Any]]:
        """
        Busca loja pelo nome exato
        
        Args:
            nome: Nome da loja
            
        Returns:
            Dados da loja ou None se não encontrada
        """
        try:
            query = self.db.table(self.table).select('*').eq('nome', nome).eq('ativo', True)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
            raise DatabaseException(f"Erro ao buscar loja: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma nova loja
        
        Args:
            dados: Dados da loja
            
        Returns:
            Loja criada com ID
            
        Raises:
            ConflictException: Se nome já existe
        """
        try:
            # Verifica se nome já existe
            existe_nome = await self.buscar_por_nome(dados['nome'])
            if existe_nome:
                raise ConflictException(
                    f"Loja com nome '{dados['nome']}' já cadastrada"
                )
            
            # Trata strings vazias em campos UUID como None antes de criar
            dados_limpos = {}
            for k, v in dados.items():
                if v is not None:
                    # Para campos UUID, converte string vazia para None
                    if k in ['empresa_id', 'gerente_id'] and v == "":
                        dados_limpos[k] = None
                    else:
                        dados_limpos[k] = v
                        
            # Cria a loja
            result = self.db.table(self.table).insert(dados_limpos).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar loja")
            
            return result.data[0]
        
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar loja: {str(e)}")
            raise DatabaseException(f"Erro ao criar loja: {str(e)}")
    
    async def atualizar(
        self,
        loja_id: str,
        dados: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza dados de uma loja
        
        Args:
            loja_id: ID da loja
            dados: Dados a atualizar
            
        Returns:
            Loja atualizada
            
        Raises:
            NotFoundException: Se loja não encontrada
            ConflictException: Se nome já existe em outra loja
        """
        try:
            # Verifica se loja existe
            loja_atual = await self.buscar_por_id(loja_id)
            
            # Se está mudando o nome, verifica duplicidade
            if 'nome' in dados and dados['nome'] != loja_atual['nome']:
                existe_nome = await self.buscar_por_nome(dados['nome'])
                if existe_nome:
                    raise ConflictException(
                        f"Loja com nome '{dados['nome']}' já cadastrada"
                    )
            
            # Atualiza apenas campos fornecidos
            # Trata strings vazias em campos UUID como None
            dados_limpos = {}
            for k, v in dados.items():
                if v is not None:
                    # Para campos UUID, converte string vazia para None
                    if k in ['empresa_id', 'gerente_id'] and v == "":
                        dados_limpos[k] = None
                    else:
                        dados_limpos[k] = v
            
            # Atualiza a loja
            query = self.db.table(self.table).update(dados_limpos).eq('id', loja_id)
                
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar loja")
            
            return result.data[0]
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar loja {loja_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar loja: {str(e)}")
    
    async def excluir(self, loja_id: str) -> bool:
        """
        Exclui uma loja (soft delete - marca como inativa)
        
        Args:
            loja_id: ID da loja
            
        Returns:
            True se excluída com sucesso
            
        Raises:
            NotFoundException: Se loja não encontrada
        """
        try:
            # Verifica se existe
            await self.buscar_por_id(loja_id)
            
            # Marca como inativa em vez de deletar fisicamente
            query = self.db.table(self.table).update({'ativo': False}).eq('id', loja_id)
                
            result = query.execute()
            
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir loja {loja_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir loja: {str(e)}")
    
    async def contar_total_publico(self) -> int:
        """
        Conta o total de lojas (sem filtros)
        
        **APENAS PARA TESTE DE CONECTIVIDADE**
        
        Returns:
            Número total de lojas na tabela
        """
        try:
            result = self.db.table(self.table).select(
                'id', count='exact'
            ).execute()
            
            logger.info(f"Query executada na tabela: {self.table}")
            logger.info(f"Resultado count: {result.count}")
            logger.info(f"Dados retornados: {len(result.data) if result.data else 0} registros")
            
            return result.count or 0
        
        except Exception as e:
            logger.error(f"Erro ao contar lojas publicamente: {str(e)}")
            return 0 