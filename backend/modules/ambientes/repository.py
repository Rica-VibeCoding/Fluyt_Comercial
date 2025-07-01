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
    
    def _converter_decimal_para_float(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converte valores Decimal para float em campos monetários
        
        Args:
            dados: Dicionário com dados
            
        Returns:
            Dicionário com valores convertidos
        """
        dados_limpos = {}
        campos_monetarios = ['valor_custo_fabrica', 'valor_venda']
        
        for k, v in dados.items():
            if v is not None:
                # Converte Decimal para float em campos monetários
                if k in campos_monetarios and hasattr(v, '__float__'):
                    dados_limpos[k] = float(v)
                else:
                    dados_limpos[k] = v
        
        return dados_limpos
    
    def _aplicar_filtros(self, query, filtros: Dict[str, Any] = None):
        """
        Aplica filtros a uma query do Supabase
        
        Args:
            query: Query do Supabase
            filtros: Dicionário com filtros
            
        Returns:
            Query com filtros aplicados
        """
        if not filtros:
            return query
            
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
            
        return query

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
        # Debug: verificar parâmetros
        logger.info(f"🔍 Repository.listar recebeu: include_materiais={include_materiais}, kwargs={kwargs}")
        
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
            # Query base com JOIN para cliente (syntax comprovada)
            select_fields = "*, cliente:c_clientes!cliente_id(nome)"
            
            # Se incluir materiais, adiciona LEFT JOIN
            if include_materiais:
                select_fields = "*, cliente:c_clientes!cliente_id(nome), materiais:c_ambientes_material!ambiente_id(materiais_json)"
            
            # Query principal com filtros aplicados
            query = self.db.table(self.table_ambientes).select(select_fields)
            query = self._aplicar_filtros(query, filtros)
            
            # Query de contagem com mesmos filtros
            count_query = self.db.table(self.table_ambientes).select('id', count='exact')
            count_query = self._aplicar_filtros(count_query, filtros)
            
            # Executa contagem
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
                    # Materiais agora vem como objeto (não array)
                    materiais_data = item['materiais']
                    if materiais_data and isinstance(materiais_data, dict):
                        item['materiais'] = materiais_data.get('materiais_json')
                        logger.info(f"Materiais processados para ambiente {item.get('id')}: {bool(item['materiais'])}")
                    else:
                        item['materiais'] = None
                        logger.warning(f"Ambiente {item.get('id')} tem materiais inválidos: {type(materiais_data)}")
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
            # Query base com JOIN para cliente (syntax comprovada)
            select_fields = "*, cliente:c_clientes!cliente_id(nome)"
            
            # Se incluir materiais, adiciona LEFT JOIN
            if include_materiais:
                select_fields = "*, cliente:c_clientes!cliente_id(nome), materiais:c_ambientes_material!ambiente_id(materiais_json)"
            
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
                if materiais_data and isinstance(materiais_data, dict):
                    ambiente['materiais'] = materiais_data.get('materiais_json')
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
            dados_limpos = self._converter_decimal_para_float(dados)
            
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
            dados_limpos = self._converter_decimal_para_float(dados)
            
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
    
    async def verificar_xml_hash_existe(self, xml_hash: str) -> bool:
        """
        Verifica se um XML com este hash já foi importado
        
        Args:
            xml_hash: Hash SHA256 do XML
            
        Returns:
            True se já existe, False caso contrário
        """
        try:
            result = self.db.table(self.table_materiais).select('id').eq('xml_hash', xml_hash).execute()
            return len(result.data) > 0
        except Exception as e:
            logger.error(f"Erro ao verificar hash XML: {str(e)}")
            return False
    
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
    
 