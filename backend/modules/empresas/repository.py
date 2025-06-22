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
        OTIMIZADO: Usa nested select para evitar problema N+1
        
        Args:
            filtros: Dicionário com filtros opcionais
            page: Página atual
            limit: Itens por página
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dicionário com items e informações de paginação
        """
        try:
            # Nested select para buscar empresas + lojas em UMA query só
            # Isso elimina o problema N+1 (evita fazer query separada para cada empresa)
            if user_perfil == "SUPER_ADMIN":
                # SUPER_ADMIN vê empresas ativas E inativas
                query = self.db.table(self.table).select('''
                    *,
                    c_lojas (
                        id,
                        ativo
                    )
                ''')
                count_query = self.db.table(self.table).select('id', count='exact')
            else:
                # Outros perfis veem apenas empresas ativas
                query = self.db.table(self.table).select('''
                    *,
                    c_lojas (
                        id,
                        ativo
                    )
                ''').eq('ativo', True)
                count_query = self.db.table(self.table).select('id', count='exact').eq('ativo', True)
            
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
            
            # Conta total de registros (sem paginação)
            count_result = count_query.execute()
            total = count_result.count or 0
            
            # Aplica ordenação (mais recentes primeiro)
            query = query.order('created_at', desc=True)
            
            # Aplica paginação
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            # Executa a query OTIMIZADA (1 query em vez de N+1)
            result = query.execute()
            
            # Processa os dados já unidos
            items = []
            for item in result.data:
                # Lojas já vêm junto na query (nested select)
                lojas = item.get('c_lojas', []) or []
                
                # Conta lojas (mesma lógica de antes)
                item['total_lojas'] = len(lojas)
                item['lojas_ativas'] = len([loja for loja in lojas if loja.get('ativo')])
                
                # Remove dados das lojas do retorno (não precisamos mais)
                item.pop('c_lojas', None)
                
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
        OTIMIZADO: Usa nested select para evitar problema N+1
        
        Args:
            empresa_id: ID da empresa
            user_perfil: Perfil do usuário para controle de hierarquia
            
        Returns:
            Dados completos da empresa
            
        Raises:
            NotFoundException: Se a empresa não for encontrada
        """
        try:
            # Nested select para buscar empresa + lojas em UMA query só
            if user_perfil == "SUPER_ADMIN":
                # SUPER_ADMIN pode buscar qualquer empresa
                query = self.db.table(self.table).select('''
                    *,
                    c_lojas (
                        id,
                        ativo
                    )
                ''').eq('id', empresa_id)
            else:
                # Outros apenas empresas ativas
                query = self.db.table(self.table).select('''
                    *,
                    c_lojas (
                        id,
                        ativo
                    )
                ''').eq('id', empresa_id).eq('ativo', True)
                
            result = query.execute()
            
            if not result.data:
                raise NotFoundException(f"Empresa não encontrada: {empresa_id}")
            
            empresa = result.data[0]
            
            # Lojas já vêm junto na query (nested select)
            lojas = empresa.get('c_lojas', []) or []
            
            # Processa dados das lojas (mesma lógica de antes)
            empresa['total_lojas'] = len(lojas)
            empresa['lojas_ativas'] = len([loja for loja in lojas if loja.get('ativo')])
            
            # Remove dados das lojas do retorno (não precisamos mais)
            empresa.pop('c_lojas', None)
            
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
            ConflictException: Se nome já existe (CNPJ pode repetir)
        """
        try:
            logger.info(f"Criando empresa: dados={dados}")
            
            # Normaliza e verifica se nome já existe
            nome_normalizado = dados['nome'].strip() if dados['nome'] else ''
            if not nome_normalizado:
                raise ConflictException("Nome da empresa é obrigatório")
                
            existe_nome = await self.buscar_por_nome(nome_normalizado, "SUPER_ADMIN")
            if existe_nome:
                logger.warning(f"CONFLICT: Nome '{nome_normalizado}' já existe na empresa {existe_nome['id']}")
                raise ConflictException(
                    f"Empresa com nome '{nome_normalizado}' já cadastrada"
                )
            
            # CNPJ pode se repetir - apenas logamos para auditoria
            if dados.get('cnpj'):
                cnpj_normalizado = dados['cnpj'].strip() if dados['cnpj'] else ''
                if cnpj_normalizado:
                    existe_cnpj = await self.buscar_por_cnpj(cnpj_normalizado, "SUPER_ADMIN")
                    if existe_cnpj:
                        logger.info(f"INFO: CNPJ '{cnpj_normalizado}' já existe em outra empresa - permitido")
            
            # Normaliza dados antes de inserir
            dados_normalizados = dados.copy()
            dados_normalizados['nome'] = nome_normalizado
            if dados.get('cnpj'):
                dados_normalizados['cnpj'] = cnpj_normalizado
            
            # Cria a empresa
            result = self.db.table(self.table).insert(dados_normalizados).execute()
            
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
            ConflictException: Se nome já existe em outra empresa (CNPJ pode repetir)
        """
        try:
            # Verifica se empresa existe (SUPER_ADMIN pode buscar qualquer empresa)
            empresa_atual = await self.buscar_por_id(empresa_id, "SUPER_ADMIN")
            logger.info(f"Atualizando empresa {empresa_id}: dados={dados}")
            
            # Se está mudando o nome, verifica duplicidade (busca em todas as empresas)
            if 'nome' in dados:
                nome_novo = dados['nome'].strip() if dados['nome'] else ''
                nome_atual = empresa_atual['nome'].strip() if empresa_atual['nome'] else ''
                if nome_novo and nome_novo != nome_atual:
                    existe_nome = await self.buscar_por_nome(nome_novo, "SUPER_ADMIN")
                    if existe_nome:
                        logger.warning(f"CONFLICT: Nome '{nome_novo}' já existe na empresa {existe_nome['id']}")
                        raise ConflictException(
                            f"Empresa com nome '{nome_novo}' já cadastrada"
                        )
            
            # CNPJ pode se repetir - apenas logamos para auditoria na atualização
            if 'cnpj' in dados:
                cnpj_novo = dados['cnpj'] if dados['cnpj'] else None
                cnpj_atual = empresa_atual['cnpj'] if empresa_atual['cnpj'] else None
                if cnpj_novo and cnpj_novo != cnpj_atual:
                    existe_cnpj = await self.buscar_por_cnpj(cnpj_novo, "SUPER_ADMIN")
                    if existe_cnpj:
                        logger.info(f"INFO: CNPJ '{cnpj_novo}' já existe em outra empresa - permitido na atualização")
            
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

    # MÉTODO EXCLUIR (HARD DELETE) REMOVIDO INTENCIONALMENTE
    # Usamos apenas soft delete através do método desativar()
    # Isso garante que dados nunca sejam perdidos permanentemente
    
    # MÉTODO CONTAR_TOTAL_PUBLICO REMOVIDO POR SEGURANÇA
    # Use métodos autenticados com hierarquia adequada 