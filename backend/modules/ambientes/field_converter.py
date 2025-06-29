"""
Conversor de campos para módulo ambientes
Converte entre camelCase (frontend) e snake_case (backend)
"""
from typing import Dict, Any, List, Union


class AmbienteFieldConverter:
    """Conversor de campos específico para ambientes"""
    
    # Frontend → Backend (Request)
    REQUEST_MAP = {
        'clienteId': 'cliente_id',
        'valorCustoFabrica': 'valor_custo_fabrica',
        'valorVenda': 'valor_venda',
        'dataImportacao': 'data_importacao',
        'horaImportacao': 'hora_importacao',
        'ambienteId': 'ambiente_id',
        'materiaisJson': 'materiais_json',
        'xmlHash': 'xml_hash',
        'incluirMateriais': 'incluir_materiais',
        'clienteNome': 'cliente_nome'
    }
    
    # Backend → Frontend (Response)
    RESPONSE_MAP = {
        'cliente_id': 'clienteId',
        'valor_custo_fabrica': 'valorCustoFabrica',
        'valor_venda': 'valorVenda',
        'data_importacao': 'dataImportacao',
        'hora_importacao': 'horaImportacao',
        'ambiente_id': 'ambienteId',
        'materiais_json': 'materiaisJson',
        'xml_hash': 'xmlHash',
        'incluir_materiais': 'incluirMateriais',
        'cliente_nome': 'clienteNome',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt'
    }
    
    @classmethod
    def to_backend(cls, data: Union[Dict[str, Any], None]) -> Union[Dict[str, Any], None]:
        """Converte dados do frontend para backend"""
        if not data:
            return data
            
        converted = {}
        for key, value in data.items():
            backend_key = cls.REQUEST_MAP.get(key, key)
            converted[backend_key] = value
        return converted
    
    @classmethod
    def to_frontend(cls, data: Union[Dict[str, Any], None]) -> Union[Dict[str, Any], None]:
        """Converte dados do backend para frontend"""
        if not data:
            return data
            
        converted = {}
        for key, value in data.items():
            frontend_key = cls.RESPONSE_MAP.get(key, key)
            converted[frontend_key] = value
        return converted
    
    @classmethod
    def list_to_frontend(cls, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Converte lista de items para frontend"""
        return [cls.to_frontend(item) for item in items if item]


# Instância global
ambiente_field_converter = AmbienteFieldConverter()