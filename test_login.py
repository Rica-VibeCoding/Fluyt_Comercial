import requests
import json

# Teste de login
url = "http://localhost:8000/api/v1/auth/login"
payload = {
    "email": "ricardo.nilton@hotmail.com",
    "password": "123456"
}

try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Erro na requisição: {e}") 