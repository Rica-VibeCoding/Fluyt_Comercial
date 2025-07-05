"""
Service para configurações de loja
Implementa regras de negócio para configurações operacionais
"""

from typing import Optional, List, Dict, Any
from uuid import UUID

from .repository import ConfigLojaRepository
from .schemas import (
    ConfigLojaCreate, 
    ConfigLojaUpdate, 
    ConfigLojaResponse,
    ConfigLojaValidation
)
from core.exceptions import ValidationException, ConflictException, NotFoundException


class ConfigLojaService:
    """Service para lógica de negócio de configurações"""
    
    def __init__(self, repository: ConfigLojaRepository):
        self.repository = repository
    
    async def obter_por_loja(self, store_id: UUID) -> Optional[ConfigLojaResponse]:
        """Obtém configuração de uma loja específica"""
        config = self.repository.buscar_por_loja(str(store_id))
        
        if not config:
            return None
        
        return ConfigLojaResponse(**config)
    
    def obter_por_id(self, config_id: UUID, user_perfil: str = "USER") -> ConfigLojaResponse:
        """Obtém configuração por ID"""
        config = self.repository.buscar_por_id(str(config_id), user_perfil)
        
        if not config:
            raise NotFoundException("Configuração não encontrada")
        
        return ConfigLojaResponse(**config)
    
    def listar(
        self,
        store_id: Optional[UUID] = None,
        limit: int = 20,
        page: int = 1,
        user_perfil: str = "USER"
    ) -> tuple[List[ConfigLojaResponse], int]:
        """Lista configurações com filtros"""
        # Validar paginação
        if limit < 1 or limit > 100:
            limit = 20
        if page < 1:
            page = 1
        
        # Montar filtros
        filtros = {}
        if store_id:
            filtros["store_id"] = str(store_id)
        
        # Buscar dados
        configs, total = self.repository.listar(filtros, page, limit, user_perfil)
        
        # Converter para response
        configs_response = [ConfigLojaResponse(**config) for config in configs]
        
        return configs_response, total
    
    def criar(self, dados: ConfigLojaCreate, user_id: str) -> ConfigLojaResponse:
        """Cria nova configuração de loja"""
        # Validar se loja já tem configuração
        if self.repository.verificar_loja_tem_config(str(dados.store_id)):
            raise ConflictException(
                "Esta loja já possui configuração. Use o endpoint de atualização."
            )
        
        # Validar hierarquia de descontos
        erros = ConfigLojaValidation.validar_hierarquia_descontos(
            dados.discount_limit_vendor,
            dados.discount_limit_manager,
            dados.discount_limit_admin_master
        )
        
        if erros:
            raise ValidationException("\n".join(erros))
        
        # Preparar dados para criação
        dados_dict = dados.model_dump(mode='json')
        
        # Criar configuração
        config_criada = self.repository.criar(dados_dict)
        
        # Buscar com JOIN para retornar completo (convertendo UUID para string)
        return self.obter_por_id(str(config_criada["id"]))
    
    def atualizar(
        self, 
        config_id: UUID, 
        dados: ConfigLojaUpdate,
        user_id: str
    ) -> ConfigLojaResponse:
        """Atualiza configuração existente"""
        # Verificar se existe
        config_atual = self.obter_por_id(config_id)
        
        # Preparar dados para update
        dados_update = dados.model_dump(mode='json', exclude_unset=True)
        
        if not dados_update:
            raise ValidationException("Nenhum campo para atualizar")
        
        # Validar hierarquia se houver mudança nos limites
        if any(k in dados_update for k in [
            "discount_limit_vendor", 
            "discount_limit_manager", 
            "discount_limit_admin_master"
        ]):
            # Mesclar valores atuais com novos para validação
            vendor = dados_update.get(
                "discount_limit_vendor", 
                config_atual.discount_limit_vendor
            )
            manager = dados_update.get(
                "discount_limit_manager", 
                config_atual.discount_limit_manager
            )
            admin_master = dados_update.get(
                "discount_limit_admin_master", 
                config_atual.discount_limit_admin_master
            )
            
            erros = ConfigLojaValidation.validar_hierarquia_descontos(
                vendor, manager, admin_master
            )
            
            if erros:
                raise ValidationException("\n".join(erros))
        
        # Atualizar no banco
        self.repository.atualizar(str(config_id), dados_update)
        
        # Retornar atualizado
        return self.obter_por_id(config_id)
    
    def deletar(self, config_id: UUID, user_id: str) -> bool:
        """Remove configuração (apenas SUPER_ADMIN)"""
        # Verificar se existe
        self.obter_por_id(config_id)
        
        # Deletar
        return self.repository.deletar(str(config_id))
    
    def obter_ou_criar_padrao(self, store_id: UUID, user_id: str) -> ConfigLojaResponse:
        """Obtém configuração existente ou cria uma padrão"""
        # Tentar obter existente
        config = self.obter_por_loja(store_id)
        if config:
            return config
        
        # Criar configuração padrão
        config_padrao = ConfigLojaCreate(
            store_id=store_id,
            discount_limit_vendor=10.0,
            discount_limit_manager=20.0,
            discount_limit_admin_master=50.0,
            default_measurement_value=120.0,
            freight_percentage=8.5,
            assembly_percentage=12.0,
            executive_project_percentage=5.0,
            initial_number=1001,
            number_format="YYYY-NNNNNN",
            number_prefix="ORC"
        )
        
        return self.criar(config_padrao, user_id)
    
    def desativar_configuracao(self, config_id: UUID, user_id: str, user_perfil: str) -> bool:
        """Desativa configuração (apenas SUPER_ADMIN)"""
        # Verificar permissão
        if user_perfil != "SUPER_ADMIN":
            raise ValidationException("Apenas SUPER_ADMIN pode desativar configurações")
        
        # Verificar se existe
        self.obter_por_id(config_id, user_perfil)
        
        # Desativar
        return self.repository.desativar(str(config_id))
    
    def verificar_store_configuracao(self, store_id: UUID) -> Dict[str, Any]:
        """Verifica se store já possui configuração"""
        return self.repository.verificar_store_tem_config(str(store_id))