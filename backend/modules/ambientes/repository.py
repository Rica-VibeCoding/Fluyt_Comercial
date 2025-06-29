"""
Repository - Camada de acesso ao banco de dados para ambientes
Responsável por todas as operações com o Supabase
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class AmbienteRepository:
    """
    Classe responsável por acessar as tabelas de ambientes no Supabase
    """
    
    def __init__(self, db: Client):
        """
        Inicializa o repository com a conexão do banco
        
        Args:
            db: Cliente do Supabase já configurado
        """
        self.db = db
        self.table_ambientes = 'c_ambientes'
        self.table_materiais = 'c_ambientes_material'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        per_page: int = 20,
        limit: int = None,
        include_materiais: bool = False,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Lista ambientes com filtros e paginação
        
        Args:
            filtros: Dicionário com filtros opcionais
            page: Página atual
            per_page: Itens por página
            limit: Alias para per_page (compatibilidade)
            include_materiais: Se deve incluir materiais na resposta
            
        Returns:
            Dicionário com items e informações de paginação
        """
        # Compatibilidade com diferentes nomes de parâmetro
        if limit is not None:
            per_page = limit
        
        # Processa filtros do kwargs
        if kwargs:
            if not filtros:
                filtros = {}
            for key, value in kwargs.items():
                if key in ['origem', 'cliente_id', 'nome', 'valor_min', 'valor_max', 'data_inicio', 'data_fim']:
                    filtros[key] = value
        try:
            # Query base com JOIN para cliente
            select_fields = """
                *,
                cliente:c_clientes!cliente_id(id, nome)
            """
            
            # Se incluir materiais, adiciona LEFT JOIN
            if include_materiais:
                select_fields = """
                    *,
                    cliente:c_clientes!cliente_id(id, nome),
                    materiais:c_ambientes_material!ambiente_id(materiais_json, xml_hash)
                """
            
            query = self.db.table(self.table_ambientes).select(select_fields)
            
            # Aplica filtros opcionais
            if filtros:
                # Busca textual (nome do ambiente)
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    query = query.ilike('nome', busca)
                
                # Cliente específico
                if filtros.get('cliente_id'):
                    query = query.eq('cliente_id', filtros['cliente_id'])
                
                # Origem (xml ou manual)
                if filtros.get('origem'):
                    query = query.eq('origem', filtros['origem'])
                
                # Período de importação
                if filtros.get('data_inicio'):
                    query = query.gte('data_importacao', filtros['data_inicio'].date())
                
                if filtros.get('data_fim'):
                    query = query.lte('data_importacao', filtros['data_fim'].date())
                
                # Faixa de valores
                if filtros.get('valor_min'):
                    query = query.gte('valor_venda', float(filtros['valor_min']))
                
                if filtros.get('valor_max'):
                    query = query.lte('valor_venda', float(filtros['valor_max']))
            
            # Conta total de registros (sem paginação)
            count_query = self.db.table(self.table_ambientes).select('id', count='exact')
            
            # Aplica mesmos filtros na contagem
            if filtros:
                if filtros.get('busca'):
                    busca = f"%{filtros['busca']}%"
                    count_query = count_query.ilike('nome', busca)
                if filtros.get('cliente_id'):
                    count_query = count_query.eq('cliente_id', filtros['cliente_id'])
                if filtros.get('origem'):
                    count_query = count_query.eq('origem', filtros['origem'])
                if filtros.get('data_inicio'):
                    count_query = count_query.gte('data_importacao', filtros['data_inicio'].date())
                if filtros.get('data_fim'):
                    count_query = count_query.lte('data_importacao', filtros['data_fim'].date())
                if filtros.get('valor_min'):
                    count_query = count_query.gte('valor_venda', float(filtros['valor_min']))
                if filtros.get('valor_max'):
                    count_query = count_query.lte('valor_venda', float(filtros['valor_max']))
            
            count_result = count_query.execute()
            total = count_result.count or 0
            
            # Ordenação (mais recentes primeiro)
            query = query.order('created_at', desc=True)
            
            # Aplica paginação
            offset = (page - 1) * per_page
            query = query.limit(per_page).offset(offset)
            
            # Executa a query
            result = query.execute()
            
            # Processa os dados retornados
            items = []
            for item in result.data:
                # Extrai nome do cliente
                if item.get('cliente'):
                    item['cliente_nome'] = item['cliente'].get('nome')
                    del item['cliente']  # Remove objeto completo
                
                # Processa materiais se incluídos
                if include_materiais and item.get('materiais'):
                    # Pega o primeiro material (deveria ser único por ambiente)
                    materiais_data = item['materiais']
                    if materiais_data and len(materiais_data) > 0:
                        item['materiais'] = materiais_data[0].get('materiais_json')
                    else:
                        item['materiais'] = None
                elif not include_materiais:
                    # Remove campo materiais se não foi solicitado
                    item.pop('materiais', None)
                
                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': per_page,
                'pages': (total + per_page - 1) // per_page
            }
        
        except Exception as e:
            logger.error(f"Erro ao listar ambientes: {str(e)}")
            raise DatabaseException(f"Erro ao listar ambientes: {str(e)}")
    
    async def buscar_por_id(self, ambiente_id: str, include_materiais: bool = False) -> Dict[str, Any]:
        """
        Busca um ambiente específico pelo ID
        
        Args:
            ambiente_id: ID do ambiente
            include_materiais: Se deve incluir materiais na resposta
            
        Returns:
            Dados completos do ambiente
            
        Raises:
            NotFoundException: Se o ambiente não for encontrado
        """
        try:
            # Query base com JOIN para cliente
            select_fields = """
                *,
                cliente:c_clientes!cliente_id(id, nome)
            """
            
            # Se incluir materiais, adiciona LEFT JOIN
            if include_materiais:
                select_fields = """
                    *,
                    cliente:c_clientes!cliente_id(id, nome),
                    materiais:c_ambientes_material!ambiente_id(materiais_json, xml_hash)
                """
            
            query = self.db.table(self.table_ambientes).select(select_fields).eq('id', ambiente_id)
            result = query.execute()
            
            if not result.data:
                raise NotFoundException(f"Ambiente não encontrado: {ambiente_id}")
            
            ambiente = result.data[0]
            
            # Processa dados relacionados
            if ambiente.get('cliente'):
                ambiente['cliente_nome'] = ambiente['cliente'].get('nome')
                del ambiente['cliente']
            
            # Processa materiais se incluídos
            if include_materiais and ambiente.get('materiais'):
                materiais_data = ambiente['materiais']
                if materiais_data and len(materiais_data) > 0:
                    ambiente['materiais'] = materiais_data[0].get('materiais_json')
                else:
                    ambiente['materiais'] = None
            elif not include_materiais:
                ambiente.pop('materiais', None)
            
            return ambiente
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar ambiente: {str(e)}")
    
    async def criar_ambiente(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria um novo ambiente
        
        Args:
            dados: Dados do ambiente
            
        Returns:
            Ambiente criado com ID
        """
        try:
            # Converte valores Decimal para float se necessário
            dados_limpos = {}
            for k, v in dados.items():
                if v is not None:
                    # Converte Decimal para float
                    if k in ['valor_custo_fabrica', 'valor_venda'] and hasattr(v, '__float__'):
                        dados_limpos[k] = float(v)
                    else:
                        dados_limpos[k] = v
            
            # Cria o ambiente
            result = self.db.table(self.table_ambientes).insert(dados_limpos).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar ambiente")
            
            return result.data[0]
        
        except Exception as e:
            logger.error(f"Erro ao criar ambiente: {str(e)}")
            raise DatabaseException(f"Erro ao criar ambiente: {str(e)}")
    
    async def atualizar_ambiente(
        self,
        ambiente_id: str,
        dados: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza dados de um ambiente
        
        Args:
            ambiente_id: ID do ambiente
            dados: Dados a atualizar
            
        Returns:
            Ambiente atualizado
            
        Raises:
            NotFoundException: Se ambiente não encontrado
        """
        try:
            # Verifica se ambiente existe
            await self.buscar_por_id(ambiente_id)
            
            # Converte valores Decimal para float se necessário
            dados_limpos = {}
            for k, v in dados.items():
                if v is not None:
                    if k in ['valor_custo_fabrica', 'valor_venda'] and hasattr(v, '__float__'):
                        dados_limpos[k] = float(v)
                    else:
                        dados_limpos[k] = v
            
            # Atualiza o ambiente
            query = self.db.table(self.table_ambientes).update(dados_limpos).eq('id', ambiente_id)
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar ambiente")
            
            return result.data[0]
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar ambiente: {str(e)}")
    
    async def excluir_ambiente(self, ambiente_id: str) -> bool:
        """
        Exclui um ambiente (DELETE real conforme especificado na missão)
        
        Args:
            ambiente_id: ID do ambiente
            
        Returns:
            True se excluído com sucesso
            
        Raises:
            NotFoundException: Se ambiente não encontrado
        """
        try:
            # Verifica se existe
            await self.buscar_por_id(ambiente_id)
            
            # Exclui materiais relacionados primeiro (CASCADE)
            self.db.table(self.table_materiais).delete().eq('ambiente_id', ambiente_id).execute()
            
            # Exclui o ambiente (DELETE real)
            query = self.db.table(self.table_ambientes).delete().eq('id', ambiente_id)
            result = query.execute()
            
            return bool(result.data)
        
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir ambiente: {str(e)}")
    
    async def criar_material_ambiente(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria/atualiza materiais de um ambiente
        
        Args:
            dados: Dados dos materiais
            
        Returns:
            Material criado
        """
        try:
            # Verifica se já existe material para este ambiente
            existing = self.db.table(self.table_materiais).select('*').eq('ambiente_id', dados['ambiente_id']).execute()
            
            if existing.data:
                # Atualiza material existente
                result = self.db.table(self.table_materiais).update({
                    'materiais_json': dados['materiais_json'],
                    'xml_hash': dados.get('xml_hash')
                }).eq('ambiente_id', dados['ambiente_id']).execute()
            else:
                # Cria novo material
                result = self.db.table(self.table_materiais).insert(dados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao salvar materiais do ambiente")
            
            return result.data[0]
        
        except Exception as e:
            logger.error(f"Erro ao criar material ambiente: {str(e)}")
            raise DatabaseException(f"Erro ao salvar materiais: {str(e)}")
    
    async def obter_materiais_ambiente(self, ambiente_id: str) -> Optional[Dict[str, Any]]:
        """
        Obtém materiais de um ambiente específico
        
        Args:
            ambiente_id: ID do ambiente
            
        Returns:
            Dados dos materiais ou None se não encontrado
        """
        try:
            query = self.db.table(self.table_materiais).select('*').eq('ambiente_id', ambiente_id)
            result = query.execute()
            
            if result.data:
                return result.data[0]
            
            return None
        
        except Exception as e:
            logger.error(f"Erro ao obter materiais do ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao obter materiais: {str(e)}")
    
    async def atualizar_material_ambiente(
        self,
        ambiente_id: str,
        dados: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza materiais de um ambiente
        
        Args:
            ambiente_id: ID do ambiente
            dados: Novos dados dos materiais
            
        Returns:
            Material atualizado
        """
        try:
            query = self.db.table(self.table_materiais).update(dados).eq('ambiente_id', ambiente_id)
            result = query.execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar materiais do ambiente")
            
            return result.data[0]
        
        except Exception as e:
            logger.error(f"Erro ao atualizar materiais do ambiente {ambiente_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar materiais: {str(e)}") 