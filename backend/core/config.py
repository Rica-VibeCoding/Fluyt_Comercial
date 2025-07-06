"""
Configurações centralizadas do sistema usando Pydantic Settings
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
import os
from functools import lru_cache


class Settings(BaseSettings):
    """Configurações do sistema com validação automática"""
    
    # ===== SUPABASE =====
    supabase_url: str
    supabase_anon_key: str
    supabase_service_key: str
    
    # ===== JWT =====
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7
    
    # ===== APLICAÇÃO =====
    environment: str = "development"
    api_version: str = "v1"
    debug: bool = True
    log_level: str = "INFO"
    api_prefix: str = "/api/v1"
    
    # ===== CORS =====
    cors_origins: str = "http://localhost:3000,http://localhost:8080,http://localhost:5500,http://127.0.0.1:3000,http://127.0.0.1:8080,http://127.0.0.1:5500,file://"
    
    # ===== LIMITES =====
    max_file_size_mb: int = 10
    allowed_file_extensions: str = ".xml"
    max_items_per_page: int = 100
    default_items_per_page: int = 20
    
    # ===== PATHS =====
    upload_path: str = "uploads"
    temp_path: str = "temp"
    
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        case_sensitive = False
    
    @field_validator('cors_origins')
    def parse_cors_origins(cls, v):
        """Converte string de origins separadas por vírgula em lista"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Retorna lista de origins permitidas"""
        return self.parse_cors_origins(self.cors_origins)
    
    @property
    def is_development(self) -> bool:
        """Verifica se está em ambiente de desenvolvimento"""
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Verifica se está em ambiente de produção"""
        return self.environment.lower() == "production"
    
    @property
    def max_file_size_bytes(self) -> int:
        """Retorna tamanho máximo de arquivo em bytes"""
        return self.max_file_size_mb * 1024 * 1024
    
    def ensure_directories(self):
        """Garante que os diretórios necessários existam"""
        os.makedirs(self.upload_path, exist_ok=True)
        os.makedirs(self.temp_path, exist_ok=True)


@lru_cache()
def get_settings() -> Settings:
    """
    Retorna instância única das configurações (singleton pattern)
    Usa cache para evitar recarregar o .env múltiplas vezes
    """
    settings = Settings()
    settings.ensure_directories()
    return settings


# Instância global para importação direta
settings = get_settings()