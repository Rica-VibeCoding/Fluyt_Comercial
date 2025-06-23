import requests
import json

# Teste com maior timeout e tratamento de erros
try:
    # Login
    print("🔐 Fazendo login...")
    login_response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json={"email": "ricardo.nilton@hotmail.com", "password": "123456"},
        timeout=10
    )
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        print("✅ Login OK")
        
        # Testar equipe com timeout maior
        print("📋 Testando equipe...")
        equipe_response = requests.get(
            "http://localhost:8000/api/v1/equipe",
            headers={"Authorization": f"Bearer {token}"},
            timeout=30  # Timeout maior
        )
        
        print(f"Status: {equipe_response.status_code}")
        print(f"Headers: {dict(equipe_response.headers)}")
        print(f"Response: {equipe_response.text}")
        
    else:
        print(f"❌ Login falhou: {login_response.status_code}")
        print(f"Response: {login_response.text}")
        
except requests.exceptions.Timeout:
    print("⏰ Timeout - provavelmente erro interno no backend")
except requests.exceptions.ConnectionError as e:
    print(f"🔌 Erro de conexão: {e}")
except Exception as e:
    print(f"❌ Erro: {e}") 