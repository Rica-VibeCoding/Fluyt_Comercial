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
            # Busca configuração simples (sem JOIN para evitar problemas)
            response = self.db.table(self.table).select("*").eq("loja_id", store_id).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                config = response.data[0]
                
                # CORRIGIR: Mapear loja_id para store_id
                if "loja_id" in config:
                    config["store_id"] = config["loja_id"]
                
                # Buscar nome da loja separadamente
                try:
                    loja = self.db.table("c_lojas").select("nome").eq("id", store_id).limit(1).execute()
                    if loja.data and len(loja.data) > 0:
                        config["store_name"] = loja.data[0]["nome"]
                    else:
                        config["store_name"] = "Loja Não Encontrada"
                except:
                    config["store_name"] = "Erro ao buscar loja"
                return config
            
            return None
            
        except Exception as e:
            if "No rows found" in str(e):
                return None
            raise DatabaseException(f"Erro ao buscar configuração: {str(e)}")
    
    def buscar_por_id(self, config_id: str, user_perfil: str = "USER") -> Optional[Dict[str, Any]]:
        """Busca configuração por ID"""
        try:
            response = self.db.table(self.table).select("*").eq("id", config_id).limit(1).execute()
            
            if response.data and len(response.data) > 0:
                config = response.data[0]
                
                # CORRIGIR: Mapear loja_id para store_id
                if "loja_id" in config:
                    config["store_id"] = config["loja_id"]
                
                # Buscar nome da loja separadamente
                try:
                    loja_id = config.get("loja_id") or config.get("store_id")
                    if loja_id:
                        loja = self.db.table("c_lojas").select("nome").eq("id", loja_id).limit(1).execute()
                        if loja.data and len(loja.data) > 0:
                            config["store_name"] = loja.data[0]["nome"]
                        else:
                            config["store_name"] = "Loja Não Encontrada"
                    else:
                        config["store_name"] = "Sem Loja Associada"
                except:
                    config["store_name"] = "Erro ao buscar loja"
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
            # Seleciona campos usando os nomes reais das colunas no banco (inglês)
            campos_selecionados = [
                "id", "loja_id", "created_at", "updated_at", "updated_by",
                "discount_limit_vendor", "discount_limit_manager", "discount_limit_admin_master",
                "default_measurement_value", "freight_percentage", "assembly_percentage",
                "executive_project_percentage", "initial_number", "number_format", "number_prefix"
            ]
            
            query = self.db.table(self.table).select(
                ", ".join(campos_selecionados),  # Converte a lista em string para o select
                count="exact"
            )
            
            # Aplicar filtros se fornecidos  
            if filtros:
                if filtros.get("store_id"):
                    query = query.eq("loja_id", filtros["store_id"])
            
            # Ordenação e paginação
            offset = (page - 1) * limit
            query = query.order("created_at", desc=True)
            query = query.range(offset, offset + limit - 1)
            
            response = query.execute()
            
            # Mapear dados diretos (colunas já estão em inglês)
            configs = []
            for config in response.data or []:
                config_mapeado = {
                    "id": config.get("id"),
                    "store_id": config.get("loja_id"),  # Só precisa mapear loja_id -> store_id
                    "created_at": config.get("created_at"),
                    "updated_at": config.get("updated_at"),
                    "discount_limit_vendor": config.get("discount_limit_vendor", 0),
                    "discount_limit_manager": config.get("discount_limit_manager", 0),
                    "discount_limit_admin_master": config.get("discount_limit_admin_master", 0),
                    "default_measurement_value": config.get("default_measurement_value", 120.00),
                    "freight_percentage": config.get("freight_percentage", 0),
                    "assembly_percentage": config.get("assembly_percentage", 0.0),
                    "executive_project_percentage": config.get("executive_project_percentage", 0.0),
                    "initial_number": config.get("initial_number", 1001),
                    "number_format": config.get("number_format", "YYYY-NNNNNN"),
                    "number_prefix": config.get("number_prefix", "ORC")
                }
                configs.append(config_mapeado)
            
            return configs, response.count or 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao listar configurações: {str(e)}")
    
    def criar(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Cria nova configuração de loja"""
        try:
            
            response = self.db.table(self.table).insert(dados).execute()
            
            if not response.data:
                raise DatabaseException("Falha ao criar configuração")
            
            return response.data[0]
            
        except Exception as e:
            raise DatabaseException(f"Erro ao criar configuração: {str(e)}")
    
    def atualizar(self, config_id: str, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza configuração existente"""
        try:
            # Remove campos None
            dados_limpos = {k: v for k, v in dados.items() if v is not None}
            
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
        """Desativa configuração (soft delete)"""
        try:
            response = self.db.table(self.table).update({
                "ativo": False,
                "updated_at": "now()"
            }).eq("id", config_id).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao desativar configuração: {str(e)}")
    
    def verificar_loja_tem_config(self, store_id: str) -> bool:
        """Verifica se a loja já tem configuração"""
        try:
            response = self.db.table(self.table).select("id").eq(
                "loja_id", store_id
            ).execute()
            
            return len(response.data) > 0
            
        except Exception as e:
            raise DatabaseException(f"Erro ao verificar configuração: {str(e)}")
    
    def verificar_store_tem_config(self, store_id: str) -> Dict[str, Any]:
        """Verifica se store já tem configuração e retorna detalhes"""
        try:
            response = self.db.table(self.table).select(
                "id, loja_id, created_at"
            ).eq("loja_id", store_id).execute()
            
            return {
                "existe": len(response.data) > 0,
                "config": response.data[0] if response.data else None
            }
            
        except Exception as e:
            raise DatabaseException(f"Erro ao verificar store: {str(e)}")