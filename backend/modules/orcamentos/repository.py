"""
Repository - Camada de acesso ao banco para orçamentos
Responsável por operações com Supabase
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from decimal import Decimal

from supabase import Client
from core.exceptions import NotFoundException, DatabaseException, ConflictException

logger = logging.getLogger(__name__)


class OrcamentoRepository:
    """Repository para tabela c_orcamentos"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = 'c_orcamentos'
    
    async def listar(
        self,
        filtros: Dict[str, Any] = None,
        page: int = 1,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Lista orçamentos com filtros e paginação"""
        try:
            # Query otimizada com nested select
            query = self.db.table(self.table).select('''
                *,
                c_status_orcamento!status_id (
                    id, nome, cor, ordem
                ),
                c_clientes!cliente_id (
                    id, nome, cpf_cnpj
                ),
                c_formas_pagamento (
                    id, tipo, valor, valor_presente, parcelas, travada
                )
            ''')
            
            # Aplica filtros
            if filtros:
                if filtros.get('cliente_id'):
                    query = query.eq('cliente_id', filtros['cliente_id'])
                
                if filtros.get('status_id'):
                    query = query.eq('status_id', filtros['status_id'])
                    
                if filtros.get('numero'):
                    query = query.ilike('numero', f"%{filtros['numero']}%")
            
            # Conta total
            count_result = self.db.table(self.table).select('id', count='exact').execute()
            total = count_result.count or 0
            
            # Ordenação e paginação
            query = query.order('created_at', desc=True)
            offset = (page - 1) * limit
            query = query.limit(limit).offset(offset)
            
            result = query.execute()
            
            # Processa dados
            items = []
            for item in result.data:
                # Renomeia relacionamentos para formato esperado
                item['status'] = item.pop('c_status_orcamento', None)
                item['cliente'] = item.pop('c_clientes', None)
                item['formas_pagamento'] = item.pop('c_formas_pagamento', [])
                items.append(item)
            
            return {
                'items': items,
                'total': total,
                'page': page,
                'limit': limit,
                'pages': (total + limit - 1) // limit
            }
            
        except Exception as e:
            logger.error(f"Erro ao listar orçamentos: {str(e)}")
            raise DatabaseException(f"Erro ao listar orçamentos: {str(e)}")
    
    async def buscar_por_id(self, orcamento_id: str) -> Dict[str, Any]:
        """Busca orçamento por ID com relacionamentos"""
        try:
            result = self.db.table(self.table).select('''
                *,
                c_status_orcamento!status_id (
                    id, nome, cor, ordem
                ),
                c_clientes!cliente_id (
                    id, nome, cpf_cnpj, email, telefone
                ),
                c_formas_pagamento (
                    id, tipo, valor, valor_presente, parcelas, dados, travada
                )
            ''').eq('id', orcamento_id).execute()
            
            if not result.data:
                raise NotFoundException(f"Orçamento não encontrado: {orcamento_id}")
            
            orcamento = result.data[0]
            
            # Renomeia relacionamentos
            orcamento['status'] = orcamento.pop('c_status_orcamento', None)
            orcamento['cliente'] = orcamento.pop('c_clientes', None)
            orcamento['formas_pagamento'] = orcamento.pop('c_formas_pagamento', [])
            
            return orcamento
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar orçamento {orcamento_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar orçamento: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria novo orçamento"""
        try:
            # Gera número sequencial se não fornecido
            if not dados.get('numero'):
                ultimo = self.db.table(self.table).select('numero').order('created_at', desc=True).limit(1).execute()
                if ultimo.data and ultimo.data[0].get('numero'):
                    ultimo_numero = int(ultimo.data[0]['numero'].split('-')[-1])
                    dados['numero'] = f"orc-{ultimo_numero + 1:04d}"
                else:
                    dados['numero'] = "orc-0001"
            
            # Define status padrão se não fornecido - TEMPORARIAMENTE DESABILITADO
            # if not dados.get('status_id'):
            #     status_rascunho = self.db.table('c_status_orcamento').select('id').eq('nome', 'Rascunho').execute()
            #     if status_rascunho.data:
            #         dados['status_id'] = status_rascunho.data[0]['id']
            
            # Converter todos os UUIDs e Decimals para tipos serializáveis antes de inserir
            dados_convertidos = {}
            for key, value in dados.items():
                if isinstance(value, UUID):
                    dados_convertidos[key] = str(value)
                elif isinstance(value, Decimal):
                    dados_convertidos[key] = float(value)
                else:
                    dados_convertidos[key] = value
            
            result = self.db.table(self.table).insert(dados_convertidos).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar orçamento")
            
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Erro ao criar orçamento: {str(e)}")
            raise DatabaseException(f"Erro ao criar orçamento: {str(e)}")
    
    async def atualizar(self, orcamento_id: str, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza orçamento existente"""
        try:
            # Verifica se existe
            await self.buscar_por_id(orcamento_id)
            
            # Remove campos None e converte tipos não serializáveis
            dados_limpos = {}
            for k, v in dados.items():
                if v is not None:
                    if isinstance(v, UUID):
                        dados_limpos[k] = str(v)
                    elif isinstance(v, Decimal):
                        dados_limpos[k] = float(v)
                    else:
                        dados_limpos[k] = v
            
            result = self.db.table(self.table).update(dados_limpos).eq('id', orcamento_id).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar orçamento")
            
            return result.data[0]
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar orçamento {orcamento_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar orçamento: {str(e)}")
    
    async def excluir(self, orcamento_id: str) -> bool:
        """Exclui orçamento (hard delete)"""
        try:
            # Verifica se existe
            await self.buscar_por_id(orcamento_id)
            
            result = self.db.table(self.table).delete().eq('id', orcamento_id).execute()
            
            return bool(result.data)
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir orçamento {orcamento_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir orçamento: {str(e)}")


class FormaPagamentoRepository:
    """Repository para tabela c_formas_pagamento"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = 'c_formas_pagamento'
    
    async def listar_por_orcamento(self, orcamento_id: str) -> List[Dict[str, Any]]:
        """Lista formas de pagamento de um orçamento"""
        try:
            result = self.db.table(self.table).select('*').eq('orcamento_id', orcamento_id).execute()
            return result.data or []
            
        except Exception as e:
            logger.error(f"Erro ao listar formas de pagamento: {str(e)}")
            raise DatabaseException(f"Erro ao listar formas de pagamento: {str(e)}")
    
    async def buscar_por_id(self, forma_id: str) -> Dict[str, Any]:
        """Busca forma de pagamento por ID"""
        try:
            result = self.db.table(self.table).select('*').eq('id', forma_id).execute()
            
            if not result.data:
                raise NotFoundException(f"Forma de pagamento não encontrada: {forma_id}")
            
            return result.data[0]
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao buscar forma de pagamento {forma_id}: {str(e)}")
            raise DatabaseException(f"Erro ao buscar forma de pagamento: {str(e)}")
    
    async def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria nova forma de pagamento"""
        try:
            result = self.db.table(self.table).insert(dados).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao criar forma de pagamento")
            
            return result.data[0]
            
        except Exception as e:
            logger.error(f"Erro ao criar forma de pagamento: {str(e)}")
            raise DatabaseException(f"Erro ao criar forma de pagamento: {str(e)}")
    
    async def atualizar(self, forma_id: str, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza forma de pagamento"""
        try:
            # Verifica se existe
            await self.buscar_por_id(forma_id)
            
            # Remove campos None
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
            result = self.db.table(self.table).update(dados_limpos).eq('id', forma_id).execute()
            
            if not result.data:
                raise DatabaseException("Erro ao atualizar forma de pagamento")
            
            return result.data[0]
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao atualizar forma de pagamento {forma_id}: {str(e)}")
            raise DatabaseException(f"Erro ao atualizar forma de pagamento: {str(e)}")
    
    async def excluir(self, forma_id: str) -> bool:
        """Exclui forma de pagamento"""
        try:
            # Verifica se existe
            await self.buscar_por_id(forma_id)
            
            result = self.db.table(self.table).delete().eq('id', forma_id).execute()
            
            return bool(result.data)
            
        except NotFoundException:
            raise
        except Exception as e:
            logger.error(f"Erro ao excluir forma de pagamento {forma_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir forma de pagamento: {str(e)}")
    
    async def excluir_por_orcamento(self, orcamento_id: str) -> int:
        """Exclui todas as formas de pagamento de um orçamento"""
        try:
            result = self.db.table(self.table).delete().eq('orcamento_id', orcamento_id).execute()
            return len(result.data) if result.data else 0
            
        except Exception as e:
            logger.error(f"Erro ao excluir formas de pagamento do orçamento {orcamento_id}: {str(e)}")
            raise DatabaseException(f"Erro ao excluir formas de pagamento: {str(e)}")