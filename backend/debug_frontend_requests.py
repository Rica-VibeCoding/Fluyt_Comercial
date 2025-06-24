#!/usr/bin/env python3
"""
Debug Frontend Requests - Simula exatamente o que o frontend faz
"""
import requests
import json

def testar_como_frontend():
    """Simula requests exatamente como o frontend faz"""
    print("🔍 SIMULANDO REQUESTS DO FRONTEND")
    print("=" * 50)
    
    # 1. Login (como frontend faz)
    print("\n1️⃣ Login como frontend...")
    login_response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json={
            "email": "ricardo.nilton@hotmail.com", 
            "password": "123456"
        },
        headers={"Content-Type": "application/json"}
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login falhou: {login_response.status_code}")
        return
    
    token = login_response.json().get('access_token')
    print(f"✅ Token obtido: {token[:20]}...")
    
    # 2. Headers como frontend usa
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 3. Testar criação com dados EXATAMENTE como frontend envia
    print("\n2️⃣ Criando funcionário como frontend...")
    
    # Dados em camelCase (como frontend envia)
    dados_frontend = {
        "nome": "Teste Frontend Simulation",
        "email": "teste.frontend.sim@fluyt.com",
        "telefone": "11999999999",
        "tipoFuncionario": "VENDEDOR",  # camelCase
        "nivelAcesso": "USUARIO",       # camelCase
        "lojaId": "317c3115-e071-40a6-9bc5-7c3227e0d82c",  # camelCase
        "salario": 3000.00,
        "dataAdmissao": "2025-01-15"    # camelCase
    }
    
    print(f"📦 Dados enviados (camelCase): {json.dumps(dados_frontend, indent=2)}")
    
    # Request exatamente como frontend faz
    create_response = requests.post(
        "http://localhost:8000/api/v1/equipe/",
        json=dados_frontend,
        headers=headers,
        timeout=30  # Mesmo timeout que frontend usa
    )
    
    print(f"📡 Status: {create_response.status_code}")
    print(f"📄 Response: {create_response.text}")
    
    if create_response.status_code == 201:
        funcionario = create_response.json()
        funcionario_id = funcionario.get('id')
        print(f"✅ Funcionário criado! ID: {funcionario_id}")
        
        # 4. Testar listagem
        print("\n3️⃣ Listando funcionários...")
        list_response = requests.get(
            "http://localhost:8000/api/v1/equipe/",
            headers=headers
        )
        
        if list_response.status_code == 200:
            data = list_response.json()
            print(f"✅ Listagem OK! Total: {data.get('total')}")
        
        # 5. Limpar teste
        print(f"\n4️⃣ Removendo funcionário teste...")
        delete_response = requests.delete(
            f"http://localhost:8000/api/v1/equipe/{funcionario_id}",
            headers=headers
        )
        
        if delete_response.status_code == 200:
            print("✅ Funcionário removido")
    
    else:
        print(f"❌ Erro na criação: {create_response.status_code}")
        try:
            error_data = create_response.json()
            print(f"🔍 Erro específico: {error_data}")
        except:
            print(f"🔍 Response raw: {create_response.text}")

def testar_diferentes_urls():
    """Testa diferentes URLs que frontend pode estar usando"""
    print("\n" + "=" * 50)
    print("🌐 TESTANDO DIFERENTES URLs")
    print("=" * 50)
    
    urls = [
        "http://localhost:8000/api/v1/equipe/test/public",
        "http://127.0.0.1:8000/api/v1/equipe/test/public",
        "http://0.0.0.0:8000/api/v1/equipe/test/public"
    ]
    
    for url in urls:
        try:
            response = requests.get(url, timeout=5)
            print(f"✅ {url} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ {url} - Erro: {str(e)}")

if __name__ == "__main__":
    testar_como_frontend()
    testar_diferentes_urls() 