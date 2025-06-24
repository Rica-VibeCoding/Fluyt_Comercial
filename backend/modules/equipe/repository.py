"""
Repository - Camada de acesso ao banco de dados para funcionários
Responsável por todas as operações com o Supabase na tabela cad_equipe
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class FuncionarioRepository:
    """
    Classe responsável por acessar a tabela cad_equipe no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table = 'cad_equipe'
    
    def listar(
        self,
        loja_id: Optional[str] = None,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Lista funcionários com filtros e paginação
        OTIMIZADO: Usa nested select para evitar problema N+1
        
        Args:
            loja_id: ID da loja (para filtrar por loja)
            filtros: Dicionário com filtros opcionais
            page: Página atual
            limit: Itens por página
            
        Returns:
            Dicionário com items e informações de paginação
        """
        try:
            # Buscar funcionários (sem joins devido a limitação do cliente Python)
            query = self.db.table(self.table).select('*').eq('ativo', True)
            
            # Aplica filtro de loja se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
            
            # Aplica filtros opcionais
            if filtros:
                # Busca textual (nome, email) - SOLUÇÃO ALTERNATIVA sem .or_()
                if filtros.get('busca'):
                    termo_busca = f"%{filtros['busca']}%"
                    # Como .or_() não funciona, usar apenas busca por nome
                    query = query.ilike('nome', termo_busca)
                
                # Perfil do funcionário
                if filtros.get('perfil'):
                    query = query.eq('perfil', filtros['perfil'])
                
                # Setor
                if filtros.get('setor_id'):
                    query = query.eq('setor_id', filtros['setor_id'])
                
                # Período de admissão
                if filtros.get('data_inicio'):
                    query = query.gte('data_admissao', filtros['data_inicio'].isoformat())
                
                if filtros.get('data_fim'):
                    query = query.lte('data_admissao', filtros['data_fim'].isoformat())
            
            # Conta total de registros (sem paginação)
            count_query = self.db.table(self.table).select('id', count='exact').eq('ativo', True)
            if loja_id is not None:
                count_query = count_query.eq('loja_id', loja_id)
            count_result = count_query.execute()
            
            total = count_result.count or 0
            
            # Aplica ordenação (alfabética por nome)
            query = query.order('nome')
            
            # Aplica paginação
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            # Executa a query OTIMIZADA
            result = query.execute()
            
            # Processa os dados e busca nomes relacionados separadamente
            items = []
            for item in result.data:
                # Busca nome da loja se houver loja_id
                if item.get('loja_id'):
                    try:
                        loja_result = self.db.table('c_lojas').select('nome').eq('id', item['loja_id']).execute()
                        if loja_result.data:
                            item['loja_nome'] = loja_result.data[0]['nome']
                    except:
                        item['loja_nome'] = None
                else:
                    item['loja_nome'] = None
                
                # Busca nome do setor se houver setor_id
                if item.get('setor_id'):
                    try:
                        setor_result = self.db.table('cad_setores').select('nome').eq('id', item['setor_id']).execute()
                        if setor_result.data:
                            item['setor_nome'] = setor_result.data[0]['nome']
                    except:
                        item['setor_nome'] = None
                else:
                    item['setor_nome'] = None
                
                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar funcionários: {str(e)}")
            raise DatabaseException(f"Erro ao listar funcionários: {str(e)}")
    
    def buscar_por_id(self, funcionario_id: str, loja_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Busca um funcionário específico pelo ID
        OTIMIZADO: Usa nested select para evitar problema N+1
        
        Args:
            funcionario_id: ID do funcionário
            loja_id: ID da loja (para filtrar por loja)
            
        Returns:
            Dados completos do funcionário
            
        Raises:
            NotFoundException: Se o funcionário não for encontrado
        """
        try:
            # Buscar funcionário (sem joins devido a limitação do cliente Python)
            query = self.db.table(self.table).select('*').eq('id', funcionario_id).eq('ativo', True)
            
            # Aplica filtro de loja se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if not result.data:
                raise NotFoundException(f"Funcionário não encontrado: {funcionario_id}")
            
            funcionario = result.data[0]
            
            # Busca dados relacionados separadamente
            # Busca nome da loja se houver loja_id
            if funcionario.get('loja_id'):
                try:
                    loja_result = self.db.table('c_lojas').select('nome').eq('id', funcionario['loja_id']).execute()
                    if loja_result.data:
                        funcionario['loja_nome'] = loja_result.data[0]['nome']
                except:
                    funcionario['loja_nome'] = None
            else:
                funcionario['loja_nome'] = None
            
            # Busca nome do setor se houver setor_id
            if funcionario.get('setor_id'):
                try:
                    setor_result = self.db.table('cad_setores').select('nome').eq('id', funcionario['setor_id']).execute()
                    if setor_result.data:
                        funcionario['setor_nome'] = setor_result.data[0]['nome']
                except:
                    funcionario['setor_nome'] = None
            else:
                funcionario['setor_nome'] = None
            
            return funcionario
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar funcionário {funcionario_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar funcionário: {str(e)}")
    
    def buscar_por_nome(self, nome: str, loja_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Busca funcionário pelo nome exato
        
        Args:
            nome: Nome do funcionário
            loja_id: ID da loja (para filtrar por loja)
            
        Returns:
            Dados do funcionário ou None se não encontrado
        """
        try:
            query = self.db.table(self.table).select('*').eq('nome', nome).eq('ativo', True)
            
            # Aplica filtro de loja se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por nome: {str(e)}")
            raise DatabaseException(f"Erro ao buscar funcionário: {str(e)}")
    
    def buscar_por_email(self, email: str, loja_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Busca funcionário pelo email
        
        Args:
            email: Email do funcionário
            loja_id: ID da loja (para filtrar por loja)
            
        Returns:
            Dados do funcionário ou None se não encontrado
        """
        try:
            query = self.db.table(self.table).select('*').eq('email', email).eq('ativo', True)
            
            # Aplica filtro de loja se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao buscar por email: {str(e)}")
            raise DatabaseException(f"Erro ao buscar funcionário: {str(e)}")
    
    def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo funcionário
        
        Args:
            dados: Dados do funcionário
            
        Returns:
            Funcionário criado com ID
            
        Raises:
            ConflictException: Se nome já existe (email pode repetir)
        """
        try:
            logger.info(f"Criando funcionário: dados={dados}")
            
            # Normaliza e verifica se nome já existe
            nome_normalizado = dados['nome'].strip() if dados['nome'] else ''
            if not nome_normalizado:
                raise ConflictException("Nome do funcionário é obrigatório")
            
            # Verifica se nome já existe (considerando loja se fornecida)
            loja_id = dados.get('loja_id')
            existe_nome = self.buscar_por_nome(nome_normalizado, loja_id)
            if existe_nome:
                logger.warning(f"CONFLICT: Nome '{nome_normalizado}' já existe no funcionário {existe_nome['id']}")
                raise ConflictException(
                    f"Funcionário com nome '{nome_normalizado}' já cadastrado"
                )
            
            # Email pode se repetir - apenas logamos para auditoria
            if dados.get('email'):
                email_normalizado = dados['email'].strip().lower() if dados['email'] else ''
                if email_normalizado:
                    existe_email = self.buscar_por_email(email_normalizado, loja_id)
                    if existe_email:
                        logger.info(f"INFO: Email '{email_normalizado}' já existe em outro funcionário - permitido")
            
            # Normaliza dados antes de inserir
            dados_normalizados = dados.copy()
            dados_normalizados['nome'] = nome_normalizado
            if dados.get('email'):
                dados_normalizados['email'] = email_normalizado
            
            # Converte UUIDs e dates para string (correção para erro de serialização)
            if dados_normalizados.get('loja_id'):
                dados_normalizados['loja_id'] = str(dados_normalizados['loja_id'])
            if dados_normalizados.get('setor_id'):
                dados_normalizados['setor_id'] = str(dados_normalizados['setor_id'])
            if dados_normalizados.get('data_admissao'):
                # Converter date para string ISO
                if hasattr(dados_normalizados['data_admissao'], 'isoformat'):
                    dados_normalizados['data_admissao'] = dados_normalizados['data_admissao'].isoformat()
                elif isinstance(dados_normalizados['data_admissao'], str):
                    # Já é string, manter como está
                    pass
            
            # Cria o funcionário
            result = self.db.table(self.table).insert(dados_normalizados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar funcionário")
            
            return result.data[0]
        
        except ConflictException:
            raise
        except Exception as e:
            logger.error(f"Erro ao criar funcionário: {str(e)}")
            raise DatabaseException(f"Erro ao criar funcionário: {str(e)}")
    
    def atualizar(
        self,
        funcionario_id: str,
        dados: Dict[str, Any],
        loja_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Atualiza dados de um funcionário
        
        Args:
            funcionario_id: ID do funcionário
            dados: Dados a atualizar
            loja_id: ID da loja (para filtrar por loja)
            
        Returns:
            Funcionário atualizado
            
        Raises:
            NotFoundException: Se funcionário não encontrado
            ConflictException: Se nome já existe em outro funcionário (email pode repetir)
        """
        try:
            # Verifica se funcionário existe
            funcionario_atual = self.buscar_por_id(funcionario_id, loja_id)
            logger.info(f"Atualizando funcionário {funcionario_id}: dados={dados}")
            
            # Se está mudando o nome, verifica duplicidade
            if 'nome' in dados:
                nome_novo = dados['nome'].strip() if dados['nome'] else ''
                nome_atual = funcionario_atual['nome'].strip() if funcionario_atual['nome'] else ''
                if nome_novo and nome_novo != nome_atual:
                    existe_nome = self.buscar_por_nome(nome_novo, loja_id)
                    if existe_nome:
                        logger.warning(f"CONFLICT: Nome '{nome_novo}' já existe no funcionário {existe_nome['id']}")
                        raise ConflictException(
                            f"Funcionário com nome '{nome_novo}' já cadastrado"
                        )
            
            # Email pode se repetir - apenas logamos para auditoria na atualização
            if 'email' in dados:
                email_novo = dados['email'].strip().lower() if dados['email'] else None
                email_atual = funcionario_atual['email'].strip().lower() if funcionario_atual['email'] else None
                if email_novo and email_novo != email_atual:
                    existe_email = self.buscar_por_email(email_novo, loja_id)
                    if existe_email:
                        logger.info(f"INFO: Email '{email_novo}' já existe em outro funcionário - permitido na atualização")
            
            # Atualiza apenas campos fornecidos
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            # Converte UUIDs e dates para string (correção para erro de serialização)
            if dados_limpos.get('loja_id'):
                dados_limpos['loja_id'] = str(dados_limpos['loja_id'])
            if dados_limpos.get('setor_id'):
                dados_limpos['setor_id'] = str(dados_limpos['setor_id'])
            if dados_limpos.get('data_admissao'):
                # Converter date para string ISO
                if hasattr(dados_limpos['data_admissao'], 'isoformat'):
                    dados_limpos['data_admissao'] = dados_limpos['data_admissao'].isoformat()
                elif isinstance(dados_limpos['data_admissao'], str):
                    # Já é string, manter como está
                    pass
            
            # Atualiza o funcionário
            query = self.db.table(self.table).update(dados_limpos).eq('id', funcionario_id)
            
            # Aplica filtro de loja se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar funcionário")
            
            return result.data[0]
        
        except (NotFoundException, ConflictException):
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar funcionário {funcionario_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar funcionário: {str(e)}")
    
    def excluir(self, funcionario_id: str, loja_id: Optional[str] = None) -> bool:
        """
        Exclui um funcionário (soft delete - marca como inativo)
        
        Args:
            funcionario_id: ID do funcionário
            loja_id: ID da loja (para filtrar por loja)
            
        Returns:
            True se excluído com sucesso
            
        Raises:
            NotFoundException: Se funcionário não encontrado
        """
        try:
            # Verifica se existe
            self.buscar_por_id(funcionario_id, loja_id)
            
            # Marca como inativo em vez de deletar fisicamente
            query = self.db.table(self.table).update({'ativo': False}).eq('id', funcionario_id)
            
            # Aplica filtro de loja se fornecido
            if loja_id is not None:
                query = query.eq('loja_id', loja_id)
                
            result = query.execute()
            
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir funcionário {funcionario_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir funcionário: {str(e)}")
    
    # MÉTODO EXCLUIR (HARD DELETE) REMOVIDO INTENCIONALMENTE
    # Usamos apenas soft delete através do método excluir()
    # Isso garante que dados nunca sejam perdidos permanentemente 