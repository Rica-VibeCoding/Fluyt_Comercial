#!/usr/bin/env python3
"""
🔍 TESTE SIMPLES DO BACKEND
Testa se o backend está respondendo
"""

import requests
import json

def test_backend():
    """Testa endpoints básicos do backend"""
    print("🔍 TESTANDO BACKEND SIMPLES...")
    print("=" * 50)
    
    # Teste 1: Root endpoint
    print("1️⃣ Testando endpoint raiz...")
    try:
        response = requests.get("http://localhost:8000/", timeout=5)
        print(f"   📊 Status: {response.status_code}")
        print(f"   📄 Response: {response.text[:100]}...")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Teste 2: Health check
    print("\n2️⃣ Testando health check...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"   📊 Status: {response.status_code}")
        print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Teste 3: Docs
    print("\n3️⃣ Testando docs...")
    try:
        response = requests.get("http://localhost:8000/docs", timeout=5)
        print(f"   📊 Status: {response.status_code}")
        print(f"   📄 Type: {response.headers.get('content-type', 'unknown')}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Teste 4: Test connection auth
    print("\n4️⃣ Testando auth test-connection...")
    try:
        response = requests.get("http://localhost:8000/api/v1/auth/test-connection", timeout=5)
        print(f"   📊 Status: {response.status_code}")
        try:
            data = response.json()
            print(f"   📄 Response: {json.dumps(data, indent=2)}")
        except:
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")
    
    # Teste 5: Login com dados corretos
    print("\n5️⃣ Testando login...")
    try:
        login_data = {
            "email": "ricardo.nilton@hotmail.com",
            "password": "123456"
        }
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json=login_data,
            timeout=10
        )
        print(f"   📊 Status: {response.status_code}")
        try:
            data = response.json()
            print(f"   📄 Response: {json.dumps(data, indent=2)}")
        except:
            print(f"   📄 Response: {response.text}")
    except Exception as e:
        print(f"   ❌ Erro: {e}")

if __name__ == "__main__":
    test_backend() 