#!/usr/bin/env python3
"""
Teste Controller HTTP Async - Investigar Erro 500
Testa controller com async/await correto
"""

import sys
import os
import asyncio
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import Request, HTTPException
from unittest.mock import Mock
import json

async def test_controller_http_async():
    """Testa controller HTTP com async correto"""
    
    print("🔬 TESTE CONTROLLER HTTP ASYNC")
    print("=" * 40)
    
    try:
        # Importar controller real
        print("1️⃣ Importando controller...")
        from modules.equipe.controller import criar_funcionario
        from modules.equipe.schemas import FuncionarioCreate
        from core.auth import User
        
        # Dados de teste
        print("\n2️⃣ Preparando dados...")
        dados_http = {
            "nome": "Teste HTTP Async",
            "email": "teste.async@email.com",
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
        
        print("   📋 Dados preparados")
        
        # Criar usuário mock
        print("\n3️⃣ Criando usuário mock...")
        mock_user = User(
            id="test-user-id",
            email="test@email.com",
            nome="Usuário Teste",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        print("   ✅ Usuário mock criado")
        
        # Chamar controller async
        print("\n4️⃣ Chamando controller async...")
        resultado = await criar_funcionario(dados_http, mock_user)
        
        print("   ✅ CONTROLLER ASYNC FUNCIONOU!")
        print(f"      ID: {getattr(resultado, 'id', 'N/A')}")
        print(f"      Nome: {getattr(resultado, 'nome', 'N/A')}")
        
        # Limpar registro de teste se criado
        print("\n5️⃣ Limpando registro...")
        if hasattr(resultado, 'id'):
            from core.database import get_database
            db = get_database()
            db.table('cad_equipe').delete().eq('id', resultado.id).execute()
            print("   🗑️ Registro limpo")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO CONTROLLER ASYNC: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

async def test_services_direct():
    """Testa services diretamente"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE SERVICES DIRETO")
    print("=" * 40)
    
    try:
        print("1️⃣ Importando services...")
        from modules.equipe.services import FuncionarioService
        from modules.equipe.schemas import FuncionarioCreate
        from core.auth import User
        
        # Criar service
        service = FuncionarioService()
        print("   ✅ Service criado")
        
        # Dados de teste
        print("\n2️⃣ Preparando dados...")
        dados = FuncionarioCreate(
            nome="Teste Services Direct",
            email="teste.services@email.com",
            telefone="11999998888",
            perfil="VENDEDOR",
            nivel_acesso="USUARIO",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6",
            setor_id="b54209a6-50ac-41f6-bf2c-996b6fe0bf2d",
            salario=2000.0,
            data_admissao="2025-01-24",
            limite_desconto=0.0,
            tem_minimo_garantido=True,
            valor_minimo_garantido=0.0
        )
        
        # Usuário mock
        user = User(
            id="test-user-id",
            email="test@email.com", 
            nome="Usuário Teste",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        print("   📋 Dados e usuário preparados")
        
        # Chamar service
        print("\n3️⃣ Chamando service...")
        resultado = service.criar_funcionario(dados, user)
        
        print("   ✅ SERVICE FUNCIONOU!")
        print(f"      ID: {getattr(resultado, 'id', 'N/A')}")
        print(f"      Nome: {getattr(resultado, 'nome', 'N/A')}")
        
        # Limpar
        print("\n4️⃣ Limpando...")
        if hasattr(resultado, 'id'):
            from core.database import get_database
            db = get_database()
            db.table('cad_equipe').delete().eq('id', resultado.id).execute()
            print("   🗑️ Registro limpo")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO SERVICE: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_error_handling():
    """Testa tratamento de erros"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE TRATAMENTO ERROS")
    print("=" * 40)
    
    try:
        print("1️⃣ Testando dados inválidos...")
        from modules.equipe.controller import criar_funcionario
        from core.auth import User
        
        # Dados inválidos (sem campos obrigatórios)
        dados_invalidos = {
            "email": "apenas.email@test.com"
        }
        
        user = User(
            id="test-user-id",
            email="test@email.com",
            nome="Usuário Teste", 
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        print("\n2️⃣ Enviando dados inválidos...")
        try:
            resultado = await criar_funcionario(dados_invalidos, user)
            print("   ⚠️ Não deveria ter funcionado!")
            return False
        except Exception as e:
            print(f"   ✅ Erro capturado como esperado: {type(e).__name__}")
            print(f"      Mensagem: {str(e)[:100]}...")
            return True
        
    except Exception as e:
        print(f"\n❌ ERRO NO TESTE DE ERROS: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Executa todos os testes async"""
    
    print("🚀 Investigando erro 500 com async\n")
    
    # Teste 1: Controller async
    controller_ok = await test_controller_http_async()
    
    # Teste 2: Services direto
    services_ok = await test_services_direct()
    
    # Teste 3: Tratamento de erros
    error_ok = await test_error_handling()
    
    print("\n" + "=" * 40)
    print("📊 DIAGNÓSTICO ASYNC")
    print("=" * 40)
    print(f"Controller Async:   {'✅ OK' if controller_ok else '❌ FALHA'}")
    print(f"Services Direto:    {'✅ OK' if services_ok else '❌ FALHA'}")
    print(f"Tratamento Erros:   {'✅ OK' if error_ok else '❌ FALHA'}")
    
    if all([controller_ok, services_ok, error_ok]):
        print("\n🎯 TUDO FUNCIONA COM ASYNC!")
        print("   Erro 500 pode ser:")
        print("   - Middleware interferindo")
        print("   - Headers HTTP inválidos")
        print("   - Problema de serialização JSON")
        print("   - Exception não tratada em runtime")
    else:
        problemas = []
        if not controller_ok:
            problemas.append("Controller")
        if not services_ok:
            problemas.append("Services")
        if not error_ok:
            problemas.append("Error Handling")
        
        print(f"\n🎯 PROBLEMAS: {', '.join(problemas)}")

if __name__ == "__main__":
    asyncio.run(main()) 