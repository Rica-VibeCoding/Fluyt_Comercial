#!/usr/bin/env python3
"""
Teste direto do endpoint de login
"""

import requests
import json

print("🔐 Testando login direto no backend...\n")

# Dados de login
login_data = {
    "email": "ricardo.nilton@hotmail.com",
    "password": "senha123"
}

try:
    # Fazer requisição
    response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json=login_data,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 500:
        print("\n❌ Erro 500 - Internal Server Error")
        print("Resposta do servidor:")
        try:
            error_data = response.json()
            print(json.dumps(error_data, indent=2))
        except:
            print(response.text)
    elif response.status_code == 200:
        print("\n✅ Login bem-sucedido!")
        data = response.json()
        print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
    else:
        print(f"\n⚠️  Status inesperado: {response.status_code}")
        print("Resposta:", response.text)
        
except requests.exceptions.ConnectionError:
    print("❌ Não foi possível conectar ao backend!")
    print("Certifique-se de que o backend está rodando com:")
    print("  cd backend && python main.py")
except Exception as e:
    print(f"❌ Erro: {str(e)}")