"""
Middleware para conversão de campos entre frontend e backend
Converte nomenclaturas: camelCase ↔ snake_case
"""
from typing import Dict, Any, Optional


class FieldConverter:
    """Conversor de campos para módulo equipe"""
    
    # Mapeamento Frontend → Backend (Request)
    REQUEST_CONVERSIONS = {
        'lojaId': 'loja_id',
        'setorId': 'setor_id', 
        'tipoFuncionario': 'perfil',
        'nivelAcesso': 'nivel_acesso',
        'dataAdmissao': 'data_admissao',
        'criadoEm': 'created_at',
        'atualizadoEm': 'updated_at'
    }
    
    # Mapeamento Backend → Frontend (Response)
    RESPONSE_CONVERSIONS = {
        'loja_id': 'lojaId',
        'setor_id': 'setorId',
        'perfil': 'tipoFuncionario', 
        'nivel_acesso': 'nivelAcesso',
        'data_admissao': 'dataAdmissao',
        'created_at': 'criadoEm',
        'updated_at': 'atualizadoEm'
    }
    
    @classmethod
    def convert_request_fields(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converte campos do frontend (camelCase) para backend (snake_case)
        Usado em POST/PUT requests
        """
        if not isinstance(data, dict):
            return data
            
        converted = {}
        for key, value in data.items():
            # Converte chave se existe mapeamento
            new_key = cls.REQUEST_CONVERSIONS.get(key, key)
            converted[new_key] = value
            
        return converted
    
    @classmethod
    def convert_response_fields(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Converte campos do backend (snake_case) para frontend (camelCase)
        Usado em responses
        """
        if not isinstance(data, dict):
            return data
            
        converted = {}
        for key, value in data.items():
            # Converte chave se existe mapeamento
            new_key = cls.RESPONSE_CONVERSIONS.get(key, key)
            converted[new_key] = value
            
        return converted
    
    @classmethod
    def convert_response_list(cls, items: list) -> list:
        """
        Converte lista de items do backend para frontend
        """
        if not isinstance(items, list):
            return items
            
        return [cls.convert_response_fields(item) if isinstance(item, dict) else item 
                for item in items]


# Instância global do conversor
field_converter = FieldConverter() 