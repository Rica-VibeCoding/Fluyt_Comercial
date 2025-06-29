"""
Testes básicos para módulo ambientes
"""
import pytest
from modules.ambientes.utils import converter_valor_monetario
from modules.ambientes.field_converter import ambiente_field_converter


class TestConverterValorMonetario:
    """Testes da função converter_valor_monetario"""
    
    def test_formato_brasileiro(self):
        assert converter_valor_monetario("R$ 1.234,56") == 1234.56
        assert converter_valor_monetario("1.234,56") == 1234.56
    
    def test_formato_americano(self):
        assert converter_valor_monetario("$1,234.56") == 1234.56
        assert converter_valor_monetario("USD 1,234.56") == 1234.56
    
    def test_valores_especiais(self):
        assert converter_valor_monetario(None) == 0.0
        assert converter_valor_monetario("") == 0.0
        assert converter_valor_monetario("N/A") == 0.0
        assert converter_valor_monetario("-") == 0.0
    
    def test_valores_negativos(self):
        assert converter_valor_monetario("-100.00") == 0.0
        assert converter_valor_monetario("R$ -50,00") == 0.0
    
    def test_valores_muito_altos(self):
        assert converter_valor_monetario("15000000") == 0.0  # > 10 milhões


class TestFieldConverter:
    """Testes do conversor de campos"""
    
    def test_to_backend(self):
        frontend_data = {
            "clienteId": "123",
            "valorVenda": 100.0,
            "dataImportacao": "2024-01-01"
        }
        
        backend_data = ambiente_field_converter.to_backend(frontend_data)
        
        assert backend_data["cliente_id"] == "123"
        assert backend_data["valor_venda"] == 100.0
        assert backend_data["data_importacao"] == "2024-01-01"
    
    def test_to_frontend(self):
        backend_data = {
            "cliente_id": "123",
            "valor_venda": 100.0,
            "created_at": "2024-01-01T10:00:00"
        }
        
        frontend_data = ambiente_field_converter.to_frontend(backend_data)
        
        assert frontend_data["clienteId"] == "123"
        assert frontend_data["valorVenda"] == 100.0
        assert frontend_data["createdAt"] == "2024-01-01T10:00:00"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])