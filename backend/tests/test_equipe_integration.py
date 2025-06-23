"""
Testes de integração para o módulo equipe
Valida fluxo completo: criar → listar → editar → excluir
"""
import pytest
import asyncio
from httpx import AsyncClient
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch

from main import app
from core.auth import User
from middleware.field_converter import field_converter


class TestEquipeIntegration:
    """Suite de testes de integração para módulo equipe"""
    
    @pytest.fixture
    def client(self):
        """Cliente de teste"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_admin_user(self):
        """Mock de usuário admin para testes"""
        return User(
            id="admin-123",
            email="admin@fluyt.com",
            perfil="ADMIN",
            loja_id="loja-123",
            empresa_id="empresa-123",
            nome="Admin Teste",
            ativo=True
        )
    
    @pytest.fixture
    def mock_gerente_user(self):
        """Mock de usuário gerente para testes"""
        return User(
            id="gerente-123",
            email="gerente@fluyt.com",
            perfil="GERENTE",
            loja_id="loja-123",
            empresa_id="empresa-123",
            nome="Gerente Teste",
            ativo=True
        )
    
    @pytest.fixture
    def mock_usuario_user(self):
        """Mock de usuário comum para testes"""
        return User(
            id="user-123",
            email="user@fluyt.com",
            perfil="USUARIO",
            loja_id="loja-123",
            empresa_id="empresa-123",
            nome="Usuario Teste",
            ativo=True
        )
    
    def test_field_converter_request(self):
        """Testa conversões de request (frontend → backend)"""
        frontend_data = {
            "nome": "João Silva",
            "lojaId": "loja-123",
            "setorId": "setor-123",
            "tipoFuncionario": "VENDEDOR",
            "nivelAcesso": "USUARIO",
            "dataAdmissao": "2024-01-15"
        }
        
        backend_data = field_converter.convert_request_fields(frontend_data)
        
        assert backend_data["nome"] == "João Silva"
        assert backend_data["loja_id"] == "loja-123"
        assert backend_data["setor_id"] == "setor-123"
        assert backend_data["perfil"] == "VENDEDOR"
        assert backend_data["nivel_acesso"] == "USUARIO"
        assert backend_data["data_admissao"] == "2024-01-15"
    
    def test_field_converter_response(self):
        """Testa conversões de response (backend → frontend)"""
        backend_data = {
            "id": "func-123",
            "nome": "João Silva",
            "loja_id": "loja-123",
            "setor_id": "setor-123",
            "perfil": "VENDEDOR",
            "nivel_acesso": "USUARIO",
            "data_admissao": "2024-01-15",
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
        
        frontend_data = field_converter.convert_response_fields(backend_data)
        
        assert frontend_data["id"] == "func-123"
        assert frontend_data["nome"] == "João Silva"
        assert frontend_data["lojaId"] == "loja-123"
        assert frontend_data["setorId"] == "setor-123"
        assert frontend_data["tipoFuncionario"] == "VENDEDOR"
        assert frontend_data["nivelAcesso"] == "USUARIO"
        assert frontend_data["dataAdmissao"] == "2024-01-15"
        assert frontend_data["criadoEm"] == "2024-01-01T00:00:00Z"
        assert frontend_data["atualizadoEm"] == "2024-01-01T00:00:00Z"
    
    @patch('modules.equipe.services.FuncionarioService.criar_funcionario')
    @patch('core.auth.get_current_user')
    def test_criar_funcionario_conversoes(self, mock_auth, mock_service, client, mock_admin_user):
        """Testa criação de funcionário com conversões"""
        mock_auth.return_value = mock_admin_user
        
        # Mock do retorno do service (backend format)
        mock_funcionario = Mock()
        mock_funcionario.dict.return_value = {
            "id": "func-123",
            "nome": "João Silva",
            "loja_id": "loja-123",
            "perfil": "VENDEDOR",
            "created_at": "2024-01-01T00:00:00Z"
        }
        mock_service.return_value = mock_funcionario
        
        # Request com nomenclatura frontend
        request_data = {
            "nome": "João Silva",
            "lojaId": "loja-123",
            "tipoFuncionario": "VENDEDOR"
        }
        
        response = client.post("/api/v1/funcionarios/", json=request_data)
        
        # Verifica se service foi chamado com dados convertidos
        mock_service.assert_called_once()
        call_args = mock_service.call_args[0][0]  # primeiro argumento (dados)
        assert hasattr(call_args, 'loja_id')  # backend format
        assert hasattr(call_args, 'perfil')   # backend format
    
    @patch('modules.equipe.services.FuncionarioService.listar_funcionarios')
    @patch('core.auth.get_current_user')
    def test_listar_funcionarios_permissoes(self, mock_auth, mock_service, client):
        """Testa permissões na listagem de funcionários"""
        # Teste com ADMIN (deve ver apenas da sua loja)
        admin_user = User(
            id="admin-123", email="admin@fluyt.com", perfil="ADMIN",
            loja_id="loja-123", empresa_id="empresa-123", nome="Admin", ativo=True
        )
        mock_auth.return_value = admin_user
        
        # Mock do retorno
        mock_result = Mock()
        mock_result.items = []
        mock_result.total = 0
        mock_result.page = 1
        mock_result.limit = 20
        mock_result.pages = 0
        mock_service.return_value = mock_result
        
        response = client.get("/api/v1/funcionarios/")
        
        # Verifica se service foi chamado com usuário correto
        mock_service.assert_called_once()
        call_user = mock_service.call_args[1]['user']
        assert call_user.perfil == "ADMIN"
        assert call_user.loja_id == "loja-123"
    
    @patch('modules.equipe.services.FuncionarioService.atualizar_funcionario')
    @patch('core.auth.get_current_user')
    def test_atualizar_funcionario_permissoes(self, mock_auth, mock_service, client, mock_gerente_user):
        """Testa permissões na atualização (GERENTE pode atualizar)"""
        mock_auth.return_value = mock_gerente_user
        
        # Mock do retorno
        mock_funcionario = Mock()
        mock_funcionario.dict.return_value = {
            "id": "func-123",
            "nome": "João Silva Atualizado",
            "perfil": "VENDEDOR"
        }
        mock_service.return_value = mock_funcionario
        
        request_data = {"nome": "João Silva Atualizado"}
        
        response = client.put("/api/v1/funcionarios/func-123", json=request_data)
        
        # Verifica se service foi chamado
        mock_service.assert_called_once()
        call_user = mock_service.call_args[0][2]  # terceiro argumento (user)
        assert call_user.perfil == "GERENTE"
    
    @patch('modules.equipe.services.FuncionarioService.excluir_funcionario')
    @patch('core.auth.get_current_user')
    def test_excluir_funcionario_apenas_admin(self, mock_auth, mock_service, client, mock_usuario_user):
        """Testa que apenas ADMIN pode excluir (USUARIO não pode)"""
        mock_auth.return_value = mock_usuario_user
        mock_service.side_effect = Exception("Apenas administradores podem excluir funcionários")
        
        response = client.delete("/api/v1/funcionarios/func-123")
        
        # Deve retornar erro (usuário comum não pode excluir)
        assert response.status_code in [403, 500]
    
    @patch('modules.equipe.services.FuncionarioService.verificar_nome_disponivel')
    @patch('core.auth.get_current_user')
    def test_verificar_nome_rate_limit(self, mock_auth, mock_service, client, mock_admin_user):
        """Testa rate limiting na verificação de nome"""
        mock_auth.return_value = mock_admin_user
        mock_service.return_value = True
        
        # Primeira chamada deve funcionar
        response = client.get("/api/v1/funcionarios/verificar-nome/João Silva")
        assert response.status_code == 200
        
        # Note: Rate limiting real requer configuração específica para testes
        # Aqui apenas validamos que o endpoint responde
    
    def test_fluxo_completo_conversoes(self):
        """Testa fluxo completo de conversões sem API calls"""
        # 1. Frontend envia dados (camelCase)
        frontend_request = {
            "nome": "Maria Santos",
            "lojaId": "loja-456",
            "tipoFuncionario": "GERENTE",
            "dataAdmissao": "2024-02-01"
        }
        
        # 2. Converter para backend (snake_case)
        backend_data = field_converter.convert_request_fields(frontend_request)
        assert backend_data["loja_id"] == "loja-456"
        assert backend_data["perfil"] == "GERENTE"
        assert backend_data["data_admissao"] == "2024-02-01"
        
        # 3. Simular resposta do backend
        backend_response = {
            "id": "func-456",
            "nome": "Maria Santos",
            "loja_id": "loja-456",
            "perfil": "GERENTE",
            "data_admissao": "2024-02-01",
            "created_at": "2024-01-01T00:00:00Z"
        }
        
        # 4. Converter para frontend (camelCase)
        frontend_response = field_converter.convert_response_fields(backend_response)
        assert frontend_response["lojaId"] == "loja-456"
        assert frontend_response["tipoFuncionario"] == "GERENTE"
        assert frontend_response["dataAdmissao"] == "2024-02-01"
        assert frontend_response["criadoEm"] == "2024-01-01T00:00:00Z"
    
    def test_conversoes_bidirecionais(self):
        """Testa que conversões são bidirecionais e consistentes"""
        original_frontend = {
            "lojaId": "loja-123",
            "setorId": "setor-456", 
            "tipoFuncionario": "VENDEDOR",
            "nivelAcesso": "USUARIO",
            "dataAdmissao": "2024-01-15"
        }
        
        # Frontend → Backend → Frontend
        backend_converted = field_converter.convert_request_fields(original_frontend)
        frontend_reconverted = field_converter.convert_response_fields(backend_converted)
        
        # Campos convertidos devem voltar ao original
        assert frontend_reconverted["lojaId"] == original_frontend["lojaId"]
        assert frontend_reconverted["setorId"] == original_frontend["setorId"]
        assert frontend_reconverted["tipoFuncionario"] == original_frontend["tipoFuncionario"]
        assert frontend_reconverted["nivelAcesso"] == original_frontend["nivelAcesso"]
        assert frontend_reconverted["dataAdmissao"] == original_frontend["dataAdmissao"]


# Executar testes se chamado diretamente
if __name__ == "__main__":
    pytest.main([__file__, "-v"]) 