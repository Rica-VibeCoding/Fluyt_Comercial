"""
Repository - Camada de acesso ao banco de dados para clientes
Responsável por todas as operações com o Supabase
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class ClienteRepository:
    """
    Classe responsável por acessar a tabela de clientes no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'c_clientes'
    
    async def listar(
        self,
        loja_id: str,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Lista clientes com filtros e paginação
        
        Args:
            loja_id: ID da loja (para RLS)
            filtros: Dicionário com filtros opcionais
            page: Página atual
            limit: Itens por página
            
        Returns:
            Dicionário com items e informações de paginação
        """
        try:
            # Inicia a query base
            query = self.db.table(self.table).select(
                """
                *,
                vendedor:c_equipe!vendedor_id(id, nome),
                procedencia:c_procedencias!procedencia_id(id, nome)
                """
            )
            
            # Aplica filtro de loja (RLS)
            query = query.eq('loja_id', loja_id)
            
            # Aplica filtros opcionais
            if filtros:
                # Busca textual (nome, CPF/CNPJ, telefone)
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.or_(
                        f"nome.ilike.{busca},"
                        f"cpf_cnpj.ilike.{busca},"
                        f"telefone.ilike.{busca}"
                    )
                
                # Tipo de venda
                if filtros.get('tipo_venda'):
                    query = query.eq('tipo_venda', filtros['tipo_venda'])
                
                # Vendedor
                if filtros.get('vendedor_id'):
                    query = query.eq('vendedor_id', filtros['vendedor_id'])
                
                # Procedência
                if filtros.get('procedencia_id'):
                    query = query.eq('procedencia_id', filtros['procedencia_id'])
                
                # Período de cadastro
                if filtros.get('data_inicio'):
                    query = query.gte('created_at', filtros['data_inicio'].isoformat())
                
                if filtros.get('data_fim'):
                    query = query.lte('created_at', filtros['data_fim'].isoformat())
            
            # Conta total de registros (sem paginação)
            count_result = self.db.table(self.table).select(
                'id', count='exact'
            ).eq('loja_id', loja_id).execute()
            
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
                # Extrai dados do vendedor
                if item.get('vendedor'):
                    item['vendedor_nome'] = item['vendedor'].get('nome')
                    del item['vendedor']
                
                # Extrai dados da procedência
                if item.get('procedencia'):
                    item['procedencia'] = item['procedencia'].get('nome')
                
                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar clientes: {str(e)}")
            raise DatabaseException(f"Erro ao listar clientes: {str(e)}")
    
    async def buscar_por_id(self, cliente_id: str, loja_id: str) -> Dict[str, Any]:
        """
        Busca um cliente específico pelo ID
        
        Args:
            cliente_id: ID do cliente
            loja_id: ID da loja (para RLS)
            
        Returns:
            Dados completos do cliente
            
        Raises:
            NotFoundException: Se o cliente não for encontrado
        """
        try:
            result = self.db.table(self.table).select(
                """
                *,
                vendedor:c_equipe!vendedor_id(id, nome),
                procedencia:c_procedencias!procedencia_id(id, nome)
                """
            ).eq('id', cliente_id).eq('loja_id', loja_id).single().execute()
            
            if not result.data:
                raise NotFoundException(f"Cliente não encontrado: {cliente_id}")
            
            cliente = result.data
            
            # Processa dados relacionados
            if cliente.get('vendedor'):
                cliente['vendedor_nome'] = cliente['vendedor'].get('nome')
                del cliente['vendedor']
            
            if cliente.get('procedencia'):
                cliente['procedencia'] = cliente['procedencia'].get('nome')
            
            return cliente
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar cliente {cliente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar cliente: {str(e)}")
    
    async def buscar_por_cpf_cnpj(self, cpf_cnpj: str, loja_id: str) -> Optional[Dict[str, Any]]:
        """
        Busca cliente pelo CPF ou CNPJ
        
        Args:
            cpf_cnpj: CPF ou CNPJ do cliente
            loja_id: ID da loja
            
        Returns:
            Dados do cliente ou None se não encontrado
        """
        try:
            result = self.db.table(self.table).select('*').eq(
                'cpf_cnpj', cpf_cnpj
            ).eq('loja_id', loja_id).execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por CPF/CNPJ: {str(e)}")
            raise DatabaseException(f"Erro ao buscar cliente: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any], loja_id: str) -> Dict[str, Any]:
        """
        Cria um novo cliente
        
        Args:
            dados: Dados do cliente
            loja_id: ID da loja
            
        Returns:
            Cliente criado com ID
            
        Raises:
            ConflictException: Se CPF/CNPJ já existe
        """
        try:
            # Verifica se CPF/CNPJ já existe
            existe = await self.buscar_por_cpf_cnpj(dados['cpf_cnpj'], loja_id)
            if existe:
                raise ConflictException(
                    f"CPF/CNPJ {dados['cpf_cnpj']} já cadastrado"
                )
            
            # Adiciona loja_id aos dados
            dados['loja_id'] = loja_id
            
            # Cria o cliente
            result = self.db.table(self.table).insert(dados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar cliente")
            
            return result.data[0]
        
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar cliente: {str(e)}")
            raise DatabaseException(f"Erro ao criar cliente: {str(e)}")
    
    async def atualizar(
        self,
        cliente_id: str,
        dados: Dict[str, Any],
        loja_id: str
    ) -> Dict[str, Any]:
        """
        Atualiza dados de um cliente
        
        Args:
            cliente_id: ID do cliente
            dados: Dados a atualizar
            loja_id: ID da loja (para RLS)
            
        Returns:
            Cliente atualizado
            
        Raises:
            NotFoundException: Se cliente não encontrado
            ConflictException: Se CPF/CNPJ já existe em outro cliente
        """
        try:
            # Verifica se cliente existe
            cliente_atual = await self.buscar_por_id(cliente_id, loja_id)
            
            # Se está mudando CPF/CNPJ, verifica duplicidade
            if 'cpf_cnpj' in dados and dados['cpf_cnpj'] != cliente_atual['cpf_cnpj']:
                existe = await self.buscar_por_cpf_cnpj(dados['cpf_cnpj'], loja_id)
                if existe:
                    raise ConflictException(
                        f"CPF/CNPJ {dados['cpf_cnpj']} já cadastrado"
                    )
            
            # Atualiza apenas campos fornecidos
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            # Atualiza o cliente
            result = self.db.table(self.table).update(
                dados_limpos
            ).eq('id', cliente_id).eq('loja_id', loja_id).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar cliente")
            
            return result.data[0]
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente {cliente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar cliente: {str(e)}")
    
    async def excluir(self, cliente_id: str, loja_id: str) -> bool:
        """
        Exclui um cliente (soft delete - marca como inativo)
        
        Args:
            cliente_id: ID do cliente
            loja_id: ID da loja (para RLS)
            
        Returns:
            True se excluído com sucesso
            
        Raises:
            NotFoundException: Se cliente não encontrado
        """
        try:
            # Verifica se existe
            await self.buscar_por_id(cliente_id, loja_id)
            
            # Marca como inativo em vez de deletar fisicamente
            result = self.db.table(self.table).update(
                {'ativo': False}
            ).eq('id', cliente_id).eq('loja_id', loja_id).execute()
            
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir cliente {cliente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir cliente: {str(e)}")
    
    async def contar_total_publico(self) -> int:
        """
        Conta o total de clientes (sem filtros de loja)
        
        **APENAS PARA TESTE DE CONECTIVIDADE**
        Método público que não aplica RLS - usado apenas para validar
        que a conexão com Supabase está funcionando
        
        Returns:
            Número total de clientes na tabela
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
            logger.error(f"Erro ao contar clientes publicamente: {str(e)}")
            return 0