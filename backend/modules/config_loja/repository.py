"""
Repository para configurações de loja
Gerencia acesso aos dados de configuração no banco de dados
"""

from supabase import Client
from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from core.exceptions import DatabaseException, NotFoundException


class ConfigLojaRepository:
    """Repository para operações de configuração de loja"""
    
    def __init__(self, db: Client):
        self.db = db
        self.table = "c_config_loja"
    
    def buscar_por_loja(self, store_id: str) -> Optional[Dict[str, Any]]:
        """Busca configuração por ID da loja"""
        try:
            # Busca configuração com dados da loja via JOIN
            response = self.db.table(self.table).select(
                "*",
                "c_lojas!store_id(id, nome)"
            ).eq("store_id", store_id).single().execute()
            
            if response.data:
                # Extrai nome da loja do JOIN
                config = response.data
                if config.get("c_lojas"):
                    config["store_name"] = config["c_lojas"]["nome"]
                    del config["c_lojas"]
                return config
            
            return None
            
        except Exception as e:
            if "No rows found" in str(e):
                return None
            raise DatabaseException(f"Erro ao buscar configuração: {str(e)}")
    
    def buscar_por_id(self, config_id: str, user_perfil: str = "USER") -> Optional[Dict[str, Any]]:
        """Busca configuração por ID"""
        try:
            response = self.db.table(self.table).select(
                "*",
                "c_lojas!store_id(id, nome)"
            ).eq("id", config_id).single().execute()
            
            if response.data:
                config = response.data
                if config.get("c_lojas"):
                    config["store_name"] = config["c_lojas"]["nome"]
                    del config["c_lojas"]
                return config
            
            return None
            
        except Exception as e:
            if "No rows found" in str(e):
                return None
            raise DatabaseException(f"Erro ao buscar configuração: {str(e)}")
    
    def listar(
        self, 
        filtros: Optional[Dict[str, Any]] = None,
        page: int = 1,
        limit: int = 20,
        user_perfil: str = "USER"
    ) -> tuple[list[Dict[str, Any]], int]:
        """Lista configurações com filtros e paginação"""
        try:
            query = self.db.table(self.table).select(
                "*",
                "c_lojas!store_id(id, nome)",
                count="exact"
            )
            
            # Aplicar filtros se fornecidos  
            if filtros:
                if filtros.get("store_id"):
                    query = query.eq("store_id", filtros["store_id"])
                # Filtro para SUPER_ADMIN vs outros perfis pode ser adicionado aqui
            
            # Ordenação e paginação
            offset = (page - 1) * limit
            query = query.order("created_at", desc=True)
            query = query.range(offset, offset + limit - 1)
            
            response = query.execute()
            
            # Processar dados com JOIN
            configs = []
            for config in response.data:
                if config.get("c_lojas"):
                    config["store_name"] = config["c_lojas"]["nome"]
                    del config["c_lojas"]
                configs.append(config)
            
            return configs, response.count or 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao listar configurações: {str(e)}")
    
    def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria nova configuração de loja"""
        try:
            # Remove deflator_cost se existir (campo será removido)
            dados.pop("deflator_cost", None)
            
            response = self.db.table(self.table).insert(dados).execute()
            
            if not response.data:
                raise DatabaseException("Falha ao criar configuração")
            
            return response.data[0]
            
        except Exception as e:
            raise DatabaseException(f"Erro ao criar configuração: {str(e)}")
    
    def atualizar(self, config_id: str, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza configuração existente"""
        try:
            # Remove campos None e deflator_cost
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            dados_limpos.pop("deflator_cost", None)
            
            if not dados_limpos:
                raise ValueError("Nenhum campo para atualizar")
            
            # Adiciona timestamp de atualização
            dados_limpos["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.db.table(self.table).update(dados_limpos).eq(
                "id", config_id
            ).execute()
            
            if not response.data:
                raise NotFoundException("Configuração não encontrada")
            
            return response.data[0]
            
        except Exception as e:
            if isinstance(e, NotFoundException):
                raise
            raise DatabaseException(f"Erro ao atualizar configuração: {str(e)}")
    
    def deletar(self, config_id: str) -> bool:
        """Remove configuração (hard delete)"""
        try:
            response = self.db.table(self.table).delete().eq(
                "id", config_id
            ).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao deletar configuração: {str(e)}")
    
    def desativar(self, config_id: str) -> bool:
        """Desativa configuração (marca como inativa)"""
        try:
            # Por enquanto usa hard delete até confirmar estrutura da tabela
            response = self.db.table(self.table).delete().eq(
                "id", config_id
            ).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao desativar configuração: {str(e)}")
    
    def verificar_loja_tem_config(self, store_id: str) -> bool:
        """Verifica se a loja já tem configuração"""
        try:
            response = self.db.table(self.table).select("id").eq(
                "store_id", store_id
            ).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao verificar configuração: {str(e)}")
    
    def verificar_store_tem_config(self, store_id: str) -> Dict[str, Any]:
        """Verifica se store já tem configuração e retorna detalhes"""
        try:
            response = self.db.table(self.table).select(
                "id, store_id, created_at"
            ).eq("store_id", store_id).execute()
            
            return {
                "existe": len(response.data) > 0,
                "config": response.data[0] if response.data else None
            }
            
        except Exception as e:
            raise DatabaseException(f"Erro ao verificar store: {str(e)}")