#!/usr/bin/env python3
"""
🔐 TESTE DIRETO DE LOGIN
Testa o endpoint de login diretamente
"""

import requests
import json
import time

def test_login():
    """Testa login diretamente no backend"""
    print("🔐 TESTANDO LOGIN DIRETO...")
    print("=" * 50)
    
    # Aguardar backend inicializar
    print("⏳ Aguardando backend inicializar...")
    time.sleep(3)
    
    # Dados de login
    login_data = {
        "email": "ricardo.nilton@hotmail.com",
        "password": "123456"  # Senha padrão temporária
    }
    
    url = "http://localhost:8000/api/v1/auth/login"
    
    print(f"🌐 URL: {url}")
    print(f"📧 Email: {login_data['email']}")
    print(f"🔑 Senha: {login_data['password']}")
    print()
    
    try:
        print("📡 Enviando requisição...")
        response = requests.post(
            url, 
            json=login_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        try:
            response_data = response.json()
            print(f"📄 Response Body:")
            print(json.dumps(response_data, indent=2, ensure_ascii=False))
        except:
            print(f"📄 Response Text: {response.text}")
        
        if response.status_code == 200:
            print("\n🎉 LOGIN SUCESSO!")
            return True
        else:
            print(f"\n❌ LOGIN FALHOU - Status: {response.status_code}")
            return False
            
    except requests.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao backend")
        print("💡 Certifique-se de que o backend está rodando em http://localhost:8000")
        return False
    except requests.Timeout:
        print("❌ Erro: Timeout na requisição")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    success = test_login()
    
    if success:
        print("\n✅ SISTEMA DE LOGIN FUNCIONANDO!")
    else:
        print("\n🔧 AINDA PRECISA VERIFICAR A SENHA NO SUPABASE AUTH")
        print("📝 Ações necessárias:")
        print("1. Acesse o Supabase Dashboard")
        print("2. Vá em Authentication → Users")
        print("3. Clique no usuário ricardo.nilton@hotmail.com")
        print("4. Redefina a senha para '123456'")
        print("5. Ou crie o usuário se não existir") 