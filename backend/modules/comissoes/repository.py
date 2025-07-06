"""
Repository para regras de comissão
Gerencia acesso aos dados na tabela c_config_regras_comissao_faixa
"""

from supabase import Client
from typing import Optional, Dict, Any, List
from uuid import UUID

from core.exceptions import DatabaseException, NotFoundException


class ComissoesRepository:
    """Repository para operações de regras de comissão"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "c_config_regras_comissao_faixa"
    
    def listar(self, filtros: Dict[str, Any] = None, page: int = 1, limit: int = 20) -> tuple[List[Dict], int]:
        """Lista regras de comissão com filtros e paginação"""
        try:
            query = self.db.table(self.table).select("*")
            
            # Aplicar filtros
            if filtros:
                if filtros.get('loja_id'):
                    query = query.eq("loja_id", str(filtros['loja_id']))
                if filtros.get('tipo_comissao'):
                    query = query.eq("tipo_comissao", filtros['tipo_comissao'])
                if filtros.get('ativo') is not None:
                    query = query.eq("ativo", filtros['ativo'])
                if filtros.get('busca'):
                    # Busca em percentual (convertido para string) ou tipo
                    busca = filtros['busca'].lower()
                    query = query.or_(f"tipo_comissao.ilike.%{busca}%,percentual::text.ilike.%{busca}%")
            
            # Contar total de registros
            count_response = query.execute()
            total = len(count_response.data) if count_response.data else 0
            
            # Aplicar ordenação e paginação
            offset = (page - 1) * limit
            query = query.order("tipo_comissao,ordem").range(offset, offset + limit - 1)
            
            response = query.execute()
            
            # Enriquecer dados com nome da loja
            regras = []
            for regra in response.data:
                regra_enriquecida = regra.copy()
                
                # Buscar nome da loja
                try:
                    loja = self.db.table("c_lojas").select("nome").eq("id", regra["loja_id"]).limit(1).execute()
                    if loja.data and len(loja.data) > 0:
                        regra_enriquecida["loja_nome"] = loja.data[0]["nome"]
                    else:
                        regra_enriquecida["loja_nome"] = "Loja Não Encontrada"
                except:
                    regra_enriquecida["loja_nome"] = "Erro ao buscar loja"
                
                regras.append(regra_enriquecida)
            
            return regras, total
            
        except Exception as e:
            raise DatabaseException(f"Erro ao listar regras de comissão: {str(e)}")
    
    def buscar_por_id(self, regra_id: str) -> Optional[Dict[str, Any]]:
        """Busca regra por ID"""
        try:
            response = self.db.table(self.table).select("*").eq("id", regra_id).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                regra = response.data[0]
                
                # Buscar nome da loja
                try:
                    loja = self.db.table("c_lojas").select("nome").eq("id", regra["loja_id"]).limit(1).execute()
                    if loja.data and len(loja.data) > 0:
                        regra["loja_nome"] = loja.data[0]["nome"]
                except:
                    regra["loja_nome"] = "Erro ao buscar loja"
                
                return regra
            
            return None
            
        except Exception as e:
            raise DatabaseException(f"Erro ao buscar regra: {str(e)}")
    
    def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria nova regra de comissão"""
        try:
            response = self.db.table(self.table).insert(dados).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            
            raise DatabaseException("Erro ao criar regra - sem dados retornados")
            
        except Exception as e:
            raise DatabaseException(f"Erro ao criar regra de comissão: {str(e)}")
    
    def atualizar(self, regra_id: str, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza regra existente"""
        try:
            response = (
                self.db.table(self.table)
                .update(dados)
                .eq("id", regra_id)
                .execute()
            )
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            
            raise NotFoundException(f"Regra com ID {regra_id} não encontrada")
            
        except Exception as e:
            if "not found" in str(e).lower():
                raise NotFoundException(f"Regra com ID {regra_id} não encontrada")
            raise DatabaseException(f"Erro ao atualizar regra: {str(e)}")
    
    def excluir(self, regra_id: str) -> bool:
        """Soft delete - marca regra como inativa"""
        try:
            response = (
                self.db.table(self.table)
                .update({"ativo": False})
                .eq("id", regra_id)
                .execute()
            )
            
            return response.data and len(response.data) > 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao excluir regra: {str(e)}")
    
    def buscar_regras_ativas_por_tipo(self, tipo_comissao: str, loja_id: str) -> List[Dict[str, Any]]:
        """Busca regras ativas por tipo para cálculo de comissão"""
        try:
            response = (
                self.db.table(self.table)
                .select("*")
                .eq("tipo_comissao", tipo_comissao)
                .eq("loja_id", loja_id)
                .eq("ativo", True)
                .order("ordem")
                .execute()
            )
            
            return response.data or []
            
        except Exception as e:
            raise DatabaseException(f"Erro ao buscar regras ativas: {str(e)}")
    
    def verificar_sobreposicao(self, dados: Dict[str, Any], regra_id: str = None) -> bool:
        """Verifica se há sobreposição de faixas de valores"""
        try:
            query = (
                self.db.table(self.table)
                .select("valor_minimo,valor_maximo")
                .eq("tipo_comissao", dados["tipo_comissao"])
                .eq("loja_id", str(dados["loja_id"]))
                .eq("ativo", True)
            )
            
            # Excluir regra atual se estiver atualizando
            if regra_id:
                query = query.neq("id", regra_id)
            
            response = query.execute()
            
            if not response.data:
                return False
            
            valor_min_novo = dados["valor_minimo"]
            valor_max_novo = dados["valor_maximo"]
            
            # Se valor_maximo é None, considerar infinito
            if valor_max_novo is None:
                valor_max_novo = float('inf')
            
            # Verificar sobreposição com regras existentes
            for regra in response.data:
                valor_min_existente = regra["valor_minimo"]
                valor_max_existente = regra["valor_maximo"]
                
                if valor_max_existente is None:
                    valor_max_existente = float('inf')
                
                # Verificar se há sobreposição
                if not (valor_max_novo < valor_min_existente or valor_min_novo > valor_max_existente):
                    return True
            
            return False
            
        except Exception as e:
            raise DatabaseException(f"Erro ao verificar sobreposição: {str(e)}")
    
    def obter_proxima_ordem(self, tipo_comissao: str, loja_id: str) -> int:
        """Obtém próximo número de ordem para o tipo de comissão"""
        try:
            response = (
                self.db.table(self.table)
                .select("ordem")
                .eq("tipo_comissao", tipo_comissao)
                .eq("loja_id", loja_id)
                .order("ordem", desc=True)
                .limit(1)
                .execute()
            )
            
            if response.data and len(response.data) > 0:
                return response.data[0]["ordem"] + 1
            
            return 1
            
        except Exception as e:
            raise DatabaseException(f"Erro ao obter próxima ordem: {str(e)}")