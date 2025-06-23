import requests
import json

# Primeiro fazer login para pegar o token
print("🔐 Fazendo login...")
login_url = "http://localhost:8000/api/v1/auth/login"
login_payload = {
    "email": "ricardo.nilton@hotmail.com",
    "password": "123456"
}

try:
    login_response = requests.post(login_url, json=login_payload)
    print(f"Login Status: {login_response.status_code}")
    
    if login_response.status_code == 200:
        login_data = login_response.json()
        token = login_data["access_token"]
        print("✅ Login realizado com sucesso")
        
        # Agora testar a listagem de equipe
        print("\n📋 Testando listagem de equipe...")
        equipe_url = "http://localhost:8000/api/v1/equipe"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        equipe_response = requests.get(equipe_url, headers=headers)
        print(f"Equipe Status: {equipe_response.status_code}")
        print(f"Equipe Response: {equipe_response.text}")
        
    else:
        print(f"❌ Erro no login: {login_response.text}")
        
except Exception as e:
    print(f"❌ Erro na requisição: {e}") 