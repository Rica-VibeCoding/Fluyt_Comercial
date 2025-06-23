import requests

# Teste super simples da rota de teste
print("🧪 Testando rota de teste...")
try:
    response = requests.get("http://localhost:8000/api/v1/equipe/test/public")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Erro: {e}") 