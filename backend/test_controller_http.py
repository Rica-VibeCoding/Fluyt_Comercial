#!/usr/bin/env python3
"""
Teste Controller HTTP Real - Investigar Erro 500
Simula exatamente como FastAPI chama o controller
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import Request, HTTPException
from unittest.mock import Mock
import json

def test_controller_http_simulation():
    """Simula exatamente como FastAPI chama o controller"""
    
    print("🔬 TESTE CONTROLLER HTTP REAL")
    print("=" * 40)
    
    try:
        # Importar controller real
        print("1️⃣ Importando controller...")
        from modules.equipe.controller import router
        from modules.equipe.schemas import FuncionarioCreate
        
        # Simular request FastAPI
        print("\n2️⃣ Simulando request FastAPI...")
        
        # Dados de teste
        dados_http = {
            "nome": "Teste HTTP Controller",
            "email": "teste.http@email.com",
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
        
        print("   📋 Dados HTTP:")
        print(f"      JSON: {json.dumps(dados_http, indent=2, default=str)}")
        
        # Criar objeto Pydantic
        print("\n3️⃣ Criando objeto Pydantic...")
        funcionario_data = FuncionarioCreate(**dados_http)
        print("   ✅ Objeto Pydantic criado")
        
        # Simular request object
        print("\n4️⃣ Simulando Request object...")
        mock_request = Mock(spec=Request)
        mock_request.method = "POST"
        mock_request.url = "http://localhost:8000/api/v1/equipe/"
        print("   ✅ Request mockado")
        
        # Chamar controller diretamente
        print("\n5️⃣ Chamando controller diretamente...")
        
        # Importar a função do controller
        from modules.equipe.controller import criar_funcionario
        
        # Chamar função
        resultado = criar_funcionario(funcionario_data, mock_request)
        
        print("   ✅ CONTROLLER HTTP FUNCIONOU!")
        print(f"      ID: {resultado.get('id', 'N/A')}")
        print(f"      Nome: {resultado.get('nome', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO CONTROLLER HTTP: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

def test_middlewares_simulation():
    """Testa se algum middleware está causando problema"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE MIDDLEWARES")
    print("=" * 40)
    
    try:
        print("1️⃣ Testando imports de middlewares...")
        
        # Testar imports que podem estar no main.py
        try:
            from middleware.field_converter import FieldConverterMiddleware
            print("   ✅ FieldConverterMiddleware importado")
        except Exception as e:
            print(f"   ⚠️ Problema com FieldConverter: {e}")
        
        # Testar CORS
        try:
            from fastapi.middleware.cors import CORSMiddleware
            print("   ✅ CORSMiddleware importado")
        except Exception as e:
            print(f"   ⚠️ Problema com CORS: {e}")
        
        print("\n2️⃣ Testando configurações de middleware...")
        
        # Simular aplicação FastAPI
        from fastapi import FastAPI
        app = FastAPI()
        
        # Adicionar middlewares como no main.py
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        print("   ✅ Middlewares adicionados sem erro")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NOS MIDDLEWARES: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_auth_dependency():
    """Testa se problema está na dependência de auth"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE DEPENDÊNCIA AUTH")
    print("=" * 40)
    
    try:
        print("1️⃣ Testando import auth...")
        from core.auth import get_current_user
        print("   ✅ get_current_user importado")
        
        print("\n2️⃣ Simulando usuário autenticado...")
        # Simular token/usuário
        mock_user = {
            "sub": "test-user-id",
            "email": "test@email.com"
        }
        print(f"   ✅ Usuário mockado: {mock_user}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NA AUTH: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Investigando erro 500 HTTP\n")
    
    # Teste 1: Controller HTTP direto
    controller_ok = test_controller_http_simulation()
    
    # Teste 2: Middlewares
    middleware_ok = test_middlewares_simulation()
    
    # Teste 3: Auth dependency
    auth_ok = test_auth_dependency()
    
    print("\n" + "=" * 40)
    print("📊 DIAGNÓSTICO HTTP")
    print("=" * 40)
    print(f"Controller HTTP:  {'✅ OK' if controller_ok else '❌ FALHA'}")
    print(f"Middlewares:      {'✅ OK' if middleware_ok else '❌ FALHA'}")
    print(f"Auth Dependency:  {'✅ OK' if auth_ok else '❌ FALHA'}")
    
    if all([controller_ok, middleware_ok, auth_ok]):
        print("\n🎯 TODOS COMPONENTES HTTP OK")
        print("   Erro 500 pode ser:")
        print("   - Problema de headers HTTP")
        print("   - Erro de serialização JSON")
        print("   - Exception não capturada")
    else:
        print("\n🎯 PROBLEMA IDENTIFICADO")
        if not controller_ok:
            print("   ❌ Controller tem problema")
        if not middleware_ok:
            print("   ❌ Middleware tem problema") 
        if not auth_ok:
            print("   ❌ Auth dependency tem problema") 