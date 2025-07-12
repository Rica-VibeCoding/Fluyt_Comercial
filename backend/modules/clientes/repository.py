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
        loja_id: Optional[str],
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20,
        incluir_inativos: bool = False
    ) -> Dict[str, Any]:
        """
        Lista clientes com filtros e paginação, usando JOINs para dados relacionados.
        """
        try:
            # ✨ FIX: Unificar a query para usar JOINs, garantindo consistência
            # e incluindo os nomes de vendedor e procedência em uma única chamada.
            query = self.db.table(self.table).select(
                """
                *,
                vendedor:cad_equipe!vendedor_id(id, nome),
                procedencia:c_procedencias!procedencia_id(id, nome)
                """
            )

            # Filtra por ativos por padrão
            if not incluir_inativos:
                query = query.eq('ativo', True)
            
            # Aplica filtro de loja apenas se fornecido (RLS)
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)

            # Prepara a query de contagem com os mesmos filtros de RLS
            count_query = self.db.table(self.table).select('id', count='exact')
            if not incluir_inativos:
                count_query = count_query.eq('ativo', True)
            if loja_id is not None:
                count_query = count_query.eq('loja_id', loja_id)
            
            # Aplica filtros opcionais na query principal e na de contagem
            if filtros:
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    or_filter = f"nome.ilike.{busca},cpf_cnpj.ilike.{busca},telefone.ilike.{busca}"
                    query = query.or_(or_filter)
                    count_query = count_query.or_(or_filter)
                if filtros.get('tipo_venda'):
                    query = query.eq('tipo_venda', filtros['tipo_venda'])
                    count_query = count_query.eq('tipo_venda', filtros['tipo_venda'])
                if filtros.get('vendedor_id'):
                    query = query.eq('vendedor_id', filtros['vendedor_id'])
                    count_query = count_query.eq('vendedor_id', filtros['vendedor_id'])
                if filtros.get('procedencia_id'):
                    query = query.eq('procedencia_id', filtros['procedencia_id'])
                    count_query = count_query.eq('procedencia_id', filtros['procedencia_id'])
                if filtros.get('data_inicio'):
                    query = query.gte('created_at', filtros['data_inicio'].isoformat())
                    count_query = count_query.gte('created_at', filtros['data_inicio'].isoformat())
                if filtros.get('data_fim'):
                    query = query.lte('created_at', filtros['data_fim'].isoformat())
                    count_query = count_query.lte('created_at', filtros['data_fim'].isoformat())

            # Executa a query de contagem
            count_result = count_query.execute()
            total = count_result.count or 0
            
            # Aplica ordenação e paginação na query principal
            query = query.order('created_at', desc=True)
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            # Executa a query principal
            result = query.execute()
            
            # Processa os dados para extrair os nomes dos campos aninhados
            items = []
            for item in result.data:
                # Extrai nome do vendedor do objeto aninhado
                if item.get('vendedor'):
                    item['vendedor_nome'] = item['vendedor'].get('nome')
                
                # Extrai nome da procedência do objeto aninhado
                if item.get('procedencia'):
                    item['procedencia'] = item['procedencia'].get('nome') # Substitui o objeto pelo nome
                
                # Remove os objetos aninhados para limpar a resposta, evitando redundância
                if 'vendedor' in item:
                    del item['vendedor']

                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit if limit > 0 else 0
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar clientes: {str(e)}")
            raise DatabaseException(f"Erro ao listar clientes: {str(e)}")
    
    async def buscar_por_id(self, cliente_id: str, loja_id: Optional[str]) -> Dict[str, Any]:
        """
        Busca um cliente específico pelo ID, apenas se estiver ativo.
        
        Args:
            cliente_id: ID do cliente
            loja_id: ID da loja (para RLS)
            
        Returns:
            Dados completos do cliente
            
        Raises:
            NotFoundException: Se o cliente não for encontrado ou estiver inativo
        """
        try:
            query = self.db.table(self.table).select(
                """
                *,
                vendedor:cad_equipe!vendedor_id(id, nome),
                procedencia:c_procedencias!procedencia_id(id, nome)
                """
            ).eq('id', cliente_id).eq('ativo', True) # Garante que só retorne ativos
            
            # Aplica filtro de loja apenas se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if not result.data:
                raise NotFoundException(f"Cliente não encontrado ou inativo: {cliente_id}")
            
            cliente = result.data[0]
            
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
    
    async def buscar_por_cpf_cnpj(self, cpf_cnpj: str, loja_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Busca cliente pelo CPF ou CNPJ, apenas se estiver ativo.
        
        Args:
            cpf_cnpj: CPF ou CNPJ do cliente
            loja_id: ID da loja
            
        Returns:
            Dados do cliente ou None se não encontrado
        """
        try:
            query = self.db.table(self.table).select('*').eq('cpf_cnpj', cpf_cnpj).eq('ativo', True)
            
            # Aplica filtro de loja apenas se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por CPF/CNPJ: {str(e)}")
            raise DatabaseException(f"Erro ao buscar cliente: {str(e)}")
    
    async def buscar_por_nome(self, nome: str, loja_id: Optional[str]) -> Optional[Dict[str, Any]]:
        """
        Busca cliente pelo nome exato, apenas se estiver ativo.
        
        Args:
            nome: Nome do cliente
            loja_id: ID da loja
            
        Returns:
            Dados do cliente ou None se não encontrado
        """
        try:
            query = self.db.table(self.table).select('*').eq('nome', nome).eq('ativo', True)
            
            # Aplica filtro de loja apenas se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
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
            ConflictException: Se nome já existe (CPF/CNPJ pode repetir)
        """
        try:
            # Verifica se nome já existe
            existe_nome = await self.buscar_por_nome(dados['nome'], loja_id)
            if existe_nome:
                raise ConflictException(
                    f"Cliente com nome '{dados['nome']}' já cadastrado"
                )
            
            # CPF/CNPJ pode se repetir - apenas logamos para auditoria
            if dados.get('cpf_cnpj'):
                existe = await self.buscar_por_cpf_cnpj(dados['cpf_cnpj'], loja_id)
                if existe:
                    logger.info(f"INFO: CPF/CNPJ '{dados['cpf_cnpj']}' já existe em outro cliente - permitido")
            
            # Adiciona loja_id e garante que o cliente seja criado como ativo
            dados['loja_id'] = loja_id
            dados['ativo'] = True
            
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
        loja_id: Optional[str]
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
            ConflictException: Se nome já existe em outro cliente (CPF/CNPJ pode repetir)
        """
        try:
            # Verifica se cliente existe
            cliente_atual = await self.buscar_por_id(cliente_id, loja_id)
            
            # Se está mudando o nome, verifica duplicidade
            if 'nome' in dados and dados['nome'] != cliente_atual['nome']:
                existe_nome = await self.buscar_por_nome(dados['nome'], loja_id)
                if existe_nome:
                    raise ConflictException(
                        f"Cliente com nome '{dados['nome']}' já cadastrado"
                    )
            
            # CPF/CNPJ pode se repetir - apenas logamos para auditoria na atualização
            if 'cpf_cnpj' in dados and dados['cpf_cnpj'] != cliente_atual['cpf_cnpj']:
                existe = await self.buscar_por_cpf_cnpj(dados['cpf_cnpj'], loja_id)
                if existe:
                    logger.info(f"INFO: CPF/CNPJ '{dados['cpf_cnpj']}' já existe em outro cliente - permitido na atualização")
            
            # Atualiza apenas campos fornecidos
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            # Atualiza o cliente
            query = self.db.table(self.table).update(dados_limpos).eq('id', cliente_id)
            
            # Aplica filtro de loja apenas se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar cliente")
            
            return result.data[0]
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar cliente {cliente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar cliente: {str(e)}")
    
    async def excluir(self, cliente_id: str, loja_id: Optional[str]) -> bool:
        """
        Inativa um cliente (soft delete) mudando o campo 'ativo' para False.
        
        Args:
            cliente_id: ID do cliente
            loja_id: ID da loja (para RLS)
            
        Returns:
            True se inativado com sucesso
            
        Raises:
            NotFoundException: Se cliente não encontrado
        """
        try:
            # Verifica se o cliente existe antes de tentar inativar
            await self.buscar_por_id(cliente_id, loja_id)
            
            # Inativa o cliente (soft delete)
            query = self.db.table(self.table).update({'ativo': False}).eq('id', cliente_id)
            
            # Aplica filtro de loja apenas se fornecido (camada extra de segurança RLS)
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            # A API de update retorna os dados atualizados. Se a lista não estiver vazia, foi sucesso.
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao inativar cliente {cliente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao inativar cliente: {str(e)}")
    
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
    
    async def contar(self, loja_id: Optional[str] = None, filtros: Dict[str, Any] = None) -> int:
        """
        Conta clientes com filtros opcionais
        
        Args:
            loja_id: ID da loja (para RLS)
            filtros: Filtros opcionais
            
        Returns:
            Número de clientes que atendem aos critérios
        """
        try:
            query = self.db.table(self.table).select('id', count='exact').eq('ativo', True)
            
            # Aplica filtro de loja apenas se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
            
            # Aplica filtros opcionais
            if filtros:
                # Busca textual
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
            
            result = query.execute()
            return result.count or 0
            
        except Exception as e:
            logger.error(f"Erro ao contar clientes: {str(e)}")
            raise DatabaseException(f"Erro ao contar clientes: {str(e)}")