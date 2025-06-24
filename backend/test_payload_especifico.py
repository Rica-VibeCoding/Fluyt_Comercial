#!/usr/bin/env python3
"""
Teste com payload específico do frontend
"""
import requests
import json

def teste_payload_especifico():
    """Testa com o payload exato que o frontend está enviando"""
    print("🧪 TESTANDO PAYLOAD ESPECÍFICO DO FRONTEND")
    print("=" * 50)
    
    # 1. Login
    print("🔐 Fazendo login...")
    login_response = requests.post(
        "http://localhost:8000/api/v1/auth/login",
        json={
            "email": "ricardo.nilton@hotmail.com",
            "password": "123456"
        },
        timeout=10
    )
    
    if login_response.status_code != 200:
        print(f"❌ Login falhou: {login_response.status_code}")
        return
    
    token = login_response.json().get('access_token')
    print(f"✅ Login OK! Token: {token[:20]}...")
    
    # 2. Headers exatos do frontend
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json", 
        "Authorization": f"Bearer {token}"
    }
    
    # 3. Payload EXATO do frontend (do log)
    payload_frontend = {
        "nome": "Fernando",
        "email": "conectamovelmar@gmail.com",
        "telefone": "(11) 99360-2718",
        "perfil": "VENDEDOR",
        "nivel_acesso": "USUARIO",
        "loja_id": "f486a675-06a1-4162-91e3-3b8b96690ed6",
        "setor_id": "b54209a6-50ac-41f6-bf2c-996b6fe0bf2d",
        "data_admissao": "2025-06-24",
        "salario": 2000,
        "comissao_percentual_vendedor": 5
    }
    
    print(f"\n📦 Payload exato do frontend:")
    print(json.dumps(payload_frontend, indent=2))
    
    # 4. Teste da requisição
    print(f"\n📡 Enviando requisição para: http://localhost:8000/api/v1/equipe")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/equipe/",
            json=payload_frontend,
            headers=headers,
            timeout=30
        )
        
        print(f"📡 Status: {response.status_code}")
        print(f"📄 Response: {response.text}")
        
        if response.status_code == 201:
            funcionario = response.json()
            print(f"✅ SUCESSO! Funcionário criado: {funcionario.get('id')}")
            
            # Limpar teste
            delete_response = requests.delete(
                f"http://localhost:8000/api/v1/equipe/{funcionario.get('id')}",
                headers=headers
            )
            
            if delete_response.status_code == 200:
                print("✅ Funcionário de teste removido")
                
        else:
            print(f"❌ ERRO: {response.status_code}")
            try:
                error_data = response.json()
                print(f"🔍 Detalhes: {json.dumps(error_data, indent=2)}")
            except:
                print(f"🔍 Response raw: {response.text}")
    
    except Exception as e:
        print(f"❌ EXCEÇÃO: {str(e)}")
        print(f"🔍 Tipo: {type(e).__name__}")

if __name__ == "__main__":
    teste_payload_especifico() 