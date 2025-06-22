"""
Repository - Camada de acesso ao banco de dados para empresas
Responsável por todas as operações com o Supabase
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class EmpresaRepository:
    """
    Classe responsável por acessar a tabela de empresas no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'cad_empresas'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20,
        user_perfil: str = None
    ) -> Dict[str, Any]:
        """
        Lista empresas com filtros e paginação
        
        Args:
            filtros: Dicionário com filtros opcionais
            page: Página atual
            limit: Itens por página
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dicionário com items e informações de paginação
        """
        try:
            # Inicia a query base - SUPER_ADMIN vê tudo, outros apenas ativas
            if user_perfil == "SUPER_ADMIN":
                query = self.db.table(self.table).select('*')  # SUPER_ADMIN vê empresas ativas E inativas
                count_query = self.db.table(self.table).select('id', count='exact')  # Count sem filtro
            else:
                query = self.db.table(self.table).select('*').eq('ativo', True)  # Outros veem apenas ativas
                count_query = self.db.table(self.table).select('id', count='exact').eq('ativo', True)  # Count apenas ativas
            
            # Aplica filtros opcionais
            if filtros:
                # Busca textual (nome, CNPJ, email)
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.or_(
                        f"nome.ilike.{busca},"
                        f"cnpj.ilike.{busca},"
                        f"email.ilike.{busca}"
                    )
                
                # Período de cadastro
                if filtros.get('data_inicio'):
                    query = query.gte('created_at', filtros['data_inicio'].isoformat())
                
                if filtros.get('data_fim'):
                    query = query.lte('created_at', filtros['data_fim'].isoformat())
            
            # Conta total de registros (sem paginação) - count_query já definido acima
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
                # Busca lojas desta empresa separadamente
                lojas_query = self.db.table('c_lojas').select('id, ativo').eq('empresa_id', item['id'])
                lojas_result = lojas_query.execute()
                lojas = lojas_result.data if lojas_result.data else []
                
                # Conta lojas
                item['total_lojas'] = len(lojas)
                item['lojas_ativas'] = len([loja for loja in lojas if loja.get('ativo')])
                
                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar empresas: {str(e)}")
            raise DatabaseException(f"Erro ao listar empresas: {str(e)}")
    
    async def buscar_por_id(self, empresa_id: str, user_perfil: str = None) -> Dict[str, Any]:
        """
        Busca uma empresa específica pelo ID
        
        Args:
            empresa_id: ID da empresa
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dados completos da empresa
            
        Raises:
            NotFoundException: Se a empresa não for encontrada
        """
        try:
            # SUPER_ADMIN pode buscar qualquer empresa, outros apenas ativas
            if user_perfil == "SUPER_ADMIN":
                query = self.db.table(self.table).select('*').eq('id', empresa_id)  # SUPER_ADMIN vê qualquer empresa
            else:
                query = self.db.table(self.table).select('*').eq('id', empresa_id).eq('ativo', True)  # Outros apenas ativas
                
            result = query.single().execute()
            
            if not result.data:
                raise NotFoundException(f"Empresa não encontrada: {empresa_id}")
            
            empresa = result.data
            
            # Busca lojas desta empresa separadamente
            lojas_query = self.db.table('c_lojas').select('id, ativo').eq('empresa_id', empresa_id)
            lojas_result = lojas_query.execute()
            lojas = lojas_result.data if lojas_result.data else []
            
            # Processa dados das lojas
            empresa['total_lojas'] = len(lojas)
            empresa['lojas_ativas'] = len([loja for loja in lojas if loja.get('ativo')])
            
            return empresa
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar empresa {empresa_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar empresa: {str(e)}")
    
    async def buscar_por_cnpj(self, cnpj: str, user_perfil: str = None) -> Optional[Dict[str, Any]]:
        """
        Busca empresa pelo CNPJ
        
        Args:
            cnpj: CNPJ da empresa
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dados da empresa ou None se não encontrado
        """
        try:
            # SUPER_ADMIN pode buscar CNPJ em qualquer empresa, outros apenas ativas
            if user_perfil == "SUPER_ADMIN":
                query = self.db.table(self.table).select('*').eq('cnpj', cnpj)
            else:
                query = self.db.table(self.table).select('*').eq('cnpj', cnpj).eq('ativo', True)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por CNPJ: {str(e)}")
            raise DatabaseException(f"Erro ao buscar empresa: {str(e)}")
    
    async def buscar_por_nome(self, nome: str, user_perfil: str = None) -> Optional[Dict[str, Any]]:
        """
        Busca empresa pelo nome exato
        
        Args:
            nome: Nome da empresa
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dados da empresa ou None se não encontrado
        """
        try:
            # SUPER_ADMIN pode buscar nome em qualquer empresa, outros apenas ativas
            if user_perfil == "SUPER_ADMIN":
                query = self.db.table(self.table).select('*').eq('nome', nome)
            else:
                query = self.db.table(self.table).select('*').eq('nome', nome).eq('ativo', True)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
            raise DatabaseException(f"Erro ao buscar empresa: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria uma nova empresa
        
        Args:
            dados: Dados da empresa
            
        Returns:
            Empresa criada com ID
            
        Raises:
            ConflictException: Se CNPJ ou nome já existe
        """
        try:
            # Verifica se nome já existe (busca em todas as empresas para evitar duplicação)
            existe_nome = await self.buscar_por_nome(dados['nome'], "SUPER_ADMIN")
            if existe_nome:
                raise ConflictException(
                    f"Empresa com nome '{dados['nome']}' já cadastrada"
                )
            
            # Verifica se CNPJ já existe APENAS se foi fornecido (busca em todas as empresas)
            if dados.get('cnpj'):
                existe_cnpj = await self.buscar_por_cnpj(dados['cnpj'], "SUPER_ADMIN")
                if existe_cnpj:
                    raise ConflictException(
                        f"CNPJ {dados['cnpj']} já cadastrado"
                    )
            
            # Cria a empresa
            result = self.db.table(self.table).insert(dados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar empresa")
            
            return result.data[0]
        
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar empresa: {str(e)}")
            raise DatabaseException(f"Erro ao criar empresa: {str(e)}")
    
    async def atualizar(
        self,
        empresa_id: str,
        dados: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza dados de uma empresa
        
        Args:
            empresa_id: ID da empresa
            dados: Dados a atualizar
            
        Returns:
            Empresa atualizada
            
        Raises:
            NotFoundException: Se empresa não encontrada
            ConflictException: Se CNPJ ou nome já existe em outra empresa
        """
        try:
            # Verifica se empresa existe (SUPER_ADMIN pode buscar qualquer empresa)
            empresa_atual = await self.buscar_por_id(empresa_id, "SUPER_ADMIN")
            
            # Se está mudando o nome, verifica duplicidade (busca em todas as empresas)
            if 'nome' in dados and dados['nome'] != empresa_atual['nome']:
                existe_nome = await self.buscar_por_nome(dados['nome'], "SUPER_ADMIN")
                if existe_nome:
                    raise ConflictException(
                        f"Empresa com nome '{dados['nome']}' já cadastrada"
                    )
            
            # Se está mudando CNPJ, verifica duplicidade (busca em todas as empresas)
            if 'cnpj' in dados and dados['cnpj'] != empresa_atual['cnpj']:
                existe_cnpj = await self.buscar_por_cnpj(dados['cnpj'], "SUPER_ADMIN")
                if existe_cnpj:
                    raise ConflictException(
                        f"CNPJ {dados['cnpj']} já cadastrado"
                    )
            
            # Atualiza apenas campos fornecidos
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            # Atualiza a empresa
            query = self.db.table(self.table).update(dados_limpos).eq('id', empresa_id)
                
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar empresa")
            
            return result.data[0]
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar empresa {empresa_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar empresa: {str(e)}")
    
    async def desativar(self, empresa_id: str) -> bool:
        """
        Desativa uma empresa (soft delete - marca como inativo)
        
        Args:
            empresa_id: ID da empresa
            
        Returns:
            True se desativado com sucesso
            
        Raises:
            NotFoundException: Se empresa não encontrada
        """
        try:
            # Verifica se existe (SUPER_ADMIN pode desativar qualquer empresa)
            await self.buscar_por_id(empresa_id, "SUPER_ADMIN")
            
            # Marca como inativo em vez de deletar fisicamente
            query = self.db.table(self.table).update({'ativo': False}).eq('id', empresa_id)
                
            result = query.execute()
            
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao desativar empresa {empresa_id}: {str(e)}")
            raise DatabaseException(f"Erro ao desativar empresa: {str(e)}")

    async def excluir(self, empresa_id: str) -> bool:
        """
        Exclui uma empresa PERMANENTEMENTE do banco de dados (hard delete)
        
        ATENÇÃO: Esta operação é IRREVERSÍVEL!
        Remove completamente a empresa e todos os dados relacionados.
        
        Args:
            empresa_id: ID da empresa
            
        Returns:
            True se excluído com sucesso
            
        Raises:
            NotFoundException: Se empresa não encontrada
            ConflictException: Se empresa tem dependências que impedem exclusão
        """
        try:
            # Verifica se existe (SUPER_ADMIN pode excluir qualquer empresa)
            empresa = await self.buscar_por_id(empresa_id, "SUPER_ADMIN")
            
            # Verifica se tem lojas vinculadas
            lojas_query = self.db.table('c_lojas').select('id').eq('empresa_id', empresa_id)
            lojas_result = lojas_query.execute()
            
            if lojas_result.data and len(lojas_result.data) > 0:
                raise ConflictException(
                    f"Não é possível excluir empresa '{empresa['nome']}' pois possui {len(lojas_result.data)} loja(s) vinculada(s). "
                    "Exclua primeiro as lojas ou desative a empresa."
                )
            
            # Verifica se tem contratos vinculados diretamente
            contratos_query = self.db.table('c_contratos').select('id').eq('empresa_id', empresa_id)
            contratos_result = contratos_query.execute()
            
            if contratos_result.data and len(contratos_result.data) > 0:
                raise ConflictException(
                    f"Não é possível excluir empresa '{empresa['nome']}' pois possui {len(contratos_result.data)} contrato(s) vinculado(s). "
                    "Exclua primeiro os contratos ou desative a empresa."
                )
            
            # Se chegou até aqui, pode excluir permanentemente
            logger.warning(f"EXCLUSÃO PERMANENTE: Removendo empresa {empresa['nome']} (ID: {empresa_id}) do banco de dados")
            
            query = self.db.table(self.table).delete().eq('id', empresa_id)
            result = query.execute()
            
            logger.info(f"Empresa {empresa['nome']} excluída permanentemente com sucesso")
            
            return True
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir empresa {empresa_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir empresa: {str(e)}")
    
    async def contar_total_publico(self) -> int:
        """
        Conta o total de empresas (sem filtros)
        
        **APENAS PARA TESTE DE CONECTIVIDADE**
        Método público que não aplica RLS - usado apenas para validar
        que a conexão com Supabase está funcionando
        
        Returns:
            Número total de empresas na tabela
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
            logger.error(f"Erro ao contar empresas publicamente: {str(e)}")
            return 0 