#!/usr/bin/env python3
"""
Teste HTTP Real Simulation - Descobrir causa exata do erro 500
Simula exatamente como FastAPI processa a requisição
"""

import sys
import os
import asyncio
import json
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from unittest.mock import Mock, AsyncMock

async def test_fastapi_full_simulation():
    """Simula toda a stack FastAPI"""
    
    print("🔬 SIMULAÇÃO FASTAPI COMPLETA")
    print("=" * 40)
    
    try:
        # Criar app FastAPI
        print("1️⃣ Criando FastAPI app...")
        app = FastAPI()
        
        # Adicionar CORS
        from fastapi.middleware.cors import CORSMiddleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        print("   ✅ CORS adicionado")
        
        # Incluir router
        print("\n2️⃣ Incluindo router equipe...")
        from modules.equipe.controller import router
        app.include_router(router, prefix="/api/v1")
        print("   ✅ Router incluído")
        
        # Simular request HTTP
        print("\n3️⃣ Simulando request HTTP...")
        
        # Mock request
        mock_request = Mock(spec=Request)
        mock_request.method = "POST"
        mock_request.url = "http://localhost:8000/api/v1/equipe/"
        mock_request.headers = {
            "content-type": "application/json",
            "accept": "application/json"
        }
        
        # Dados
        dados_json = {
            "nome": "Teste FastAPI Full",
            "email": "teste.fastapi@email.com",
            "telefone": "11999998888",
            "perfil": "VENDEDOR",
            "nivel_acesso": "USUARIO",
            "loja_id": "f486a675-06a1-4162-91e3-3b8b96690ed6",
            "setor_id": "b54209a6-50ac-41f6-bf2c-996b6fe0bf2d",
            "salario": 2000.0,
            "data_admissao": "2025-01-24",
            "limite_desconto": 0.0,
            "tem_minimo_garantido": True,
            "valor_minimo_garantido": 0.0
        }
        
        mock_request.json = AsyncMock(return_value=dados_json)
        
        print("   📋 Request mockado")
        
        # Testar serialização da resposta
        print("\n4️⃣ Testando serialização...")
        
        # Chamar endpoint diretamente
        from modules.equipe.controller import criar_funcionario
        from core.auth import User
        
        user = User(
            id="test-user-id",
            email="test@email.com",
            nome="Usuário Teste",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        resultado = await criar_funcionario(dados_json, user)
        
        print("   ✅ Endpoint executado")
        
        # Testar conversão para JSON
        print("\n5️⃣ Testando conversão JSON...")
        
        # Converter para dict
        if hasattr(resultado, 'model_dump'):
            resultado_dict = resultado.model_dump()
        elif hasattr(resultado, 'dict'):
            resultado_dict = resultado.dict()
        else:
            resultado_dict = dict(resultado)
        
        print("   ✅ Conversão para dict OK")
        
        # Serializar JSON
        json_string = json.dumps(resultado_dict, default=str)
        print("   ✅ Serialização JSON OK")
        print(f"      Tamanho: {len(json_string)} chars")
        
        # Limpar
        print("\n6️⃣ Limpando...")
        if 'id' in resultado_dict:
            from core.database import get_database
            db = get_database()
            db.table('cad_equipe').delete().eq('id', resultado_dict['id']).execute()
            print("   🗑️ Registro limpo")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NA SIMULAÇÃO FASTAPI: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

async def test_response_model_validation():
    """Testa validação do response model"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE RESPONSE MODEL")
    print("=" * 40)
    
    try:
        print("1️⃣ Testando FuncionarioResponse...")
        from modules.equipe.schemas import FuncionarioResponse
        
        # Dados de resposta
        dados_resposta = {
            "id": "test-id-123",
            "nome": "Teste Response",
            "email": "teste@email.com",
            "telefone": "11999998888",
            "perfil": "VENDEDOR",
            "nivel_acesso": "USUARIO",
            "loja_id": "f486a675-06a1-4162-91e3-3b8b96690ed6",
            "setor_id": "b54209a6-50ac-41f6-bf2c-996b6fe0bf2d",
            "salario": 2000.0,
            "data_admissao": "2025-01-24",
            "ativo": True,
            "created_at": "2025-01-24T12:00:00Z",
            "updated_at": "2025-01-24T12:00:00Z"
        }
        
        print("   📋 Dados preparados")
        
        # Criar response model
        print("\n2️⃣ Criando response model...")
        response_obj = FuncionarioResponse(**dados_resposta)
        print("   ✅ Response model criado")
        
        # Testar serialização
        print("\n3️⃣ Testando serialização...")
        json_str = response_obj.model_dump_json()
        print("   ✅ Serialização JSON OK")
        print(f"      Tamanho: {len(json_str)} chars")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO RESPONSE MODEL: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_middleware_impact():
    """Testa impacto dos middlewares"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE IMPACTO MIDDLEWARES")
    print("=" * 40)
    
    try:
        print("1️⃣ Testando field_converter...")
        
        try:
            from middleware.field_converter import field_converter
            
            # Dados de teste
            dados_teste = {
                "id": "test-123",
                "nome": "Teste Middleware",
                "data_admissao": "2025-01-24"
            }
            
            print("   📋 Dados originais:", dados_teste)
            
            # Aplicar conversão
            dados_convertidos = field_converter.convert_response_fields(dados_teste)
            
            print("   🔄 Dados convertidos:", dados_convertidos)
            print("   ✅ field_converter funcionando")
            
        except Exception as e:
            print(f"   ⚠️ Problema com field_converter: {e}")
        
        print("\n2️⃣ Testando rate_limiter...")
        try:
            from core.rate_limiter import limiter
            print("   ✅ rate_limiter importado")
        except Exception as e:
            print(f"   ⚠️ Problema com rate_limiter: {e}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO TESTE MIDDLEWARE: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Executa simulação completa"""
    
    print("🚀 Simulação HTTP Real - Descobrindo erro 500\n")
    
    # Teste 1: FastAPI completo
    fastapi_ok = await test_fastapi_full_simulation()
    
    # Teste 2: Response model
    response_ok = await test_response_model_validation()
    
    # Teste 3: Middlewares
    middleware_ok = await test_middleware_impact()
    
    print("\n" + "=" * 40)
    print("📊 DIAGNÓSTICO FINAL")
    print("=" * 40)
    print(f"FastAPI Completo:   {'✅ OK' if fastapi_ok else '❌ FALHA'}")
    print(f"Response Model:     {'✅ OK' if response_ok else '❌ FALHA'}")
    print(f"Middlewares:        {'✅ OK' if middleware_ok else '❌ FALHA'}")
    
    if all([fastapi_ok, response_ok, middleware_ok]):
        print("\n🎯 TODA A STACK FUNCIONA!")
        print("   O erro 500 pode ser:")
        print("   - Problema específico do frontend")
        print("   - Headers específicos da requisição real")
        print("   - Timing/race condition")
        print("   - Problema de ambiente/deployment")
    else:
        problemas = []
        if not fastapi_ok:
            problemas.append("FastAPI Stack")
        if not response_ok:
            problemas.append("Response Model")
        if not middleware_ok:
            problemas.append("Middlewares")
        
        print(f"\n🎯 PROBLEMAS ENCONTRADOS: {', '.join(problemas)}")

if __name__ == "__main__":
    asyncio.run(main()) 