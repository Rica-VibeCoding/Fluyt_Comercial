"""
Teste de integração básico - Módulo Ambientes
"""
import pytest
from httpx import AsyncClient
from main import app


@pytest.mark.asyncio
async def test_fluxo_completo_ambiente():
    """Teste de integração do fluxo completo de ambientes"""
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        # 1. Listar ambientes
        response = await client.get("/api/ambientes")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        
        # 2. Criar ambiente
        novo_ambiente = {
            "clienteId": "550e8400-e29b-41d4-a716-446655440000",
            "nome": "Cozinha Teste Integração",
            "valorCustoFabrica": 1500.00,
            "valorVenda": 2500.00,
            "origem": "manual"
        }
        
        response = await client.post("/api/ambientes", json=novo_ambiente)
        if response.status_code == 201:
            ambiente_criado = response.json()
            ambiente_id = ambiente_criado["id"]
            
            # 3. Buscar ambiente criado
            response = await client.get(f"/api/ambientes/{ambiente_id}")
            assert response.status_code == 200
            
            # 4. Atualizar ambiente
            atualizacao = {"nome": "Cozinha Atualizada"}
            response = await client.put(f"/api/ambientes/{ambiente_id}", json=atualizacao)
            assert response.status_code in [200, 204]
            
            # 5. Deletar ambiente
            response = await client.delete(f"/api/ambientes/{ambiente_id}")
            assert response.status_code in [200, 204]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])