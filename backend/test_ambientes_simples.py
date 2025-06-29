"""
Teste simples do endpoint de importação XML
"""
import requests

# URL base da API
BASE_URL = "http://localhost:8000/api/v1"

# Fazer login primeiro (ajuste as credenciais)
login_data = {
    "email": "admin@fluyt.com",  # Use suas credenciais
    "password": "admin123"
}

# Fazer login
login_response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
if login_response.status_code == 200:
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("✅ Login realizado com sucesso")
else:
    print("❌ Erro no login:", login_response.json())
    exit()

# Testar endpoint de importação
print("\n📋 Testando endpoint /ambientes/importar-xml")
print("GET /docs para ver documentação interativa")
print("POST /api/v1/ambientes/importar-xml com arquivo XML")