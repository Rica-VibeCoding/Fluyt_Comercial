#!/usr/bin/env python3
"""
Teste rápido de login - verificar credenciais
"""
import requests
import json

def testar_login_rapido():
    """Teste direto de login via API"""
    print("🔐 Teste Rápido de Login")
    print("=" * 30)
    
    # URL da API
    url = "http://localhost:8000/api/v1/auth/login"
    
    # Credenciais para testar
    credenciais = [
        {"email": "ricardo.nilton@hotmail.com", "password": "123456"},
        {"email": "admin@fluyt.com.br", "password": "Admin@123"},
        {"email": "ricardo@fluyt.com", "password": "123456"}
    ]
    
    for i, cred in enumerate(credenciais, 1):
        print(f"\n{i}. Testando: {cred['email']}")
        
        try:
            response = requests.post(url, json=cred, timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Login OK!")
                print(f"   Usuário: {data.get('user', {}).get('nome', 'N/A')}")
                print(f"   Token: {data.get('access_token', '')[:20]}...")
                return cred, data.get('access_token')
                
            elif response.status_code == 401:
                print(f"   ❌ Credenciais inválidas")
                
            else:
                print(f"   ❌ Erro {response.status_code}: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Backend não está rodando")
            return None, None
            
        except Exception as e:
            print(f"   ❌ Erro: {str(e)}")
    
    print("\n❌ Nenhuma credencial funcionou")
    return None, None

if __name__ == "__main__":
    cred_valida, token = testar_login_rapido()
    
    if cred_valida:
        print(f"\n✅ Credencial válida encontrada: {cred_valida['email']}")
    else:
        print("\n❌ Nenhuma credencial válida encontrada") 